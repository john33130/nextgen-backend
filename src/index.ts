/* eslint-disable no-console */

import chalk from 'chalk';
import figlet from 'figlet';
import process from 'process';
import env from './lib/env';
import pkg from './lib/pkg';
import server from './server';

console.log(chalk.cyanBright(figlet.textSync('NextGen'))); // print banner

// check for package.json version
if (!pkg.version) {
	console.log(chalk.redBright('Fatal: "version" is not defined in package.json'));
	process.exit(1);
}

process.title = 'ng-backend'; // set process title
process.env.NODE_ENV ??= 'development'; // make sure env is set
env(); // load env variables

server(); // start server
