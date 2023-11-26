import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.jwt;
	if (token) {
		jwt.verify(token, process.env.ENCRYPTION_KEY!, (error: unknown) => {
			if (error) {
				res.status(403).json({ message: 'Forbidden' });
				res.end();
			}

			return 0;
		});
	} else {
		res.status(403).json({ message: 'Forbidden' });
		return res.end();
	}

	return next();
};
