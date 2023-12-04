import { ConsoleHelper } from '../helpers/console.helper';
import { SystemHelper } from '../helpers/system.helper';

async function testSystem(): Promise<void> {
	const timeStart = performance.now();
	await SystemHelper.sleep(1000);
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
	SystemHelper.writeFileSync(data, './temp/system.json');
}

void (async function (): Promise<void> {
	console.clear();
	ConsoleHelper.overwriteConsole();
	await testSystem();
})();
