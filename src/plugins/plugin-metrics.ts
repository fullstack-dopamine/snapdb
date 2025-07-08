import type { SnapDBPlugin } from '../index';

/**
 * MetricsPlugin tracks operation counts (set, get, del, exists, keys, ttl).
 * Exposes a getMetrics() method on the SnapDB instance.
 */
export function MetricsPlugin(): SnapDBPlugin {
  const metrics = {
    set: 0,
    get: 0,
    del: 0,
    exists: 0,
    keys: 0,
    ttl: 0,
  };
  return {
    afterSet() { metrics.set++; },
    afterGet() { metrics.get++; },
    afterDel() { metrics.del++; },
    // No hooks for exists/keys/ttl, so monkey-patch methods
    onInit(db) {
      const origExists = db.exists.bind(db) as (...args: any[]) => any;
      db.exists = async function (...args: any[]): Promise<any> {
        metrics.exists++;
        return origExists(...args);
      };
      const origKeys = db.keys.bind(db) as (...args: any[]) => any;
      db.keys = async function (...args: any[]): Promise<any> {
        metrics.keys++;
        return origKeys(...args);
      };
      const origTtl = db.ttl.bind(db) as (...args: any[]) => any;
      db.ttl = async function (...args: any[]): Promise<any> {
        metrics.ttl++;
        return origTtl(...args);
      };
      (db as any).getMetrics = () => ({ ...metrics });
    },
  };
} 