import { ConsoleHelper } from '../helpers/console.helper';
import * as util from 'util';

function testTrace(): void {
	const callbackReplace = (): void => {
		ConsoleHelper.stdout('XXX');
	};
	const callbackFilter = (): void => {
		ConsoleHelper.stdout('YYY');
	};
	// const Console = new ConsoleHelper();
	ConsoleHelper.override({
		// link: false,
		callback: {
			log: callbackReplace,
			info: callbackFilter,
		},
	});
	const data = new Error('My Error');
	// const data = { a: 1 };
	/** */
	console.log(data);
	console.info(data);
	// console.warn(data);
	// console.debug(data);
	// console.error(data);
	// process.stdout.write(util.inspect({ a: 1, b: { c: 'string' } }));
}

void ((): void => {
	// console.clear();
	// ConsoleHelper.override();
	testTrace();
})();
