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
			process.stdout.write(`${gray}[${green}LOG${gray}]${reset} ${path} `);
			break;
		case DebugEnum.INFO:
			process.stdout.write(`${gray}[${blue}INF${gray}]${reset} ${path} `);
			break;
		case DebugEnum.WARN:
			process.stdout.write(`${gray}[${yellow}WRN${gray}]${reset} ${path} `);
			break;
		case DebugEnum.ERROR:
			process.stdout.write(`${gray}[${red}ERR${gray}]${reset} ${path} `);
			break;
		default:
			process.stdout.write(`${gray}[${green}LOG${gray}]${reset} ${path} `);
	}
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
	console.log = DebugHelper.log;
	console.warn = DebugHelper.warn;
	console.info = DebugHelper.info;
	console.error = DebugHelper.error;
}

export const DebugHelper = {
	log,
	info,
	warn,
	error,
	trace,
	config,
};
