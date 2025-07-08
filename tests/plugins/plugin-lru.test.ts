import { describe, it, expect } from 'vitest';
import SnapDB, { LRUPlugin } from '../../src/index';

describe('LRUPlugin', () => {
  it('evicts least recently used key', async () => {
    const db = new SnapDB({ plugins: [LRUPlugin({ maxKeys: 2 })] });
    await db.set('a', 1);
    await db.set('b', 2);
    await db.set('c', 3); // evicts 'a'
    expect(await db.get('a')).toBeUndefined();
    expect(await db.get('b')).toBe(2);
    expect(await db.get('c')).toBe(3);
  });

  it('updates recency on get', async () => {
    const db = new SnapDB({ plugins: [LRUPlugin({ maxKeys: 2 })] });
    await db.set('a', 1);
    await db.set('b', 2);
    await db.get('a'); // 'a' is now most recent
    await db.set('c', 3); // evicts 'b'
    expect(await db.get('a')).toBe(1);
    expect(await db.get('b')).toBeUndefined();
    expect(await db.get('c')).toBe(3);
  });
}); 