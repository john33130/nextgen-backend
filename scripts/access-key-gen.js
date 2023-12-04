/* eslint-disable no-console */

const argv = require('minimist')(process.argv.slice(2));
const { default: chalk } = require('chalk');
const jwt = require('jsonwebtoken');

function log(...strings) {
	console.log(chalk.cyanBright('[POSTINSTALL]'), ...strings);
}

if (!argv.id) {
	log('No device id given, exiting...');
	process.exit(1);
}

if (!argv.key) {
	log('No encryption key given, exiting...');
	process.exit(1);
}

console.log(jwt.sign({ deviceId: argv.id }, argv.key));
