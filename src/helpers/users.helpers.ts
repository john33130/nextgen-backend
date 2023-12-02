import { User } from '@prisma/client';
import merge from 'deepmerge';
import db from '../lib/db';
import { SafeUser, UserWithOwnDevices } from '../types';

/**
 * Find a user by searching an id
 * @param id - The id to look for
 */
export async function getUserById(userId: string): Promise<UserWithOwnDevices | null> {
	const user = await db.user.findUnique({ where: { id: userId } });
	const devices: string[] = [];
	(await db.user.findUnique({ where: { id: userId }, select: { device: true } }))?.device.forEach((device) =>
		devices.push(device.id)
	);
	return user ? merge(user, { devices }) : null;
}

/**
 * Find a user by searching an email
 * @param email - The email to look for
 */
export async function getUserByEmail(email: string): Promise<UserWithOwnDevices | null> {
	const user = await db.user.findUnique({ where: { email } });
	const devices: string[] = [];
	(await db.user.findUnique({ where: { email }, select: { device: true } }))?.device.forEach((device) =>
		devices.push(device.id)
	);
	return user ? merge(user, { devices }) : null;
}

/**
 * Delete sensitive data from a user object
 * @param body - The user object
 */
export function removeSensitiveUserData(body: User | UserWithOwnDevices): SafeUser {
	const data: Partial<User> = body;
	delete data.password;
	return data as SafeUser;
}
