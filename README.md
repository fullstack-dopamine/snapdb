# SnapDBJS

A fast, lightweight, Redis-like in-memory database for Node.js with plugin and middleware support. Perfect for ephemeral data, rate limiting, OTPs, tokens, and more.

## Features
- In-memory key-value store
- Per-key TTL (time-to-live) and automatic expiry
- Namespaced keys for isolation
- Fully async API (Promise-based)
- TypeScript support out of the box
- Extensible via plugins and middleware

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
- `new SnapDB(options?)`: Create a new SnapDBJS instance
- `set(key, value, ttl?)`: Store a value with optional TTL
- `get(key)`: Retrieve a value
- `del(key)`: Delete a key
- `exists(key)`: Check if a key exists
- `keys(pattern?)`: List of keys, optionally filtered (supports `*` wildcard)
- `ttl(key)`: Remaining TTL for a key (ms)
- `stats()`: Returns `{ keys, memory }`
- `close()`: Stops background cleanup

## Advanced Usage
SnapDBJS supports a powerful plugin and middleware system for advanced use cases. See the following for more details:
- [Plugin System & Plugins](./docs/plugins.md)
- [Middleware System & Middleware](./docs/middleware.md)

## License
MIT 