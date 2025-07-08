import { describe, it, expect } from 'vitest';
import SnapDB, { ValidateMiddleware } from '../../src/index';

describe('ValidateMiddleware', () => {
  it('allows valid keys and values', async () => {
    const db = new SnapDB({ middleware: [ValidateMiddleware({ key: k => k.length < 3, value: v => typeof v === 'number' })] });
    await db.set('a', 1);
    expect(await db.get('a')).toBe(1);
  });

  it('throws on invalid key', async () => {
    const db = new SnapDB({ middleware: [ValidateMiddleware({ key: k => k.length < 3 })] });
    await expect(db.set('longkey', 1)).rejects.toThrow('Key validation failed');
  });

  it('throws on invalid value', async () => {
    const db = new SnapDB({ middleware: [ValidateMiddleware({ value: v => typeof v === 'number' })] });
    await expect(db.set('a', 'str')).rejects.toThrow('Value validation failed');
  });
}); 