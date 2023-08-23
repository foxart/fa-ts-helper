import { testData } from './src/data';
import { testDebug } from './src/debug';
import { testParamDecorator } from './src/param-decorator';
import { testSystem } from './src/system';
import { Debug } from '../src/helpers/debug.helper';
import { testValidator } from './src/validator';
import { testCrypt } from './src/crypt';
import { testTrace } from './src/trace';
function isPromise(value: unknown): boolean {
	return typeof value === 'object' && typeof (value as Promise<unknown>).then === 'function';
}

void (async function (): Promise<void> {
	console.clear();
	Debug.overwriteConsole({
		// short: true,
		// path: false,
		// color: false,
		// depth: 1,
		// hidden: true,
	});
	for (const item of testCases()) {
		if (item.test) {
			if (isPromise(item.test)) {
				await item.fn();
			} else {
				void item.fn();
			}
		}
	}
})();

function testCases(): Array<{ fn: () => void | Promise<void>; test?: boolean }> {
	return [
		{
			fn: testCrypt,
			// test: true,
		},
		{
			fn: testData,
			// test: true,
		},
		{
			fn: testDebug,
			test: true,
		},
		{
			fn: testParamDecorator,
			// test: true,
		},
		{
			fn: testSystem,
			// test: true,
		},
		{
			fn: testTrace,
			// test: true,
		},
		{
			fn: testValidator,
			// test: true,
		},
	];
}
