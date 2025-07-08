import type { SnapDBPlugin } from '../index';

/**
 * LRUPlugin evicts the least recently used key when maxKeys is reached.
 * It maintains a Map to track usage order. On each get/set, the key is moved to the end.
 * When a new key is set and the limit is reached, the oldest key is deleted.
 */
export interface LRUPluginOptions {
  maxKeys: number;
}

export function LRUPlugin(options: LRUPluginOptions): SnapDBPlugin {
  const usage = new Map<string, void>();
  let db: any;
  return {
    onInit(_db) {
      db = _db;
    },
    async beforeSet(key) {
      // Move key to end (most recently used)
      usage.delete(key);
      usage.set(key);
      // If over limit, evict oldest
      if (usage.size > options.maxKeys) {
        const oldest = usage.keys().next().value;
        if (oldest) {
          usage.delete(oldest);
          await db.del(oldest);
        }
      }
      return { value: arguments[1], ttl: arguments[2] };
    },
    async afterGet(key, value) {
      if (value !== undefined) {
        usage.delete(key);
        usage.set(key);
      }
    },
    async afterDel(key) {
      usage.delete(key);
    },
  };
} 