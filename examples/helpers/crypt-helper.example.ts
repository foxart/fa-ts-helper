import { CryptHelper } from '../../src';

function encryptDecrypt(): void {
  const data = 'Иван';
  const secret = '123';
  const encrypted = CryptHelper.encrypt(data, secret);
  const decrypted = CryptHelper.decrypt(encrypted, secret);
  console.log(encryptDecrypt.name, {
    data,
    secret,
    encrypted,
    decrypted,
  });
  // 5+VV24sQEGHzBwhK78c6Uw==
}

function comparePassport(): void {
  const password = '123';
  const hash = CryptHelper.cryptPassword(password);
  console.log(comparePassport.name, {
    password,
    hash,
    valid: CryptHelper.comparePassportWithHash(password, hash),
  });
}

export function run(): void {
  encryptDecrypt();
  // comparePassport();
  // console.log(CryptHelper.parseHash(CryptHelper.cryptPassword('123')));
  // console.log(CryptHelper.salt());
  // console.log(CryptHelper.random());
  // console.log(CryptHelper.md5('1234'));
  // console.log(CryptHelper.md5('123'));
}
