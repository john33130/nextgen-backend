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
export function validateAccessKey(req: Request, res: Response, next: NextFunction) {}
