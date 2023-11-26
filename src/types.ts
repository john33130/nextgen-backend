import { TransformableInfo } from 'logform';
import { Logger } from 'winston';

import { Device, User } from '@prisma/client';

export interface ConfigOptions {
	logs: {
		files?: {
			enabled: boolean;
			directory: string;
			keepFor?: string;
		};
		level: string;
	};
	cache: { keepFor: number };
	auth: { expiresIn: number };
	rateLimit: {
		interval: number;
		tokens: number;
	};
}

export interface CustomLogMethodMetaData {
	service?: string;
	error?: Error;
	uuid: string;
	[key: string]: unknown;
}

export type CustomLogMethod = (message: string | null, ...meta: CustomLogMethodMetaData[]) => unknown;

export type CustomLogger = Omit<
	Logger,
	| 'error'
	| 'warn'
	| 'help'
	| 'data'
	| 'info'
	| 'debug'
	| 'prompt'
	| 'http'
	| 'verbose'
	| 'input'
	| 'silly'
	| 'emerg'
	| 'alert'
	| 'crit'
	| 'warning'
	| 'notice'
> & {
	error: CustomLogMethod;
	warn: CustomLogMethod;
	info: CustomLogMethod;
	http: CustomLogMethod;
	debug: CustomLogMethod;
};

export interface LoggerMetaData {
	build: string;
	service: string;
}

export type LogData = TransformableInfo & Partial<LoggerMetaData & CustomLogMethodMetaData>;

export type SafeUser = Omit<User, 'password'>;

export type SafeDevice = Omit<Device, 'accessKey' | 'data'>;
