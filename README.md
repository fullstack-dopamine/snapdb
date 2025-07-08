# SnapDB

A lightweight, fast, in-memory key-value store for Node.js, inspired by Redis. Perfect for ephemeral data like rate limiting, OTPs, tokens, and feature flags—no external dependencies, minimal memory footprint.

## Features
- In-memory key-value store
- Supports strings, numbers, and JSON-serializable values
- Per-key TTL (time-to-live) and automatic expiry
- Namespaced keys for isolation
- Fully async API (Promise-based)
- Configurable options (default TTL, cleanup interval)
- TypeScript support out of the box

## Install
```sh
npm install snapdbjs
```

## Usage
```ts
import SnapDB from 'snapdbjs';

const db = new SnapDB({ defaultTTL: 60000 });

await db.set('otp:12345', '894023', 300000); // 5 min TTL
const otp = await db.get('otp:12345');

await db.del('otp:12345');
const exists = await db.exists('otp:12345'); // false
```

## API
### new SnapDB(options?)
- `defaultTTL` (ms): Default TTL for keys (optional)
- `cleanupInterval` (ms): How often to purge expired keys (default: 1000)
- `namespace`: Prefix for all keys (optional)

### Methods
- `set(key, value, ttl?)`: Store a value with optional TTL
- `get(key)`: Retrieve a value
- `del(key)`: Delete a key
- `exists(key)`: Check if a key exists
- `keys(pattern?)`: List of keys, optionally filtered (supports `*` wildcard)
- `ttl(key)`: Remaining TTL for a key (ms)
- `stats()`: Returns `{ keys, memory }`
- `close()`: Stops background cleanup

## Use Cases
- Rate limiting
- OTP/session/token storage
- Feature flags
- Temporary data for APIs

## Limitations
- Not for persistent or distributed storage
- No clustering/replication
- Memory usage scales with data

## License
MIT 

## Plugin System
SnapDB supports a powerful plugin system for advanced use cases. Plugins can hook into lifecycle and data operations (set, get, del, etc.) and are fully typesafe.

### Using Plugins
```ts
import SnapDB from 'snapdbjs';
import { LRUPlugin } from './plugins/plugin-lru';
import { PersistencePlugin } from './plugins/plugin-persistence';
import { MetricsPlugin } from './plugins/plugin-metrics';
import { EncryptionPlugin } from './plugins/plugin-encryption';

const db = new SnapDB({
  plugins: [
    LRUPlugin({ maxKeys: 1000 }),
    PersistencePlugin({ file: './snapdb.json' }),
    MetricsPlugin(),
    EncryptionPlugin({ passphrase: 'mysecret' })
  ]
});
```

## Middleware System
SnapDB supports middleware for value transformation, validation, logging, and more. Middleware can be chained and is fully typesafe.

### Using Middleware
```ts
import { JSONMiddleware } from './middleware/json-middleware';
import { LoggingMiddleware } from './middleware/logging-middleware';
import { ValidateMiddleware } from './middleware/validate-middleware';
import { CompressMiddleware } from './middleware/compress-middleware';

const db = new SnapDB({
  middleware: [
    JSONMiddleware(),
    LoggingMiddleware(),
    ValidateMiddleware({ key: k => k.length < 32, value: v => typeof v !== 'undefined' }),
    CompressMiddleware()
  ]
});
```

### Provided Middleware
- **JSONMiddleware**: Stringifies objects on set, parses on get.
- **LoggingMiddleware**: Logs all set/get operations.
- **ValidateMiddleware**: Enforces key/value constraints (configurable).
- **CompressMiddleware**: Compresses string values on set, decompresses on get.

## Provided Plugins

### LRUPlugin
Evicts the least recently used key when a maximum number of keys is reached.
```ts
import { LRUPlugin } from './plugins/plugin-lru';
const lru = LRUPlugin({ maxKeys: 100 });
```

### PersistencePlugin
Persists the database to disk (JSON) on every set/del and loads on startup.
```ts
import { PersistencePlugin } from './plugins/plugin-persistence';
const persistence = PersistencePlugin({ file: './snapdb.json' });
```

### MetricsPlugin
Tracks operation counts and exposes a `getMetrics()` method on the SnapDB instance.
```ts
import { MetricsPlugin } from './plugins/plugin-metrics';
const metrics = MetricsPlugin();
// Usage: db.getMetrics()
```

### EncryptionPlugin
Encrypts values at rest using a symmetric passphrase (AES-256-GCM).
```ts
import { EncryptionPlugin } from './plugins/plugin-encryption';
const encryption = EncryptionPlugin({ passphrase: 'mysecret' });
```

## Type Safety
All plugins, middleware, and core APIs are fully typed with TypeScript for maximum safety and IDE support. 