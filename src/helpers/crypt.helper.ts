import CryptoJS from 'crypto-js';
import { v4 } from 'uuid';

function wordArrayToString(data: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(data);
}

function decrypt(data: string, secret: string): string {
  return CryptoJS.AES.decrypt(data, secret).toString(CryptoJS.enc.Utf8);
//
}

function encrypt(data: string, secret: string): string {
  return CryptoJS.AES.encrypt(data, secret).toString();
}

function md5(data: string): string {
  return wordArrayToString(CryptoJS.MD5(data));
}

function password(password: string, salt: string): string {
  return wordArrayToString(CryptoJS.HmacSHA256(password, salt));
}

function salt(): string {
  return wordArrayToString(CryptoJS.HmacMD5(v4(), process.hrtime().toString()));
}

export const cryptHelper = {
  encrypt,
  decrypt,
  md5,
  password,
  salt,
};
