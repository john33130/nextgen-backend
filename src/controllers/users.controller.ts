import { Request, Response } from 'express';
import { User } from '@prisma/client';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import keyv from '../lib/keyv';
import db from '../lib/db';
import { getUserById, removeSensitiveUserData } from '../helpers/users.helpers';

export interface ChangeUserBody {
	update: {
		name?: string;
		email?: string;
		password?: string;
	};
	password: string;
}

export default {
	':userId': {
		get: async (req: Request, res: Response) => {
			const { userId } = req.params;
			const cacheKey = `cache/users:${userId}`;
			let user: User | undefined;
			if (!(await keyv.has(cacheKey))) {
				user = (await db.user.findUnique({ where: { id: userId } })) as User;
				await keyv.set(cacheKey, JSON.stringify(user));
			} else user = (await keyv.get(cacheKey)) as User;

			res.status(200).json(removeSensitiveUserData(user));
		},
		patch: async (req: Request, res: Response) => {
			// validate body
			const schema = Joi.object({
				update: Joi.object({
					name: Joi.string().label('Name').max(64).optional(),
					email: Joi.string().label('Email').email({ tlds: false }).optional(),
					password: Joi.string()
						.label('Password')
						.min(8)
						.max(256)
						.regex(
							/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/
						)
						.messages({
							'string.pattern.base':
								'Password must contain one uppercase letter, one lowercase letter, one number and one special character',
						})
						.optional(),
				})
					.min(1)
					.messages({ 'object.min': 'Atleast one change should be made' }),

				password: Joi.string().required(),
			});

			const bodyValidation = schema.validate(req.body).error;
			if (bodyValidation) return res.status(400).send({ message: bodyValidation.message });

			const { update, password }: ChangeUserBody = req.body;

			const { userId } = req.params;
			const oldUser = (await getUserById(userId)) as User;

			// make sure values are different
			if (oldUser.name === update.name)
				return res.status(200).json({ message: 'Please make sure your new name is different' });
			if (oldUser.email === update.email)
				return res
					.status(200)
					.json({ message: 'Please make sure your new email is different' });
			if (await bcrypt.compare(update.password || '', oldUser.password))
				return res
					.status(200)
					.json({ message: 'Please make sure your new password is different' });

			// check if valid password is given
			await bcrypt.compare(password, oldUser.password).then((valid) => {
				if (!valid) return res.status(401).json({ message: 'Please provide a valid password' });
				return 0;
			});

			// update user
			const newUser = await db.user.update({
				where: { id: userId },
				data: update,
			});

			return res.status(200).json({
				oldUser: removeSensitiveUserData(oldUser),
				newUser: removeSensitiveUserData(newUser),
			});
		},
	},
};
