import { CryptHelper } from '../src/helpers/crypt.helper';
import bcrypt from 'bcryptjs';

function testCrypt(): void {
  // const secret = '097065a5-7703-4fd3-9b7a-0b9a4c787e73';
  // const secret = CryptHelper.v4();
  // const secret = CryptHelper.salt();
  const secret = CryptHelper.sha1(CryptHelper.v4());
  const data = { name: 'Александр', boolean: true };
  // const data = true;
  const encrypted = CryptHelper.encrypt(data, secret);
  const decrypted = CryptHelper.decrypt(encrypted, secret, true);
  console.log({
    data,
    secret,
    encrypted,
    decrypted,
  });
}

function testDynamic(): void {
  const password = 'Иван123';
  const encrypted = CryptHelper.password(password);
  console.log({
    password,
    encrypted,
    valid: CryptHelper.compare(password, encrypted),
  });
}

function testStatic(): void {
  // https://en.wikipedia.org/wiki/Bcrypt
  const password = 'HEFF6soop@thir';
  const encrypted = '$2a$08$QGb/YfHcN4zGNwpDMklPFuDMXcqCBWlF4N88/F3lc5ckyNYgtqjxe';
  const [, algorithm, cost, saltHash] = encrypted.split('$');
  const salt = saltHash.substring(0, 22);
  const hash = saltHash.substring(22, 22 + 31);
  console.log({
    password,
    encrypted,
    algorithm,
    cost,
    salt,
    hash,
    valid: bcrypt.compareSync(password, encrypted),
  });
}

void ((): void => {
  console.clear();
  testCrypt();
  testDynamic();
  testStatic();
})();
