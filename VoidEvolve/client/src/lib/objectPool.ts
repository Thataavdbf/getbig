// lib/objectPool.ts

/**
 * Object pool for efficient reuse of game objects
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn?: (obj: T) => void;
  private maxSize: number;

  /**
   * @param createFn Function to create a new object.
   * @param options Optional settings for the object pool.
   * @param options.resetFn Optional function to reset an object before reuse.
   * @param options.maxSize Optional maximum pool size. Defaults to 1000.
   */
  constructor(
    createFn: () => T,
    options?: { resetFn?: (obj: T) => void; maxSize?: number }
  ) {
    this.createFn = createFn;
    this.resetFn = options?.resetFn;
    this.maxSize = options?.maxSize || 1000;
  }

  /**
   * Get an object from the pool or create a new one
   */
  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  /**
   * Return an object to the pool
   */
  release(obj: T): void {
    // Limit pool size to prevent memory leaks
    if (this.pool.length < this.maxSize) {
      if (this.resetFn) {
        this.resetFn(obj);
      }
      this.pool.push(obj);
    }
  }

  /**
   * Clear the pool
   */
  clear(): void {
    this.pool = [];
  }

  /**
   * Get current pool size
   */
  get size(): number {
    return this.pool.length;
  }
}
