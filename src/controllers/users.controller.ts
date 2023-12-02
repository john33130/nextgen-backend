import { Request, Response } from 'express';
import Joi from 'joi';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import db from '../lib/db';
import { getUserByEmail, getUserById, removeSensitiveUserData } from '../helpers/users.helpers';
import logger from '../lib/logger';
import { UserWithOwnDevices } from '../types';

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
		credentials: {
			get: async (req: Request, res: Response) => {
				const { userId } = req.params;
				const user = (await getUserById(userId)) as UserWithOwnDevices;
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
								'string.min':
									'Password must be atleast 8 characters long',
							})
							.optional(),
					})
						.min(1)
						.messages({ 'object.min': 'Atleast one change should be made' }),

					password: Joi.string().required(),
				});

				const bodyValidation = schema.validate(req.body).error;
				if (bodyValidation) return res.status(400).send({ message: bodyValidation.message });

				const { userId } = req.params;
				const { update, password }: ChangeUserBody = req.body;
				const oldUser = (await getUserById(userId)) as UserWithOwnDevices;

				// check if given values are different
				Object.entries(update).forEach(async ([k, v]) => {
					const oldValue = oldUser[k as 'name' | 'email' | 'password'];
					const validPassword =
						k === 'password' &&
						(await bcrypt.compare(update.password!, oldUser.password));
					if (validPassword || oldValue === v) {
						return res.status(400).json({
							message: 'Please make sure the value you enter is different',
							key: k,
						});
					}

					try {
						// check if email is unique
						if (update.email && !!(await getUserByEmail(update.email))) {
							return res
								.status(400)
								.json({ message: 'This email is already in use' });
						}

						// check if valid password is given
						const auth = await bcrypt.compare(password, oldUser.password);
						if (!auth)
							return res
								.status(401)
								.json({ message: 'The given password is not valid' });

						// update user
						const newUser = await db.user.update({
							where: { id: userId },
							data: update,
						});

						return res.status(200).json({
							oldUser: removeSensitiveUserData(oldUser),
							newUser: removeSensitiveUserData(newUser),
						});
					} catch (error) {
						const uuid = crypto.randomUUID();

						logger.warn('Failed to update a user', {
							uuid,
							error,
							status: 500,
						});

						res.status(500).json({
							uuid,
							message: 'Failed to update the user',
						});
					}

					return 0;
				});

				return 0;
			},
		},
	},
};
