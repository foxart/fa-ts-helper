import { ParserHelper } from '../helpers/parser.helper';
import { ConsoleHelper } from '../helpers/console.helper';
import * as util from 'util';
import * as process from 'process';

function testTrace(): void {
	const callbackReplace = (stack: string[]): string[] => {
		return stack.map((item) => item.replace(/index.ts/, '<FILE>'));
	};
	const callbackFilter = (stack: string[]): string[] => {
		return stack.filter((item) => !/node_modules/.test(item));
	};
	const error = new Error();
	console.log(ParserHelper.stack(error.stack, { index: 1 }));
	console.info(
		ParserHelper.stack(error.stack, {
			short: true,
			callback: callbackFilter,
		}),
	);
	console.warn(
		ParserHelper.stack(error.stack, {
			short: true,
			callback: callbackFilter,
		}),
	);
	console.debug({ a: 1 });
	// ConsoleHelper.restore();
	// console.log({ a: 1, b: { c: 'string' } });
	// process.stdout.write(util.inspect({ a: 1, b: { c: 'string' } }));
}

void (function (): void {
	console.clear();
	ConsoleHelper.override();
	testTrace();
})();
