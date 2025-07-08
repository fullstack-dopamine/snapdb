import type { SnapDBMiddleware } from '../index';

/**
 * LoggingMiddleware logs all set and get operations for debugging and audit.
 */
export function LoggingMiddleware(): SnapDBMiddleware {
  return {
    beforeSet(key, value) {
      console.log(`[SnapDB] SET ${key}:`, value);
      return value;
    },
    afterGet(key, value) {
      if (value !== undefined) {
        console.log(`[SnapDB] GET ${key}:`, value);
      }
      return value;
    },
  };
} 