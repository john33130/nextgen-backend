import { Device } from '@prisma/client';
import ms from 'ms';
import { DeviceMeasurements, SafeDevice } from '../types';
import db from '../lib/db';
import keyv from '../lib/keyv';

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
 * @param deviceId - The id to look for
 */
export async function getDeviceById(deviceId: string): Promise<Device | null> {
	const cacheKey = `cache/users:${deviceId}`;
	let device: Device | null = await keyv.get(cacheKey);
	if (!device) {
		device = await db.device.findUnique({ where: { id: deviceId } });
		await keyv.set(cacheKey, device, ms('30m'));
	}

	return device;
}

/**
 * Extract the measurements from a deviceE
 * @param device - The device object
 */
export function getMeasurements(device: Device): DeviceMeasurements {
	const data: Partial<DeviceMeasurements> = {};
	data.ph = device.ph;
	data.risk = device.risk;
	data.turbidity = device.turbidity;
	data.waterTemperature = device.waterTemperature;
	data.updatedAt = device.updatedAt;
	return data as DeviceMeasurements;
}
