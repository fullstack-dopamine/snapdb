import { describe, it, expect } from 'vitest';
import SnapDB from '../src/index';

describe('SnapDB core', () => {
  it('set and get a value', async () => {
    const db = new SnapDB();
    await db.set('foo', 'bar');
    expect(await db.get('foo')).toBe('bar');
  });

  it('deletes a value', async () => {
    const db = new SnapDB();
    await db.set('foo', 'bar');
    await db.del('foo');
    expect(await db.get('foo')).toBeUndefined();
  });

  it('checks existence', async () => {
    const db = new SnapDB();
    await db.set('foo', 'bar');
    expect(await db.exists('foo')).toBe(true);
    await db.del('foo');
    expect(await db.exists('foo')).toBe(false);
  });

  it('lists keys and supports pattern', async () => {
    const db = new SnapDB();
    await db.set('a', 1);
    await db.set('b', 2);
    await db.set('c', 3);
    expect(await db.keys()).toEqual(expect.arrayContaining(['a', 'b', 'c']));
    expect(await db.keys('a')).toEqual(['a']);
    expect(await db.keys('*')).toEqual(expect.arrayContaining(['a', 'b', 'c']));
  });

  it('supports TTL and automatic expiry', async () => {
    const db = new SnapDB();
    await db.set('temp', 'gone', 50);
    expect(await db.get('temp')).toBe('gone');
    await new Promise(res => setTimeout(res, 70));
    expect(await db.get('temp')).toBeUndefined();
  });

  it('returns correct TTL', async () => {
    const db = new SnapDB();
    await db.set('foo', 'bar', 100);
    const ttl = await db.ttl('foo');
    expect(ttl).toBeGreaterThan(0);
    await new Promise(res => setTimeout(res, 120));
    expect(await db.ttl('foo')).toBeNull();
  });

  it('supports namespaces', async () => {
    const db1 = new SnapDB({ namespace: 'ns1' });
    const db2 = new SnapDB({ namespace: 'ns2' });
    await db1.set('foo', 'bar');
    await db2.set('foo', 'baz');
    expect(await db1.get('foo')).toBe('bar');
    expect(await db2.get('foo')).toBe('baz');
  });

  it('returns stats', async () => {
    const db = new SnapDB();
    await db.set('a', 1);
    await db.set('b', 2);
    const stats = await db.stats();
    expect(stats.keys).toBe(2);
    expect(typeof stats.memory).toBe('number');
  });
}); 