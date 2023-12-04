import { ConsoleHelper } from '../helpers/console.helper';
import { ParserHelper } from '../helpers/parser.helper';

function testParser(): void {
	const data = 'Hello World';
	console.log(data, data);
	console.log(ParserHelper.stack());
	// console.info([data, data]);
	// console.error(new Error('My Error'));
	// console.debug('Hello World!', 123, new Error('Debug Error'));
	// console.warn({ a: data, b: 'lorem ipsum', c: [{ a: data }] });
}

void (function (): void {
	console.clear();
	ConsoleHelper.overwriteConsole();
	testParser();
})();
