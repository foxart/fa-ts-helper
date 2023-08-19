import { HelperCrypt } from '../../src';

const data = 'Lorem ipsum dolor sit amet';

export function testCrypt(): void {
	const secret = 'XXX-XXX-XXX';
	const encrypted = HelperCrypt.encrypt(null, secret);
	const decrypted = HelperCrypt.decrypt(encrypted, secret);
	console.log({
		encrypted,
		decrypted,
	});
}
