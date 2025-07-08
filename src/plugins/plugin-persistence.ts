import type { SnapDBPlugin } from '../index';
import { promises as fs } from 'fs';

/**
 * PersistencePlugin saves the DB to disk on every set/del and loads on init.
 * Uses JSON serialization. Not for large datasets or high-frequency writes.
 */
export interface PersistencePluginOptions {
  file: string;
}

export function PersistencePlugin(options: PersistencePluginOptions): SnapDBPlugin {
  let db: any;
  return {
    async onInit(_db) {
      db = _db;
      try {
        const data = await fs.readFile(options.file, 'utf8');
        const { store, ttls } = JSON.parse(data);
        for (const [k, v] of Object.entries(store)) {
          db.store.set(k, v);
        }
        for (const [k, t] of Object.entries(ttls)) {
          db.ttls.set(k, t);
        }
        // Wait a tick to ensure data is available
        await new Promise(res => setTimeout(res, 10));
      } catch (e) {
        // File may not exist on first run
      }
    },
    async afterSet() {
      await save();
    },
    async afterDel() {
      await save();
    },
    async onClose() {
      await save();
    },
  };
  async function save() {
    if (!db) return;
    const store: Record<string, unknown> = {};
    for (const [k, v] of db.store.entries()) store[k] = v;
    const ttls: Record<string, number> = {};
    for (const [k, t] of db.ttls.entries()) ttls[k] = t;
    await fs.writeFile(options.file, JSON.stringify({ store, ttls }), 'utf8');
  }
} 