import CryptoJS from 'crypto-js';
import { v4 } from 'uuid';

type CipherParams = CryptoJS.lib.CipherParams;
type WordArray = CryptoJS.lib.WordArray;
class CryptHelper {
	private static self: CryptHelper;

	public static getInstance(): CryptHelper {
		if (!CryptHelper.self) {
			CryptHelper.self = new CryptHelper();
		}
		return CryptHelper.self;
	}

	public encrypt<T>(data: T, secret: WordArray | string): T {
		if (!data) {
			return data;
		}
		const result =
			typeof data === 'string'
				? (CryptoJS.AES.encrypt(data, secret).toString() as T)
				: (CryptoJS.AES.encrypt(data as unknown as WordArray, secret) as T);
		if (!result) {
			console.error(`failed to encrypt: ${data.toString()}`);
		}
		return result ? result : data;
	}

	public decrypt<T>(data: T, secret: WordArray | string): T {
		if (!data) {
			return data;
		}
		const result =
			typeof data === 'string'
				? (CryptoJS.AES.decrypt(data, secret).toString(CryptoJS.enc.Utf8) as T)
				: (CryptoJS.AES.decrypt(data as unknown as CipherParams, secret) as T);
		if (!result) {
			console.error(`failed to decrypt: ${data.toString()}`);
		}
		return result ? result : data;
	}

	public md5(data: string): string {
		return this.wordArrayToString(CryptoJS.MD5(data));
	}

	public password(password: string, salt: string): string {
		return this.wordArrayToString(CryptoJS.HmacSHA256(password, salt));
	}

	public salt(): string {
		return this.wordArrayToString(CryptoJS.HmacMD5(v4(), process.hrtime().toString()));
	}

	public v4(): string {
		return v4();
	}

	private wordArrayToString(data: CryptoJS.lib.WordArray): string {
		return CryptoJS.enc.Base64.stringify(data);
	}
}

export const Crypt = CryptHelper.getInstance();
