import type { SnapDBMiddleware } from '../index';

/**
 * ValidateMiddleware enforces key and value constraints before set.
 * Configurable with custom validation functions.
 */
export interface ValidateMiddlewareOptions {
  key?: (key: string) => boolean;
  value?: (value: unknown) => boolean;
}

export function ValidateMiddleware(options: ValidateMiddlewareOptions): SnapDBMiddleware {
  return {
    beforeSet(key, value) {
      if (options.key && !options.key(key)) {
        throw new Error(`Key validation failed for: ${key}`);
      }
      if (options.value && !options.value(value)) {
        throw new Error(`Value validation failed for: ${value}`);
      }
      return value;
    },
  };
} 