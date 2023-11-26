import { Request, Response } from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import { getUserByEmail, removeSensitiveUserData } from '../helpers/users.helpers';
import { createToken, hash } from '../helpers/auth.helpers';
import db from '../lib/db';
import config from '../lib/config';
import logger from '../lib/logger';

export interface BaseUserBody {
	name: string;
	email: string;
}

export interface SignupUserBody extends BaseUserBody {
	password: string;
}

export type LoginUserBody = BaseUserBody;

export default {
	signup: {
		post: async (req: Request, res: Response) => {
			// validate body
			const schema = Joi.object({
				name: Joi.string().label('Name').max(64).required(),
				email: Joi.string().label('Email').email({ tlds: false }).required(),
				password: Joi.string()
					.label('Password')
					.min(8)
					.max(256)
					.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/)
					.messages({
						'string.pattern.base':
							'Password must contain one uppercase letter, one lowercase letter, one number and one special character',
					})
					.required(),
			});

			const bodyValidation = schema.validate(req.body).error;
			if (bodyValidation) return res.status(400).send({ message: bodyValidation.message });

			const { name, email, password }: SignupUserBody = req.body;

			try {
				// check if user already exists
				if (await getUserByEmail(email)) {
					const response = { message: 'A user with this email already exists' };
					return res.status(409).json(response);
				}

				// create user
				const userId = crypto.randomBytes(4).toString('hex');
				const token = createToken(userId);
				const user = await db.user.create({
					data: {
						id: userId,
						name,
						email,
						password: await hash(password),
					},
				});

				res.cookie('jwt', token, { httpOnly: true, maxAge: config.auth.expiresIn }); // set jwt cookie
				res.status(201).json(removeSensitiveUserData(user));
			} catch (error) {
				const uuid = crypto.randomUUID();

				logger.warn('Failed to create a new user', {
					uuid,
					error,
					status: 400,
				});

				res.status(500).json({
					uuid,
					message: 'Failed to create a new user',
				});
			}

			return 0;
		},
	},
	login: {
		post: (req: Request, res: Response) => {
			// validate body
			// check if the user exists (no: 400 Bad Request)
			// check given credentials (no: 401 Unauthorized)
			// set cookie
			// return user
			// handle errors
		},
	},
	logout: {
		post: (req: Request, res: Response) => {
			res.cookie('jwt', '', { maxAge: 1 });
			res.status(200).json({ message: 'You have been logged out' });
		},
	},
	'forgot-password': {},
};
