import * as util from 'util';
import * as path from 'path';

const reset = '\x1b[0m';
const gray = '\x1b[37m';
const green = '\x1b[32m';
const blue = '\x1b[34m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';

enum DebugEnum {
	LOG,
	INFO,
	WARN,
	ERROR,
}

function stdout(key: DebugEnum, stack: string[], data: unknown[]): void {
	const path = Array.isArray(stack) ? stack.join('\n') : stack;
	switch (key) {
		case DebugEnum.LOG:
			process.stdout.write(`${gray}[${green}LOG${gray}] ${path}${reset}`);
			break;
		case DebugEnum.INFO:
			process.stdout.write(`${gray}[${blue}INF${gray}] ${path}${reset}`);
			break;
		case DebugEnum.WARN:
			process.stdout.write(`${gray}[${yellow}WRN${gray}] ${path}${reset}`);
			break;
		case DebugEnum.ERROR:
			process.stdout.write(`${gray}[${red}ERR${gray}] ${path}${reset}`);
			break;
		default:
			process.stdout.write(`${gray}[${green}LOG${gray}] ${path}${reset}`);
	}
	process.stdout.write(' ');
	data.forEach((item) => {
		process.stdout.write(util.inspect(item, true, null, true));
		process.stdout.write(' ');
	});
	process.stdout.write('\n');
}

function log(...data: unknown[]): void {
	stdout(DebugEnum.LOG, trace(new Error(), { level: 1 }), data);
}

function info(...data: unknown[]): void {
	stdout(DebugEnum.INFO, trace(new Error(), { level: 1 }), data);
}

function warn(...data: unknown[]): void {
	stdout(DebugEnum.WARN, trace(new Error(), { level: 1 }), data);
}

function error(...data: unknown[]): void {
	stdout(DebugEnum.ERROR, trace(new Error(), { level: 1 }), data);
}

function trace(
	error: Error,
	filter?: {
		level?: number;
		path?: boolean;
	},
): string[] {
	const matches = [];
	const myString = error.stack as string;
	const myRegexp = /\/(.+:\d+:\d+)/gm;
	let match = myRegexp.exec(myString);
	while (match != null) {
		if (filter?.path) {
			matches.push(path.relative(process.cwd(), match[0]));
		} else {
			matches.push(match[0]);
		}
		match = myRegexp.exec(myString);
	}
	if (filter?.level) {
		return [matches[filter.level]];
	} else {
		return matches;
	}
}

function config() {
	console.clear();
	console.log = debugHelper.log;
	console.warn = debugHelper.warn;
	console.info = debugHelper.info;
	console.error = debugHelper.error;
}

export const debugHelper = {
	log,
	info,
	warn,
	error,
	trace,
	config,
};
