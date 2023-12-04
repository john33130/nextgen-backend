import { Request, Response } from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import ms from 'ms';
import { getUserByEmail, removeSensitiveUserData } from '../helpers/users.helpers';
import { validateCredentials, setJWT, hash, sendVerificationEmail } from '../helpers/auth.helpers';
import logger from '../lib/logger';
import { SignupUserBody } from '../types';
import keyv from '../lib/keyv';
import db from '../lib/db';

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

				const userId = crypto.randomBytes(4).toString('hex');
				setJWT(res, userId); // set jwt

				const data = {
					id: userId,
					name,
					email,
					password: await hash(password),
				};

				await keyv.set(`temp-users:${userId}`, data, ms('5m')); // email verification

				// check if verification email was already sended
				if (await keyv.has(`verifications/email-send/email:${email}`))
					return res.status(400).json({
						message: 'An verification email was sended to you in the last five minutes',
					});

				const sended = sendVerificationEmail(
					jwt.sign({ userId, email }, process.env.ENCRYPTION_KEY!, {
						expiresIn: ms('5m') / 1000,
					}),
					email
				);
				if (sended) await keyv.set(`verifications/email-send/email:${email}`, {}, ms('5m'));

				res.status(200).json({ message: 'Check your inbox for a validation email' });
			} catch (error) {
				const uuid = crypto.randomUUID();

				logger.warn('Failed to create a new user', {
					uuid,
					error,
					status: 500,
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
					status: 500,
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
	activate: {
		post: async (req: Request, res: Response) => {
			const { token } = req.query;

			// validate token
			if (!token) return res.status(400).json({ message: 'No token provided' });
			if (typeof token !== 'string')
				return res.status(400).json({ message: 'Invalid token provided' });

			// check if token is being used a second time
			if (await keyv.has(`verifications/email-tokens/token:${token}`))
				return res.status(400).json({ message: 'Token has already been used' });

			// verify token
			jwt.verify(token, process.env.ENCRYPTION_KEY!, async (error) => {
				if (error instanceof jwt.TokenExpiredError)
					return res.status(401).json({ message: 'Verification has expired' });
				if (error) return res.status(401).json({ message: 'Authentication is invalid' });
				const decoded = jwt.decode(token) as jwt.JwtPayload & { userId: string };
				// get user from cache
				const data: { id: string; name: string; email: string; password: string } | undefined =
					await keyv.get(`temp-users:${decoded.userId}`);
				// check if user exists in cache
				if (!data) {
					throw new Error(
						'User verification JWT was valid but user was not found in cache'
					);
				}

				await db.user.create({ data: { ...data, activated: true } });

				// keep token in cache for 5 minutes to prevent reusing token
				await keyv.set(`verifications/email-tokens/token:${token}`, data.id, ms('5m'));

				return res.status(201).json({ message: 'User succesfully created' });
			});
			return 0;
		},
	},
};
