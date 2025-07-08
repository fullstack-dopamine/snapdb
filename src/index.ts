// SnapDB: Lightweight in-memory DB for Node.js

/**
 * SnapDBPlugin interface defines hooks for extending SnapDB functionality.
 * Plugins can hook into set/get/del/exists/keys/ttl and lifecycle events.
 */
export interface SnapDBPlugin {
  /** Called after SnapDB is constructed. */
  onInit?(db: SnapDB): void | Promise<void>;
  /** Called before a value is set. Can modify value or TTL. */
  beforeSet?(key: string, value: any, ttl?: number): { value: any; ttl?: number } | Promise<{ value: any; ttl?: number }>;
  /** Called after a value is set. */
  afterSet?(key: string, value: any, ttl?: number): void | Promise<void>;
  /** Called before a value is retrieved. Can transform the value. */
  beforeGet?(key: string, value: any): any | Promise<any>;
  /** Called after a value is retrieved. */
  afterGet?(key: string, value: any): void | Promise<void>;
  /** Called before a key is deleted. */
  beforeDel?(key: string): void | Promise<void>;
  /** Called after a key is deleted. */
  afterDel?(key: string): void | Promise<void>;
  /** Called before SnapDB is closed. */
  onClose?(db: SnapDB): void | Promise<void>;
}

/**
 * SnapDBMiddleware interface for intercepting and transforming values on set/get.
 */
export interface SnapDBMiddleware {
  beforeSet?(key: string, value: unknown): unknown | Promise<unknown>;
  afterGet?(key: string, value: unknown): unknown | Promise<unknown>;
}

export interface SnapDBOptions {
  defaultTTL?: number; // ms
  cleanupInterval?: number; // ms
  namespace?: string;
  plugins?: SnapDBPlugin[];
  middleware?: SnapDBMiddleware[];
}

export default class SnapDB {
  private store: Map<string, unknown>;
  private ttls: Map<string, number>;
  private defaultTTL: number;
  private cleanupInterval: number;
  private namespace: string;
  private cleanupTimer: NodeJS.Timeout | null = null;
  private plugins: SnapDBPlugin[];
  private middleware: SnapDBMiddleware[];

  constructor(options: SnapDBOptions = {}) {
    this.store = new Map();
    this.ttls = new Map();
    this.defaultTTL = options.defaultTTL ?? 0;
    this.cleanupInterval = options.cleanupInterval ?? 1000;
    this.namespace = options.namespace ?? '';
    this.plugins = options.plugins ?? [];
    this.middleware = options.middleware ?? [];
    this.startCleanup();
    // Call plugin onInit hooks
    for (const plugin of this.plugins) {
      plugin.onInit?.(this);
    }
  }

  private getKey(key: string): string {
    return this.namespace ? `${this.namespace}:${key}` : key;
  }

  private startCleanup() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.cleanupTimer = setInterval(() => this.cleanupExpired(), this.cleanupInterval);
  }

  private cleanupExpired() {
    const now = Date.now();
    for (const [key, expireAt] of this.ttls.entries()) {
      if (expireAt <= now) {
        this.store.delete(key);
        this.ttls.delete(key);
      }
    }
  }

  /**
   * Store a value with optional TTL. Calls middleware and plugin hooks.
   */
  async set(key: string, value: unknown, ttl?: number): Promise<void> {
    const fullKey = this.getKey(key);
    // Middleware beforeSet hooks
    for (const mw of this.middleware) {
      if (mw.beforeSet) value = await mw.beforeSet(key, value);
    }
    // Plugin beforeSet hooks
    for (const plugin of this.plugins) {
      if (plugin.beforeSet) {
        const result = await plugin.beforeSet(key, value, ttl);
        value = result.value;
        ttl = result.ttl ?? ttl;
      }
    }
    this.store.set(fullKey, value);
    if (ttl || this.defaultTTL) {
      this.ttls.set(fullKey, Date.now() + (ttl ?? this.defaultTTL));
    } else {
      this.ttls.delete(fullKey);
    }
    // Plugin afterSet hooks
    for (const plugin of this.plugins) {
      await plugin.afterSet?.(key, value, ttl);
    }
  }

  /**
   * Retrieve a value. Calls plugin and middleware hooks.
   */
  async get<T = unknown>(key: string): Promise<T | undefined> {
    const fullKey = this.getKey(key);
    if (this.ttls.has(fullKey) && this.ttls.get(fullKey)! <= Date.now()) {
      this.store.delete(fullKey);
      this.ttls.delete(fullKey);
      return undefined;
    }
    let value: unknown = this.store.get(fullKey);
    // Plugin beforeGet hooks (can transform value)
    for (const plugin of this.plugins) {
      if (plugin.beforeGet) value = await plugin.beforeGet(key, value);
    }
    // Middleware afterGet hooks
    for (const mw of this.middleware) {
      if (mw.afterGet) value = await mw.afterGet(key, value);
    }
    for (const plugin of this.plugins) {
      await plugin.afterGet?.(key, value);
    }
    return value as T | undefined;
  }

  /**
   * Delete a key. Calls plugin hooks before/after del.
   */
  async del(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    for (const plugin of this.plugins) {
      await plugin.beforeDel?.(key);
    }
    this.ttls.delete(fullKey);
    const deleted = this.store.delete(fullKey);
    for (const plugin of this.plugins) {
      await plugin.afterDel?.(key);
    }
    return deleted;
  }

  /**
   * Check if a key exists.
   */
  async exists(key: string): Promise<boolean> {
    const fullKey = this.getKey(key);
    if (this.ttls.has(fullKey) && this.ttls.get(fullKey)! <= Date.now()) {
      this.store.delete(fullKey);
      this.ttls.delete(fullKey);
      return false;
    }
    return this.store.has(fullKey);
  }

  /**
   * List keys, optionally filtered by pattern (supports * wildcard).
   */
  async keys(pattern?: string): Promise<string[]> {
    const prefix = this.namespace ? `${this.namespace}:` : '';
    let keys = Array.from(this.store.keys())
      .filter(k => k.startsWith(prefix))
      .map(k => k.slice(prefix.length));
    if (pattern) {
      const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
      keys = keys.filter(k => regex.test(k));
    }
    return keys;
  }

  /**
   * Get remaining TTL for a key in ms, or null if no TTL.
   */
  async ttl(key: string): Promise<number | null> {
    const fullKey = this.getKey(key);
    if (!this.ttls.has(fullKey)) return null;
    const expires = this.ttls.get(fullKey)!;
    const remaining = expires - Date.now();
    return remaining > 0 ? remaining : null;
  }

  /**
   * Get stats (number of keys, memory usage estimate).
   */
  async stats() {
    return {
      keys: this.store.size,
      memory: 0 // TODO: estimate memory usage
    };
  }

  /**
   * Close SnapDB and stop background cleanup. Calls plugin onClose hooks.
   */
  async close() {
    if (this.cleanupTimer) clearInterval(this.cleanupTimer);
    this.cleanupTimer = null;
    for (const plugin of this.plugins) {
      await plugin.onClose?.(this);
    }
  }
}

// Export plugins
export { LRUPlugin } from './plugins/plugin-lru';
export { PersistencePlugin } from './plugins/plugin-persistence';
export { MetricsPlugin } from './plugins/plugin-metrics';
export { EncryptionPlugin } from './plugins/plugin-encryption';

// Export middleware
export { JSONMiddleware } from './middleware/json-middleware';
export { LoggingMiddleware } from './middleware/logging-middleware';
export { ValidateMiddleware } from './middleware/validate-middleware';
export { CompressMiddleware } from './middleware/compress-middleware';
