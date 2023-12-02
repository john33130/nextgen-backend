import { Device } from '@prisma/client';
import { DeviceMeasurements, SafeDevice } from '../types';
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
 * @param deviceId - The id to look for
 */
export async function getDeviceById(deviceId: string): Promise<Device | null> {
	return db.device.findUnique({ where: { id: deviceId } });
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
