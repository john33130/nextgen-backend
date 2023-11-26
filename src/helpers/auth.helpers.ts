import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getUserByEmail } from './users.helpers';
import config from '../lib/config';

/**
 * Check if credentials match the user
 * @param email - The email of the user
 * @param password - The password of the user
 */
export async function checkCredentials(email: string, password: string): Promise<boolean> {
	const user = await getUserByEmail(email);
	return bcrypt.compare(password, user!.password);
}

/**
 * Create a JSON Web Token
 * @param userId - The user id
 */
export function createToken(userId: string): string {
	return jwt.sign({ userId }, process.env.ENCRYPTION_KEY!, {
		expiresIn: config.auth.expiresIn,
	});
}

/**
 * Hash a password for before storing
 * @param password - The password to hash
 */
export async function hash(password: string): Promise<string> {
	const salt = await bcrypt.genSalt();
	return bcrypt.hash(password, salt);
}
