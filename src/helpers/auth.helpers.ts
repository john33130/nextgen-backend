import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { getUserByEmail } from './users.helpers';
import config from '../lib/config';

/**
 * Check if credentials match the user
 * @param email - The email of the user
 * @param password - The password of the user
 */
export async function validateCredentials(email: string, password: string): Promise<boolean> {
	const user = await getUserByEmail(email);
	return bcrypt.compare(password, user!.password);
}

/**
 * Hash a password for before storing
 * @param password - The password to hash
 */
export async function hash(password: string): Promise<string> {
	const salt = await bcrypt.genSalt();
	return bcrypt.hash(password, salt);
}

/**
 * Set a JSON Web Token
 * @param res - The response object
 * @param userId - The user id
 */
export function setJWT(res: Response, userId: string) {
	const token = jwt.sign({ userId }, process.env.ENCRYPTION_KEY!, { expiresIn: config.auth.expiresIn });
	res.cookie('jwt', token, { httpOnly: true, maxAge: config.auth.expiresIn });
}
