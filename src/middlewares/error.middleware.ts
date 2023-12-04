import { Request, Response } from 'express';
import crypto from 'crypto';
import logger from '../lib/logger';

export default (error: Error, req: Request, res: Response) => {
	const uuid = crypto.randomUUID();

	logger.info('Something went wrong inside the application', {
		error,
		uuid,
	});

	res.status(500).json({ message: 'Something went wrong', uuid });
};
