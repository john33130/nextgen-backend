import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../lib/db';

/**
 * Validate if the user can access the user information
 * @param req - The request object
 * @param res  - The response object
 * @param next = The next function
 */
export async function validatePermissionToUser(req: Request, res: Response, next: NextFunction) {
	const { userId } = req.params;
	if (!userId || !req.cookies.jwt) return next(); // nothing to validate
	const token = jwt.decode(req.cookies.jwt) as jwt.JwtPayload; // decode token

	// check if user exists
	const exists = !!(await db.user.findUnique({ where: { id: userId }, select: { id: true } }));
	if (!exists) {
		res.status(400).json({ message: 'User does not exist' });
		return res.send();
	}

	// check if token has same user id
	if (userId !== token.userId) {
		res.status(403).json({ message: 'Forbidden' });
		return res.send();
	}

	return next();
}
