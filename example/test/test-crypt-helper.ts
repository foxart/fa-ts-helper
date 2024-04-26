import { CryptHelper } from '../../src';

function encryptDecrypt(): void {
  const data = { name: 'Иван123' };
  const secret = CryptHelper.bcryptSalt();
  const encrypted = CryptHelper.encrypt(data, secret);
  const decrypted = CryptHelper.decrypt(encrypted, secret);
  console.log(encryptDecrypt.name, {
    data,
    secret,
    encrypted,
    decrypted,
  });
}

function bcryptCompare(): void {
  const password = 'Иван123';
  const input = CryptHelper.bcryptPassword(password);
  console.log(bcryptCompare.name, {
    password,
    input,
    valid: CryptHelper.bcryptCompare(password, input),
  });
}

function bcryptInput(): void {
  const password = 'Иван123';
  const input = CryptHelper.bcryptPassword(password);
  console.log(bcryptInput.name, CryptHelper.bcryptInput(input));
}

export function testCryptHelper(): void {
  encryptDecrypt();
  bcryptCompare();
  bcryptInput();
}
