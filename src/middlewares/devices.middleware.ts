import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import db from '../lib/db';

/**
 * Validate if the user can access the device
 * @param req - The request object
 * @param res - The response object
 * @param next - The next function
 */
export async function validatePermissionToDevice(req: Request, res: Response, next: NextFunction) {
	const { deviceId } = req.params;
	if (!deviceId || !req.cookies.jwt) return next(); // nothing to validate
	const token = jwt.decode(req.cookies.jwt) as jwt.JwtPayload; // decode token

	// check if device exists
	const device = await db.device.findUnique({ where: { id: deviceId }, select: { id: true, userId: true } });
	if (!device) {
		res.status(400).json({ message: 'Device does not exist' });
		return res.send();
	}

	// check if token has same user id as the user linked to the device
	if (token.userId !== device.userId) {
		res.status(403).json({ message: 'Forbidden' });
		return res.send();
	}

	return next();
}

/**
 *
 * @param req - The request object
 * @param res  - The response object
 * @param next = The next function
 */
export function validateAccessKey(req: Request, res: Response, next: NextFunction) {
	const { accessKey } = req.query;

	// validate access key
	if (!accessKey) return res.status(400).json({ message: 'No access key provided' });
	if (typeof accessKey !== 'string') return res.status(401).json({ message: '"accessKey" must be a string' });

	// verify jwt key
	jwt.verify(accessKey, process.env.ENCRYPTION_KEY!, async (error) => {
		if (error) return res.status(400).json({ message: 'Failed to authenticate token' });
		const decoded = jwt.decode(accessKey) as jwt.JwtPayload & { deviceId: string };
		const device = await db.device.findUnique({
			where: { id: decoded.deviceId },
			select: { accessKey: true },
		});
		if (!device) return res.status(400).json({ message: 'Device does not exist' });
		if (device.accessKey !== accessKey)
			return res.status(401).json({ message: 'Invalid access key provided' });
		return 0;
	});

	return next();
}
