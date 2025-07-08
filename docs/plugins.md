# SnapDBJS Plugin System

SnapDBJS supports a modular plugin system that allows you to extend and customize database behavior for advanced use cases.

## Overview
Plugins can hook into lifecycle and data operations (set, get, del, etc.) and are fully typesafe. You can use multiple plugins at once.

## Using Plugins
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

## Provided Plugins & Use Cases

### 1. LRUPlugin
**Evicts the least recently used key when a maximum number of keys is reached.**

**Use Case:**
- Caching: Limit memory usage by evicting old cache entries automatically.

**Example:**
```ts
import { LRUPlugin } from './plugins/plugin-lru';
const db = new SnapDB({ plugins: [LRUPlugin({ maxKeys: 100 })] });
```

### 2. PersistencePlugin
**Persists the database to disk (JSON) on every set/del and loads on startup.**

**Use Case:**
- Session/token storage: Retain data across restarts for non-critical persistence.

**Example:**
```ts
import { PersistencePlugin } from './plugins/plugin-persistence';
const db = new SnapDB({ plugins: [PersistencePlugin({ file: './snapdb.json' })] });
```

### 3. MetricsPlugin
**Tracks operation counts and exposes a `getMetrics()` method on the SnapDBJS instance.**

**Use Case:**
- Monitoring: Track usage patterns, detect hot keys, or debug performance.

**Example:**
```ts
import { MetricsPlugin } from './plugins/plugin-metrics';
const db = new SnapDB({ plugins: [MetricsPlugin()] }) as any;
console.log(db.getMetrics());
```

### 4. EncryptionPlugin
**Encrypts all values at rest using a passphrase.**

**Use Case:**
- Secure storage: Store sensitive data (tokens, secrets) in memory with encryption.

**Example:**
```ts
import { EncryptionPlugin } from './plugins/plugin-encryption';
const db = new SnapDB({ plugins: [EncryptionPlugin({ passphrase: 'mysecret' })] });
```

## Best Practices
- Combine plugins as needed for your use case.
- Test plugin interactions in your environment.
- For custom plugins, implement the `SnapDBPlugin` interface.

## Writing Custom Plugins
See the source code and type definitions for guidance on creating your own plugins. 