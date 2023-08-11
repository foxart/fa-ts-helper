import { FaDebug } from '../index';

export function testDebug(): void {
	console.log('Hello World!');
	// console.info(FaDebug.getTrace(new Error(), { level: 2 }));
	// console.warn(
	// 	FaDebug.getTrace(new Error(), {
	// 		omit: /node_modules/,
	// 		short: true,
	// 	}),
	// );
	console.error(
		FaDebug.trace(new Error(), {
			filter: /node_modules/,
			short: true,
		}),
	);
	console.debug('Hello World!');
}
