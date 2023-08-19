import { HelperDebug } from '../../src';

export function testDebug(): void {
	console.log('Hello World!');
	console.info(
		HelperDebug.trace(new Error(), {
			level: 1,
			// shortPath: true,
			strip: '/Users/ivankosenko/Projects/pet/fa-node/develop/',
		}),
	);
	// console.warn(
	// 	HelperDebug.trace(new Error(), {
	// 		omit: /node_modules/,
	// 		shortPath: true,
	// 	}),
	// );
	// console.error(
	// 	HelperDebug.trace(new Error(), {
	// 		filter: /node_modules/,
	// 		shortPath: true,
	// 	}),
	// );
	// console.debug('Hello World!');
}
