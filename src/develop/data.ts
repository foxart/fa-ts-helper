import { FaData } from '../index';

const data1 = {
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
const data2: { name: string; age: number } = {
	name: '<NAME>',
	age: 30,
};

export function testData(): void {
	const result1 = FaData.filterUndefined([data1, data1]);
	console.log(result1[0].c);
	const result2 = FaData.filterUndefined(data2);
	console.log(result2);
}
