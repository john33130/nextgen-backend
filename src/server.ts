import express from 'express';
import process from 'node:process';
import http from 'http';
import { readdirSync } from 'node:fs';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import logger from './lib/logger';
import { path } from './lib/fs';
import config from './lib/config';

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

	// import routes
	readdirSync(path('./routes'))
		.filter((file) => file.endsWith('.ts') || file.endsWith('.js'))
		.forEach(async (filename) => {
			const route = `/api/${filename.split('.')[0]}`;
			app.use(route, (await import(`./routes/${filename}`)).default);
		});

	app.get('/', (req, res) => res.json({ ip: req.socket.remoteAddress }));

	const server = http.createServer(app);

	server.listen(process.env.HTTP_PORT as unknown as number, process.env.HTTP_HOST, () =>
		logger.info(`Server running on port ${process.env.HTTP_PORT}`)
	);
};
