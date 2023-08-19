import CryptoJS from 'crypto-js';
import { v4 } from 'uuid';
import { HelperDebug } from '../index';

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

	public encrypt<T>(data: T, secret: string, throws?: boolean): T {
		if (!data) {
			return data;
		}
		try {
			const encJson = CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString();
			return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(encJson)) as T;
		} catch (e) {
			if (!!throws) {
				(e as Error).name = (e as Error).message;
				(e as Error).message = `Encryption failed for: ${data as string}`;
				throw e;
			}
			return data;
		}
	}

	public decrypt<T>(data: T, secret: string, throws?: boolean): T {
		if (!data) {
			return data;
		}
		try {
			const decData = CryptoJS.enc.Base64.parse(data as string).toString(CryptoJS.enc.Utf8);
			const bytes = CryptoJS.AES.decrypt(decData, secret).toString(CryptoJS.enc.Utf8);
			return JSON.parse(bytes) as T;
		} catch (e) {
			if (!!throws) {
				(e as Error).name = (e as Error).message;
				(e as Error).message = `Decryption failed for: ${data as string}`;
				throw e;
			}
			return data;
		}
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
