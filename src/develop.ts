import { testData } from './develop/data';
import { testDebug } from './develop/debug';
import { testParamDecorator } from './develop/param-decorator';
import { testSystem } from './develop/system';
import { Debug } from './helpers/debug.helper';
import { testValidator } from './develop/validator';
import { testCrypt } from './develop/crypt';
function isPromise(value: unknown): boolean {
	return typeof value === 'object' && typeof (value as Promise<unknown>).then === 'function';
}

void (async function (): Promise<void> {
	console.clear();
	Debug.overwriteConsole();
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
			test: true,
		},
		{
			fn: testDebug,
			// test: true,
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
			fn: testValidator,
			// test: true,
		},
	];
}
