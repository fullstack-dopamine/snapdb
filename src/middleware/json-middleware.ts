import type { SnapDBMiddleware } from '../index';

/**
 * JSONMiddleware stringifies values on set and parses on get.
 * Allows storing objects as strings transparently.
 */
export function JSONMiddleware(): SnapDBMiddleware {
  return {
    beforeSet(_key, value) {
      // Only stringify objects/arrays, not strings/numbers/booleans/null
      if (typeof value === 'object' && value !== null) {
        return JSON.stringify(value);
      }
      return value;
    },
    afterGet(_key, value) {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value);
        } catch {
          return value;
        }
      }
      return value;
    },
  };
} 