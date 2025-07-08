import type { SnapDBPlugin } from '../index';
import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

/**
 * EncryptionPlugin transparently encrypts/decrypts values at rest using a symmetric key.
 * Uses AES-256-GCM. Key is derived from passphrase.
 */
export interface EncryptionPluginOptions {
  passphrase: string;
}

export function EncryptionPlugin(options: EncryptionPluginOptions): SnapDBPlugin {
  const algorithm = 'aes-256-gcm';
  function deriveKey() {
    return scryptSync(options.passphrase, 'snapdbjs-salt', 32);
  }
  return {
    beforeSet(keyName: string, value: any, ttl?: number) {
      const key = deriveKey();
      const iv = randomBytes(12);
      const cipher = createCipheriv(algorithm, key, iv);
      let enc = cipher.update(JSON.stringify(value), 'utf8', 'base64');
      enc += cipher.final('base64');
      const tag = cipher.getAuthTag();
      // Store as {iv, tag, data}
      return { value: { __enc__: true, iv: iv.toString('base64'), tag: tag.toString('base64'), data: enc }, ttl };
    },
    beforeGet(key: string, value: any) {
      if (value && value.__enc__) {
        const keyBuf = deriveKey();
        const iv = Buffer.from(value.iv, 'base64');
        const tag = Buffer.from(value.tag, 'base64');
        const decipher = createDecipheriv(algorithm, keyBuf, iv);
        decipher.setAuthTag(tag);
        let dec = decipher.update(value.data, 'base64', 'utf8');
        dec += decipher.final('utf8');
        return JSON.parse(dec);
      }
      return value;
    },
  };
} 