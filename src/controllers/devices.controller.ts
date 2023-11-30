import { Request, Response } from 'express';
import ms from 'ms';
import crypto from 'crypto';
import Joi from 'joi';
import emojiFramework from 'node-emoji';
import db from '../lib/db';
import { getDeviceById, getMeasurements } from '../helpers/devices.helpers';
import { DeviceMeasurements } from '../types';
import logger from '../lib/logger';

export default {
	credentials: {
		':deviceId': {
			get: async (req: Request, res: Response) => {
				try {
					const data: DeviceMeasurements[] = [];
					(await db.device.findMany({ select: { id: true } })).forEach(async ({ id }) => {
						const device = await getDeviceById(id); // get device
						if (!device) return; // check if device exists
						const measurements = getMeasurements(device); // extract measurements
						const sendData = !(
							(Date.now() - measurements.updatedAt.getTime()) /
							ms('6h')
						); // was data send in the last 6 hours?
						if (sendData) data.push(measurements); // puish data
					});

					res.status(200).json(data);
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
			},

			patch: (req: Request, res: Response) => {
				// validate body
				const schema = Joi.object({
					update: Joi.object({
						name: Joi.string().label('Name').max(48).optional(),
						emoji: Joi.string().max(2).optional(),
					})
						.min(1)
						.messages({ 'object.min': 'Atleast one change should be made' }),
				});

				const bodyValidation = schema.validate(req.body).error;
				if (bodyValidation) return res.status(400).send({ message: bodyValidation.message });

				const { deviceId } = req.params;
				const { update } = req.body;

				// check if input is an emoji
				if (update.emoji && emojiFramework.has(update.emoji)) {
					return res.status(400).json({ message: 'Invalid emoji' });
				}

				const oldDevice =
					// check if values are different
					Object.entries(update).forEach(([k, v]) => {});

				// update device
				// cache
				// handle errors
			},
		},
	},
	measurements: {
		all: {
			get: (req: Request, res: Response) => {},
		},
		':deviceId': {
			get: (req: Request, res: Response) => {},
			post: (req: Request, res: Response) => {},
		},
	},
};
