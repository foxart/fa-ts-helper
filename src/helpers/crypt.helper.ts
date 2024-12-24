import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
// import CryptoJS from 'crypto-js';
type WordArray = CryptoJS.lib.WordArray;

class CryptSingleton {
  private static self: CryptSingleton;

  private readonly algorithm = 'aes-256-cbc';

  private readonly encoding = 'base64';

  public static getInstance(): CryptSingleton {
    if (!CryptSingleton.self) {
      CryptSingleton.self = new CryptSingleton();
    }
    return CryptSingleton.self;
  }

  public encrypt(data: string, secret: string, throws = false): string {
    try {
      // const iv = crypto.randomBytes(16);
      // const key = crypto.scryptSync(secret, 'salt', 32);
      // const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
      // let encrypted = cipher.update(data, 'utf8', 'base64');
      // encrypted += cipher.final('base64');
      // return iv.toString('base64') + ':' + encrypted;
      const key = crypto.createHash('sha256').update(secret).digest();
      const iv = Buffer.from(Array(16).fill(0));
      const cipher = crypto.createCipheriv(this.algorithm, key, iv);
      let encrypted = cipher.update(data, 'utf8', this.encoding);
      encrypted += cipher.final(this.encoding);
      return encrypted;
    } catch (e) {
      (e as Error).name = (e as Error).message;
      (e as Error).message = `Encryption failed for: ${data}`;
      if (throws) {
        throw e;
      } else {
        console.log(e);
      }
      return data;
    }
  }

  public decrypt(data: string, secret: string, throws = false): string {
    try {
      // const [ivString, encryptedData] = data.split(':');
      // const iv = Buffer.from(ivString, 'base64');
      // const key = crypto.scryptSync(secret, 'salt', 32);
      // const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
      // let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
      // decrypted += decipher.final('utf8');
      // return decrypted;
      const key = crypto.createHash('sha256').update(secret).digest();
      const iv = Buffer.from(Array(16).fill(0));
      const decipher = crypto.createDecipheriv(this.algorithm, key, iv);
      let decrypted = decipher.update(data, this.encoding, 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      (e as Error).name = (e as Error).message;
      (e as Error).message = `Decryption failed for: ${data}`;
      if (throws) {
        throw e;
      } else {
        console.log(e);
      }
      return data;
    }
  }

  public md5(message: string, key?: string): string {
    if (key) {
      return crypto.createHmac('md5', key).update(message).digest('hex');
    }
    return crypto.createHash('md5').update(message).digest('hex');
  }

  public cryptPassword(password: string, rounds = 10): string {
    return bcrypt.hashSync(password, rounds);
  }

  public comparePassportWithHash(password: string, hash: string): boolean {
    return bcrypt.compareSync(password, hash);
  }

  public salt(rounds = 10): string {
    return bcrypt.genSaltSync(rounds);
  }

  public parseHash(input: string): { algorithm: string; cost: string; salt: string; hash: string } {
    const [, algorithm, cost, saltHash] = input.split('$');
    const [salt, hash] = [saltHash.slice(0, 22), saltHash.slice(22)];
    return { algorithm, cost, salt, hash };
  }

  public random(nBytes = 16): string {
    // return CryptoJS.lib.WordArray.random(nBytes ? nBytes : 16).toString();
    return crypto.randomBytes(nBytes).toString('hex');
  }

  private wordArrayToString(data: WordArray): string {
    return CryptoJS.enc.Base64.stringify(data);
  }
}

export const CryptHelper = CryptSingleton.getInstance();
