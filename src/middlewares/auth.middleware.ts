import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

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
