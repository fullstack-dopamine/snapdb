import type { SnapDBMiddleware } from '../index';
import { deflateSync, inflateSync } from 'zlib';

/**
 * CompressMiddleware compresses values on set and decompresses on get using zlib.
 * Only compresses string values.
 */
export function CompressMiddleware(): SnapDBMiddleware {
  return {
    beforeSet(_key, value) {
      if (typeof value === 'string') {
        return deflateSync(Buffer.from(value)).toString('base64');
      }
      return value;
    },
    afterGet(_key, value) {
      if (typeof value === 'string') {
        try {
          const buf = Buffer.from(value, 'base64');
          return inflateSync(buf).toString();
        } catch {
          return value;
        }
      }
      return value;
    },
  };
} 