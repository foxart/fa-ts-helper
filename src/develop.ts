import { testData } from './develop/data';
import { testDto } from './develop/dto';
import { testDebug } from './develop/debug';
import { testParamDecorator } from './develop/param-decorator';
import { FaDebug } from './helpers/debug.helper';

(function () {
	console.clear();
	FaDebug.config();
	testCases().forEach((item) => {
		item.test ? item.fn() : null;
	});
})();

function testCases(): Array<{ fn: Function; test?: boolean }> {
	return [
		{
			fn: testData,
			// test: true,
		},
		{
			fn: testDebug,
			test: true,
		},
		{
			fn: testDto,
			// test: true,
		},
		{
			fn: testParamDecorator,
			// test: true,
		},
	];
}
