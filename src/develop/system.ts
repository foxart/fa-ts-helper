import { FaSystem } from '../index';

export async function testSystem(): Promise<void> {
	const timeStart = performance.now();
	await FaSystem.sleep(1000);
	const timeEnd = performance.now();
	console.log({
		start: timeStart,
		end: timeEnd,
		duration: timeEnd - timeStart,
	});
}
