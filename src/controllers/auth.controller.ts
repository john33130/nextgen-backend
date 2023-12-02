import { Request, Response } from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import { getUserByEmail, removeSensitiveUserData } from '../helpers/users.helpers';
import { validateCredentials, setJWT, hash } from '../helpers/auth.helpers';
import db from '../lib/db';
import logger from '../lib/logger';
import { SignupUserBody } from '../types';

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
						'string.min': 'Password must be atleast 8 characters',
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
				const user = await db.user.create({
					data: {
						id: userId,
						name,
						email,
						password: await hash(password),
					},
				});

				setJWT(res, userId); // set jwt

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
		post: async (req: Request, res: Response) => {
			// validate body
			const schema = Joi.object({
				email: Joi.string().label('Email').email({ tlds: false }).required(),
				password: Joi.string().label('Password').max(256).required(),
			});

			const bodyValidation = schema.validate(req.body).error;
			if (bodyValidation) return res.status(400).send({ message: bodyValidation.message });

			const { email, password }: SignupUserBody = req.body;
			try {
				// check if the user exists
				const user = await getUserByEmail(email);
				if (!user) {
					const response = { message: 'A user with this email does not exist' };
					return res.status(400).json(response);
				}

				const auth = await validateCredentials(email, password); // check if credentials match
				if (!auth) {
					const response = { message: 'The given credentials do not match' };
					return res.status(401).json(response);
				}
				setJWT(res, user.id);
				res.status(200).json(removeSensitiveUserData(user));
			} catch (error) {
				const uuid = crypto.randomUUID();

				logger.warn('Failed to login a new user', {
					uuid,
					error,
					status: 400,
				});

				res.status(500).json({
					uuid,
					message: 'Failed to login a new user',
				});
			}

			return 0;
		},
	},
	logout: {
		post: (req: Request, res: Response) => {
			res.cookie('jwt', '', { maxAge: 1 });
			res.status(200).json({ message: 'You have been logged out' });
		},
	},
};
