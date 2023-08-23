import { HelperParser } from '../../src';

export function testTrace(): void {
	const callbackReplace = (stack: string[]): string[] => {
		return stack.map((item) => item.replace(/index.ts/, '<FILE>'));
	};
	const callbackFilter = (stack: string[]): string[] => {
		return stack.filter((item) => !/node_modules/.test(item));
	};
	const error = new Error();
	console.log(HelperParser.errorStack(error.stack, { level: 1 }));
	console.info(
		HelperParser.errorStack(error.stack, {
			short: true,
			callback: callbackFilter,
		}),
	);
	/**
	 *
	 */
	console.warn(
		HelperParser.errorStack(error.stack, {
			short: true,
			callback: callbackFilter,
		}),
	);
}
