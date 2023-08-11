import { testData } from './develop/data';
import { testDto } from './develop/dto';
import { testDebug } from './develop/debug';
import { testParamDecorator } from './develop/param-decorator';
import { FaDebug } from './helpers/debug.helper';

(function (): void {
	console.clear();
	FaDebug.config();
	testCases().forEach((item) => {
		if (item.test) {
			item.fn();
		}
	});
})();

function testCases(): Array<{ fn: () => void; test?: boolean }> {
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
			test: true,
		},
	];
}
