import { describe, it, expect, vi } from 'vitest';
import SnapDB, { LoggingMiddleware } from '../../src/index';

describe('LoggingMiddleware', () => {
  it('logs set and get operations', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const db = new SnapDB({ middleware: [LoggingMiddleware()] });
    await db.set('foo', 'bar');
    await db.get('foo');
    expect(spy).toHaveBeenCalledWith('[SnapDB] SET foo:', 'bar');
    expect(spy).toHaveBeenCalledWith('[SnapDB] GET foo:', 'bar');
    spy.mockRestore();
  });

  it('does not log for missing key on get', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => { });
    const db = new SnapDB({ middleware: [LoggingMiddleware()] });
    await db.get('nope');
    expect(spy).not.toHaveBeenCalledWith('[SnapDB] GET nope:', undefined);
    spy.mockRestore();
  });
}); 