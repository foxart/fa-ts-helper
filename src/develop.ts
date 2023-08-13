import { testData } from './develop/data';
import { testDebug } from './develop/debug';
import { testDto } from './develop/dto';
import { testParamDecorator } from './develop/param-decorator';
import { testSystem } from './develop/system';
import { FaDebug } from './helpers/debug.helper';
// import { testDto } from './develop/dto';
// import { testDebug } from './develop/debug';
// import { testParamDecorator } from './develop/param-decorator';
// import { testSystem } from './develop/system';
function isPromise(value: unknown): boolean {
	return typeof value === 'object' && typeof (value as Promise<unknown>).then === 'function';
}

void (async function (): Promise<void> {
	console.clear();
	FaDebug.config();
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
			fn: testData,
			// test: true,
		},
		{
			fn: testDebug,
			// test: true,
		},
		{
			fn: testDto,
			// test: true,
		},
		{
			fn: testParamDecorator,
			// test: true,
		},
		{
			fn: testSystem,
			test: true,
		},
	];
}
