import { createCipheriv, createDecipheriv, createHmac } from 'crypto';
import jwt, { JwtPayload } from 'jsonwebtoken';

export class GeneratorService {
  /**
   * Decode JWT token
   * @param token token string
   * @param keySecret secret key
   * @returns decoded data
   */
  static verifyJwtToken = async <T extends JwtPayload>(
    token: string,
    keySecret: string,
  ): Promise<{ data: T; verified: boolean }> => {
    return await new Promise((resolve) => {
      try {
        const data = jwt.verify(token, keySecret) as T;
        resolve({
          data,
          verified: true,
        });
      } catch {
        resolve({
          data: null,
          verified: false,
        });
      }
    });
  };

  /**
   * Create JWT token
   * @param payload data to encode in token
   * @param keySecret secret key
   * @param option signing options
   * @returns encoded token
   */
  static createToken = <T = any>(
    payload: T,
    keySecret: string,
    option?: jwt.SignOptions,
  ): string => jwt.sign(payload as any, keySecret, option);

  static uuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0,
        v = c == 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  static async makeHash(value: string, secret: string): Promise<string> {
    return createHmac('sha256', secret).update(value, 'utf-8').digest('hex');
  }

  static async verifyHas(
    hashValue: string,
    planText: string,
    secret: string,
  ): Promise<boolean> {
    const hashCheck = await this.makeHash(planText, secret);
    return hashCheck === hashValue;
  }

  static encode(
    data: string,
    key: string,
    algorithm: string = 'aes-256-cbc',
  ): string {
    const cipher = createCipheriv(
      algorithm,
      Buffer.alloc(32, key),
      Buffer.alloc(16, 0),
    );
    return Buffer.from(
      cipher.update(data, 'utf8', 'hex') + cipher.final('hex'),
    ).toString('hex');
  }

  /**
   *
   * Decode encrypted data that was encoded using the `encode` function.
   * @param encryptedData The encrypted data to be decoded.
   * @param key The key used to encode the data.
   * @param algorithm
   * @returns
   */
  static decode(
    encryptedData: string,
    key: string,
    algorithm: string = 'aes-256-cbc',
  ): string {
    const buff = Buffer.from(encryptedData, 'hex');
    const decipher = createDecipheriv(
      algorithm,
      Buffer.alloc(32, key),
      Buffer.alloc(16, 0),
    );
    return (
      decipher.update(buff.toString('utf8'), 'hex', 'utf8') +
      decipher.final('utf8')
    );
  }
}
