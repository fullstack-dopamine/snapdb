import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import SnapDB, { PersistencePlugin } from '../../src/index';
import { unlinkSync, existsSync } from 'fs';

const FILE = './testdb.json';

describe('PersistencePlugin', () => {
  beforeEach(() => { if (existsSync(FILE)) unlinkSync(FILE); });
  afterEach(() => { if (existsSync(FILE)) unlinkSync(FILE); });

  it('persists and loads string data', async () => {
    let db = new SnapDB({ plugins: [PersistencePlugin({ file: FILE })] });
    await db.set('foo', 'bar');
    await db.close();
    db = new SnapDB({ plugins: [PersistencePlugin({ file: FILE })] });
    await new Promise(res => setTimeout(res, 20));
    expect(await db.get('foo')).toBe('bar');
    await db.close();
  });

  it('persists and loads object data', async () => {
    let db = new SnapDB({ plugins: [PersistencePlugin({ file: FILE })] });
    await db.set('obj', { a: 1 });
    await db.close();
    db = new SnapDB({ plugins: [PersistencePlugin({ file: FILE })] });
    await new Promise(res => setTimeout(res, 20));
    expect(await db.get('obj')).toEqual({ a: 1 });
    await db.close();
  });

  it('persists and loads TTLs', async () => {
    let db = new SnapDB({ plugins: [PersistencePlugin({ file: FILE })] });
    await db.set('temp', 'gone', 100);
    await db.close();
    db = new SnapDB({ plugins: [PersistencePlugin({ file: FILE })] });
    await new Promise(res => setTimeout(res, 150));
    expect(await db.get('temp')).toBeUndefined();
    await db.close();
  });
}); 