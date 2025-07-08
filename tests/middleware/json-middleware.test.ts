import { describe, it, expect } from 'vitest';
import SnapDB, { JSONMiddleware } from '../../src/index';

describe('JSONMiddleware', () => {
  it('serializes and deserializes objects', async () => {
    const db = new SnapDB({ middleware: [JSONMiddleware()] });
    const obj = { foo: 'bar', n: 42 };
    await db.set('obj', obj);
    expect(await db.get('obj')).toEqual(obj);
  });

  it('serializes and deserializes arrays', async () => {
    const db = new SnapDB({ middleware: [JSONMiddleware()] });
    const arr = [1, 2, 3];
    await db.set('arr', arr);
    expect(await db.get('arr')).toEqual(arr);
  });

  it('does not affect strings', async () => {
    const db = new SnapDB({ middleware: [JSONMiddleware()] });
    await db.set('str', 'hello');
    expect(await db.get('str')).toBe('hello');
  });

  it('does not affect null', async () => {
    const db = new SnapDB({ middleware: [JSONMiddleware()] });
    await db.set('null', null);
    expect(await db.get('null')).toBe(null);
  });
}); 