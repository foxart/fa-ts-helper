import { CryptHelper } from '../src';
import { logNameData } from './common/logger';

function encryptDecrypt(): void {
  const data = { name: 'Иван123' };
  const secret = CryptHelper.bcryptSalt();
  const encrypted = CryptHelper.encrypt(data, secret);
  const decrypted = CryptHelper.decrypt(encrypted, secret);
  logNameData(encryptDecrypt.name, {
    data,
    secret,
    encrypted,
    decrypted,
  });
}

function bcryptCompare(): void {
  const password = 'Иван123';
  const input = CryptHelper.bcryptPassword(password);
  logNameData(bcryptCompare.name, {
    password,
    input,
    valid: CryptHelper.bcryptCompare(password, input),
  });
}

function bcryptInput(): void {
  const password = 'Иван123';
  const input = CryptHelper.bcryptPassword(password);
  logNameData(bcryptInput.name, CryptHelper.bcryptInput(input));
}

export function testCryptHelper(): void {
  encryptDecrypt();
  bcryptCompare();
  bcryptInput();
}
