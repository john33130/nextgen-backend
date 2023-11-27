import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../lib/db';

export function validateToken(req: Request, res: Response, next: NextFunction) {
	const token = req.cookies.jwt;
	if (!token) {
		res.status(403).json({ message: 'You are not logged in' });
		return res.end();
	}

	jwt.verify(token, process.env.ENCRYPTION_KEY!, (error: unknown) => {
		if (error) {
			res.status(403).json({ message: 'Authentication is invalid' });
			return res.end();
		}

		return next();
	});

	return 0;
}

/**
 * Validate the given user id
 * @param req - The request object
 * @param res  - The response object
 * @param next = The next function
 */
export async function validateUserId(req: Request, res: Response, next: NextFunction) {
	const { userId } = req.params;
	if (!userId || !req.cookies.jwt) return next();
	const token = jwt.decode(req.cookies.jwt) as jwt.JwtPayload;

	const exists = !!(await db.user.findUnique({ where: { id: userId }, select: { id: true } }));
	if (!exists) {
		res.status(400).json({ message: 'User does not exist' });
		return res.send();
	}

	if (userId !== token.userId) {
		res.status(403).json({ message: 'Forbidden' });
		return res.send();
	}

	return next();
}
