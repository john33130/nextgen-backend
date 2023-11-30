import { User } from '@prisma/client';
import ms from 'ms';
import db from '../lib/db';
import { SafeUser } from '../types';
import keyv from '../lib/keyv';

/**
 * Find a user by searching an id
 * @param id - The id to look for
 */
export async function getUserById(userId: string): Promise<User | null> {
	const cacheKey = `cache/users:${userId}`;
	let user: User | null = await keyv.get(cacheKey);
	if (!user) {
		user = await db.user.findUnique({ where: { id: userId } });
		await keyv.set(cacheKey, user, ms('30m'));
	}

	return user;
}

/**
 * Find a user by searching an email
 * @param email - The email to look for
 */
export async function getUserByEmail(email: string): Promise<User | null> {
	const user = await db.user.findUnique({ where: { email } });
	if (user) await keyv.set(`cache/users:${user.id}`, user, ms('30m'));
	return user;
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
