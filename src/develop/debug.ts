import { HelperDebug } from '../index';

export function testDebug(): void {
	console.log('Hello World!');
	console.info(HelperDebug.trace(new Error(), { level: 1 }));
	console.warn(
		HelperDebug.trace(new Error(), {
			omit: /node_modules/,
			shortPath: true,
		}),
	);
	console.error(
		HelperDebug.trace(new Error(), {
			filter: /node_modules/,
			shortPath: true,
		}),
	);
	console.debug('Hello World!');
}
