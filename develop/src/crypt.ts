import { HelperCrypt, HelperData } from '../../src';
import { v4 } from 'uuid';
// const data = 'Lorem ipsum dolor sit amet';
const data = 'Александрович';

export function testCrypt(): void {
	// const secret = v4();
	const secret = '097065a5-7703-4fd3-9b7a-0b9a4c787e73';
	const interval = setInterval(() => {
		const encrypted = HelperCrypt.encrypt(data, secret);
		const decrypted = HelperCrypt.decrypt(encrypted, secret, true);
		console.log(encrypted.substring(0, 10), '->', decrypted);
	}, 500);
	setTimeout(() => {
		clearInterval(interval);
	}, 1000);
	try {
		// @ts-ignore
		a = 1;
	} catch (e) {
		console.log([1, 2, 3], e);
	}
}
