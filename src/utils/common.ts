import crypto from 'crypto';

export function generateId(prefix: string = ''): string {
  return `${prefix}${crypto.randomBytes(16).toString('hex')}`;
}

export function calculateHash(data: any): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

export function validateInput(input: any, schema: any): boolean {
  if (!input || !schema) return false;

  for (const [key, type] of Object.entries(schema)) {
    if (!(key in input)) return false;
    if (typeof input[key] !== type) return false;
  }

  return true;
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, 1000);
}

export function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = async (retryCount: number) => {
      try {
        const result = await operation();
        resolve(result);
      } catch (error) {
        if (retryCount === maxRetries) {
          reject(error);
          return;
        }
        await sleep(delay);
        attempt(retryCount + 1);
      }
    };

    attempt(0);
  });
}

export function memoize<T>(
  fn: (...args: any[]) => T,
  ttl: number = 60000
): (...args: any[]) => T {
  const cache = new Map<string, { value: T; timestamp: number }>();

  return (...args: any[]): T => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      return cached.value;
    }

    const result = fn(...args);
    cache.set(key, { value: result, timestamp: now });
    return result;
  };
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>): void => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>): void => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function parseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export class Result<T, E = Error> {
  private constructor(
    private readonly value: T | null,
    private readonly error: E | null
  ) {}

  static ok<T, E = Error>(value: T): Result<T, E> {
    return new Result<T, E>(value, null);
  }

  static err<T, E>(error: E): Result<T, E> {
    return new Result<T, E>(null, error);
  }

  isOk(): this is Result<T, never> {
    return this.error === null;
  }

  isErr(): this is Result<never, E> {
    return this.error !== null;
  }

  unwrap(): T {
    if (this.isOk()) {
      return this.value as T;
    }
    throw this.error;
  }

  unwrapOr(defaultValue: T): T {
    return this.isOk() ? (this.value as T) : defaultValue;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this.isOk()) {
      return Result.ok<U, E>(fn(this.value as T));
    }
    return Result.err<U, E>(this.error as E);
  }
} 