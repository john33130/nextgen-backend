import { Device } from '@prisma/client';
import { SafeDevice } from '../types';
import db from '../lib/db';

/**
 * Delete sensitive data from a device object
 * @param body - The device object
 */
export function removeSensitiveDeviceData(body: Device): SafeDevice {
	const data: Partial<Device> = body;
	delete data.accessKey;
	return data as SafeDevice;
}

/**
 * Find a device by searching an id
 * @param id - The id to look for
 */
export async function getDeviceById(id: string) {
	const user = await db.device.findUnique({ where: { id } });
	if (!user) throw new Error(`No device found with the id "${id}"`);
	return user;
}
