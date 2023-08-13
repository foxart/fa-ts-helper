import { HelperCrypt } from '../index';

const data = 'Lorem ipsum dolor sit amet';

export function testCrypt(): void {
	const secret = 'XXX-XXX-XXX';
	const encrypted = HelperCrypt.encrypt(data, secret);
	const decrypted = HelperCrypt.decrypt(encrypted, secret);
	console.log({
		encrypted,
		decrypted,
	});
}
