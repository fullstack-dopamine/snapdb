import { describe, it, expect } from 'vitest';
import SnapDB, { EncryptionPlugin } from '../../src/index';

describe('EncryptionPlugin', () => {
  it('encrypts and decrypts objects', async () => {
    const db = new SnapDB({ plugins: [EncryptionPlugin({ passphrase: 'secret' })] });
    await db.set('foo', { bar: 42 });
    const value = await db.get('foo');
    expect(value).toEqual({ bar: 42 });
  });

  it('encrypts and decrypts strings', async () => {
    const db = new SnapDB({ plugins: [EncryptionPlugin({ passphrase: 'secret' })] });
    await db.set('str', 'hello');
    expect(await db.get('str')).toBe('hello');
  });

  it('does not store plaintext', async () => {
    const db = new SnapDB({ plugins: [EncryptionPlugin({ passphrase: 'secret' })] });
    await db.set('foo', 'bar');
    // @ts-expect-error: access private store for test
    const raw = db.store.get('foo');
    expect(typeof raw).toBe('object');
    expect(raw.__enc__).toBe(true);
  });

  it('returns undefined for missing key', async () => {
    const db = new SnapDB({ plugins: [EncryptionPlugin({ passphrase: 'secret' })] });
    expect(await db.get('nope')).toBeUndefined();
  });

  it('throws or returns undefined with wrong passphrase', async () => {
    const db = new SnapDB({ plugins: [EncryptionPlugin({ passphrase: 'secret' })] });
    await db.set('foo', 'bar');
    const db2 = new SnapDB({ plugins: [EncryptionPlugin({ passphrase: 'wrong' })] });
    // @ts-expect-error: access private store for test
    const raw = db.store.get('foo');
    let threw = false;
    try {
      // @ts-expect-error: access private store for test
      await db2.plugins[0].beforeGet?.('foo', raw);
    } catch {
      threw = true;
    }
    expect(threw).toBe(true);
  });
}); 