import bcrypt from 'bcryptjs';
import CryptoJS from 'crypto-js';
import { v1, v3, v4, v5 } from 'uuid';

type WordArray = CryptoJS.lib.WordArray;

class CryptSingleton {
	private static self: CryptSingleton;

	public static getInstance(): CryptSingleton {
		if (!CryptSingleton.self) {
			CryptSingleton.self = new CryptSingleton();
		}
		return CryptSingleton.self;
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

	public md5(message: string, key?: string): string {
		if (key) {
			return this.wordArrayToString(CryptoJS.HmacMD5(message, key));
		}
		return this.wordArrayToString(CryptoJS.MD5(message));
	}

	public sha1(message: string, key?: string): string {
		if (key) {
			return this.wordArrayToString(CryptoJS.HmacSHA1(message, key));
		}
		return this.wordArrayToString(CryptoJS.SHA1(message));
	}

	public sha224(message: string, key?: string): string {
		if (key) {
			return this.wordArrayToString(CryptoJS.HmacSHA224(message, key));
		}
		return this.wordArrayToString(CryptoJS.SHA224(message));
	}

	public sha256(message: string, key?: string): string {
		if (key) {
			return this.wordArrayToString(CryptoJS.HmacSHA256(message, key));
		}
		return this.wordArrayToString(CryptoJS.SHA256(message));
	}

	public sha3(message: string, key?: string): string {
		if (key) {
			return this.wordArrayToString(CryptoJS.HmacSHA3(message, key));
		}
		return this.wordArrayToString(CryptoJS.SHA3(message));
	}

	public sha384(message: string, key?: string): string {
		if (key) {
			return this.wordArrayToString(CryptoJS.HmacSHA384(message, key));
		}
		return this.wordArrayToString(CryptoJS.SHA384(message));
	}

	public sha512(message: string, key?: string): string {
		if (key) {
			return this.wordArrayToString(CryptoJS.HmacSHA512(message, key));
		}
		return this.wordArrayToString(CryptoJS.SHA512(message));
	}

	public password(password: string, rounds?: number | string): string {
		return bcrypt.hashSync(password, rounds);
	}

	public compare(password: string, hash: string): boolean {
		return bcrypt.compareSync(password, hash);
	}

	public salt(rounds?: number): string {
		return bcrypt.genSaltSync(rounds ? rounds : 10);
	}

	public v4(): string {
		return v4();
	}

	private wordArrayToString(data: WordArray): string {
		return CryptoJS.enc.Base64.stringify(data);
	}
}

export const CryptHelper = CryptSingleton.getInstance();
