import { Request, Response } from 'express';
import crypto from 'crypto';
import Joi from 'joi';
import { Device } from '@prisma/client';
import containsEmoji from 'contains-emoji';
import db from '../lib/db';
import { getDeviceById, removeSensitiveDeviceData } from '../helpers/devices.helpers';
import logger from '../lib/logger';

export interface UpdateDeviceBody {
	update: {
		name?: string;
		emoji?: string;
	};
}

export default {
	':deviceId': {
		credentials: {
			get: async (req: Request, res: Response) => {
				const { deviceId } = req.params;

				try {
					return res
						.status(200)
						.json(await db.device.findUnique({ where: { id: deviceId } }));
				} catch (error) {
					const uuid = crypto.randomUUID();

					logger.warn('Failed to get all device measurements', {
						uuid,
						error,
						status: 500,
					});

					res.status(500).json({
						uuid,
						message: 'Failed to get all device measurements',
					});
				}

				return 0;
			},

			patch: async (req: Request, res: Response) => {
				// validate body
				const schema = Joi.object({
					update: Joi.object({
						name: Joi.string().max(32).optional(),
						emoji: Joi.string().length(2).optional(),
					})
						.min(1)
						.required(),
				});

				const bodyValidation = schema.validate(req.body).error;
				if (bodyValidation) return res.status(400).send({ message: bodyValidation.message });

				const { deviceId } = req.params;
				const { update }: UpdateDeviceBody = req.body;
				const oldDevice = (await getDeviceById(deviceId)) as Device;
				const oldData = {
					name: oldDevice.name,
					emoji: oldDevice.emoji,
				};

				// check if emoji field is emoji
				if (update.emoji && !containsEmoji(update.emoji)) {
					return res.status(400).json({ message: 'Invalid emoji' });
				}

				// check if values have changed
				if (oldData.name === update.name && oldData.emoji === update.emoji) {
					return res.status(200).json({ message: 'No new values' });
				}

				const newDevice = await db.device.update({ where: { id: deviceId }, data: update });

				return res.status(200).json({
					oldDevice: oldData,
					newDevice: {
						name: newDevice.name,
						emoji: newDevice.emoji,
					},
				});
			},
		},
		measurements: {
			get: async (req: Request, res: Response) => {
				if (!req.params.deviceId) res.status(400).json('No deviceId provided');
				const measurements = await db.device.findUnique({ where: { id: req.params.deviceId } });
				if (!measurements) return res.status(400).json({ message: 'Invalid deviceId' });
				return res.status(200).json(removeSensitiveDeviceData(measurements));
			},
			post: (req: Request, res: Response) => {},
		},
	},

	get: async (req: Request, res: Response) => {
		const devices = await db.device.findMany({ select: { id: true } });
		res.status(200).json(devices);
	},
};
