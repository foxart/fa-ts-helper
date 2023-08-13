import { FaDebug } from '../index';

export function testDebug(): void {
	console.log('Hello World!');
	console.info(FaDebug.trace(new Error(), { level: 1 }));
	console.warn(
		FaDebug.trace(new Error(), {
			omit: /node_modules/,
			short: true,
		}),
	);
	console.error(
		FaDebug.trace(new Error(), {
			filter: /node_modules/,
			short: true,
		}),
	);
	console.debug('Hello World!');
}
