import { ConsoleHelper } from '../helpers/console.helper';

function testTrace(): void {
	const callbackReplace = (stack: string[]): string[] => {
		return stack.map((item) => item.replace(/index.ts/, '<FILE>'));
	};
	const callbackFilter = (stack: string[]): string[] => {
		return stack.filter((item) => !/node_modules/.test(item));
	};
	const error = new Error('My Error');
	console.log(error);
	console.log(
		ConsoleHelper.stack(error, {
			short: true,
			callback: callbackReplace,
		}),
	);
	console.log(
		ConsoleHelper.stack(error, {
			short: true,
			callback: callbackFilter,
		}),
	);
	console.debug({ a: 1 });
	// console.log({ a: 1, b: { c: 'string' } });
	// process.stdout.write(util.inspect({ a: 1, b: { c: 'string' } }));
}

void ((): void => {
	console.clear();
	ConsoleHelper.override();
	testTrace();
})();
