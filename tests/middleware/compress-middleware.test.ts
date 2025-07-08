import { describe, it, expect } from 'vitest';
import SnapDB, { CompressMiddleware } from '../../src/index';

describe('CompressMiddleware', () => {
  it('compresses and decompresses string values', async () => {
    const db = new SnapDB({ middleware: [CompressMiddleware()] });
    await db.set('foo', 'barbaz');
    expect(await db.get('foo')).toBe('barbaz');
  });

  it('does not affect non-string values', async () => {
    const db = new SnapDB({ middleware: [CompressMiddleware()] });
    await db.set('num', 123);
    expect(await db.get('num')).toBe(123);
  });
}); 