/* eslint-disable no-console */

const util = require('util');
const exec = util.promisify(require('child_process').exec);
const { default: chalk } = require('chalk');

function log(...strings) {
	console.log(chalk.cyanBright('[POSTINSTALL]'), ...strings);
}

if (process.env.NODE_ENV !== 'production') {
	log('Only neccessary in production, skipping');
	process.exit(0);
}

/**
 * Run a command via `npx`
 * @param {string} cmd - The command to run
 */
async function npx(cmd) {
	log('> ', cmd);
	const { stderr, stdout } = await exec(`npx ${cmd}`);
	if (stdout) console.log(stdout.toString());
	if (stderr) console.log(stderr.toString());
}

log('Setting up prisma');

(async () => {
	await npx('prisma generate');
	await npx('prisma migrate deploy');
})();
