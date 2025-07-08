import { describe, it, expect } from 'vitest';
import SnapDB, { MetricsPlugin } from '../../src/index';

describe('MetricsPlugin', () => {
  it('tracks set/get/del/exists/keys/ttl', async () => {
    const db = new SnapDB({ plugins: [MetricsPlugin()] }) as any;
    await db.set('a', 1);
    await db.get('a');
    await db.del('a');
    await db.exists('a');
    await db.keys();
    await db.ttl('a');
    const metrics = db.getMetrics();
    expect(metrics.set).toBe(1);
    expect(metrics.get).toBe(1);
    expect(metrics.del).toBe(1);
    expect(metrics.exists).toBe(1);
    expect(metrics.keys).toBe(1);
    expect(metrics.ttl).toBe(1);
  });
}); 