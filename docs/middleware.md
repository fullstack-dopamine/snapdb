# SnapDBJS Middleware System

SnapDBJS supports middleware for value transformation, validation, logging, and more. Middleware can be chained and is fully typesafe.

## Overview
Middleware intercepts and transforms values on set/get operations. You can use multiple middleware in sequence.

## Using Middleware
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

## Provided Middleware & Use Cases

### 1. JSONMiddleware
**Stringifies objects on set, parses on get.**

**Use Case:**
- Store complex objects as strings for compatibility or serialization.

**Example:**
```ts
import { JSONMiddleware } from './middleware/json-middleware';
const db = new SnapDB({ middleware: [JSONMiddleware()] });
```

### 2. LoggingMiddleware
**Logs all set/get operations.**

**Use Case:**
- Debugging: Track all database operations for audit or troubleshooting.

**Example:**
```ts
import { LoggingMiddleware } from './middleware/logging-middleware';
const db = new SnapDB({ middleware: [LoggingMiddleware()] });
```

### 3. ValidateMiddleware
**Enforces key/value constraints (configurable).**

**Use Case:**
- Data integrity: Ensure only valid keys/values are stored.

**Example:**
```ts
import { ValidateMiddleware } from './middleware/validate-middleware';
const db = new SnapDB({ middleware: [ValidateMiddleware({ key: k => k.length < 32, value: v => typeof v === 'number' })] });
```

### 4. CompressMiddleware
**Compresses string values on set, decompresses on get.**

**Use Case:**
- Save memory: Store large strings in compressed form.

**Example:**
```ts
import { CompressMiddleware } from './middleware/compress-middleware';
const db = new SnapDB({ middleware: [CompressMiddleware()] });
```

## Best Practices
- Chain middleware in the order you want them applied.
- Validate and test middleware combinations for your use case.
- For custom middleware, implement the `SnapDBMiddleware` interface.

## Writing Custom Middleware
See the source code and type definitions for guidance on creating your own middleware. 