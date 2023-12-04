import express from 'express';
import process from 'node:process';
import http from 'http';
import { readdirSync } from 'node:fs';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { CronJob } from 'cron';
import dayjs from 'dayjs';
import logger from './lib/logger';
import { path } from './lib/fs';
import config from './lib/config';
import pkg from './lib/pkg';
import github from './lib/github';
import db from './lib/db';

const app = express();

export default async () => {
	// logging requests
	app.use(
		morgan(':method :url :status :res[content-length] - :response-time ms', {
			stream: { write: (info) => logger.http(info) },
		})
	);

	app.use(compression()); // compress data
	app.use(express.json()); // parsing json
	app.use(cookieParser()); // store and read cookies

	// ratelimiting
	app.use(
		rateLimit({
			windowMs: config.rateLimit.interval,
			limit: config.rateLimit.tokens,
			standardHeaders: 'draft-7',
			legacyHeaders: false,
		})
	);

	app.set('x-powered-by', 'Bloed, zweet en tranen.'); // set x-powered-by

	// import routes
	readdirSync(path('./routes'))
		.filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
		.forEach(async (filename) => {
			const route = `/api/${filename.split('.')[0]}`;
			app.use(route, (await import(`./routes/${filename}`)).default);
		});

	// set root data
	app.get('/', async (req, res) => {
		const gh = await github();
		res.status(200).json({
			api: {
				host: req.get('host'),
				environment: process.env.NODE_ENV!,
				build: `v${pkg.version!}`,
				deployed: gh.commit.author.data,
				commit: gh.sha,
				uptime: Math.floor(process.uptime()),
			},
			about: {
				description:
					'This REST API is used to authenticate users and get information for the frontend',
			},
			resources: ['/auth', '/users', '/devices'],
		});
	});

	// start cron job to delete users
	new CronJob(
		'0 0 * * *',
		async () => {
			(
				await db.user.findMany({
					where: { deactivated: { equals: true } },
					select: { id: true, deactivationDate: true },
				})
			).forEach(async (user) => {
				// calculate if user should be deleted
				const targetDate = dayjs(user.deactivationDate);
				const lastWeekDate = dayjs().subtract(30, 'days');
				if (targetDate.isBefore(lastWeekDate) || targetDate.isSame(lastWeekDate)) {
					await db.user.delete({ where: { id: user.id } });
					logger.info('Deleted a user from the database', {
						userId: user.id,
					});
				}
			});
		},
		null
	).start();

	const server = http.createServer(app);

	server.listen(process.env.HTTP_PORT as unknown as number, process.env.HTTP_HOST, () =>
		logger.info(`Server running on port ${process.env.HTTP_PORT}`)
	);
};
