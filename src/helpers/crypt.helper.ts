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

	public md5(message: string): string {
		return this.wordArrayToString(CryptoJS.MD5(message));
	}

	public md5Hmac(message: string, key: string): string {
		return this.wordArrayToString(CryptoJS.HmacMD5(message, key));
	}

	public sha1Hmac(message: string, key: string): string {
		return this.wordArrayToString(CryptoJS.HmacSHA1(message, key));
	}

	public sha256Hmac(password: string, key: string): string {
		return this.wordArrayToString(CryptoJS.HmacSHA256(password, key));
	}

	public sha512Hmac(password: string, key: string): string {
		return this.wordArrayToString(CryptoJS.HmacSHA512(password, key));
	}

	public randomBytes(bytes: number): WordArray {
		return CryptoJS.lib.WordArray.random(bytes);
	}

	public password(password: string, salt: string): string {
		return this.sha256Hmac(password, salt);
	}

	public salt(): string {
		return this.wordArrayToString(this.randomBytes(32));
	}

	public refreshToken(): string {
		return this.wordArrayToString(this.randomBytes(16));
	}

	public v4(): string {
		return v4();
	}

	private wordArrayToString(data: WordArray): string {
		return CryptoJS.enc.Base64.stringify(data);
	}
}

export const Crypt = CryptHelper.getInstance();
