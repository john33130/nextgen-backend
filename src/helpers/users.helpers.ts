import { User } from '@prisma/client';
import db from '../lib/db';
import { SafeUser } from '../types';

/**
 * Find a user by searching an id
 * @param id - The id to look for
 */
export async function getUserById(id: string): Promise<User | null> {
	return db.user.findUnique({ where: { id } });
}

/**
 * Find a user by searching an email
 * @param email - The email to look for
 */
export async function getUserByEmail(email: string): Promise<User | null> {
	return db.user.findUnique({ where: { email } });
}

/**
 * Delete sensitive data from a user object
 * @param body - The user object
 */
export function removeSensitiveUserData(body: User): SafeUser {
	const data: Partial<User> = body;
	delete data.password;
	return data as SafeUser;
}
