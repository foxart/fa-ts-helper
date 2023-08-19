import { HelperSystem } from '../../src';

export async function testSystem(): Promise<void> {
	const timeStart = performance.now();
	await HelperSystem.sleep(1000);
	const timeEnd = performance.now();
	console.log({
		start: timeStart,
		end: timeEnd,
		duration: timeEnd - timeStart,
	});
	const data = [
		1,
		2,
		3,
		{
			object: {
				a: 1,
				b: 2,
				c: 3,
			},
		},
	];
	HelperSystem.writeFileSync(data, './temp/system.json');
}
