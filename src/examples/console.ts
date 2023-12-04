import { ParserHelper } from '../helpers/parser.helper';
import { ConsoleHelper } from '../helpers/console.helper';

function testTrace(): void {
	const callbackReplace = (stack: string[]): string[] => {
		return stack.map((item) => item.replace(/index.ts/, '<FILE>'));
	};
	const callbackFilter = (stack: string[]): string[] => {
		return stack.filter((item) => !/node_modules/.test(item));
	};
	const error = new Error();
	console.log(ParserHelper.stack(error.stack, { level: 1 }));
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
}

void (function (): void {
	console.clear();
	ConsoleHelper.overwriteConsole();
	testTrace();
})();
