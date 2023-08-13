import CryptoJS from 'crypto-js';
import { v4 } from 'uuid';

class CryptHelper {
	private static self: CryptHelper;

	public static getInstance(): CryptHelper {
		if (!CryptHelper.self) {
			CryptHelper.self = new CryptHelper();
		}
		return CryptHelper.self;
	}

	public decrypt(data: string, secret: string): string {
		return CryptoJS.AES.decrypt(data, secret).toString(CryptoJS.enc.Utf8);
	}

	public encrypt(data: string, secret: string): string {
		return CryptoJS.AES.encrypt(data, secret).toString();
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

	private wordArrayToString(data: CryptoJS.lib.WordArray): string {
		return CryptoJS.enc.Base64.stringify(data);
	}
}

export const Crypt = CryptHelper.getInstance();
