import { FaData } from '../index';

export function testData() {
	const data = {
		a: [1, 2, 3, undefined, 5, 6, 7, undefined, 9],
		b: undefined,
		c: {
			d: 1,
			e: 2,
			f: 3,
			g: undefined,
			h: 5,
		},
	};
	const result = FaData.filterUndefined([data, data]);
	console.log(result);
}
