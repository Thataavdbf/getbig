// lib/objectPool.ts

/**
 * Simple generic object pool for efficient object reuse.
 */
export class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private maxSize?: number;
  private inPoolSet: Set<T> = new Set();

  /**
   * @param createFn Function to create a new object.
   * @param initialSize Number of objects to preallocate.
   * @param maxSize Optional maximum pool size.
   */
  constructor(createFn: () => T, initialSize = 20, maxSize?: number) {
    this.createFn = createFn;
    this.maxSize = maxSize;
    for (let i = 0; i < initialSize; i++) {
      const obj = createFn();
      this.pool.push(obj);
      this.inPoolSet.add(obj);
    }
  }

  /** Get an object from the pool, or create a new one if empty. */
  get(): T {
    const obj = this.pool.pop() || this.createFn();
    this.inPoolSet.delete(obj);
    return obj;
  }

  /** Return an object to the pool. Prevents double-release. */
  release(obj: T) {
    if (this.inPoolSet.has(obj)) return;
    if (this.maxSize === undefined || this.pool.length < this.maxSize) {
      this.pool.push(obj);
      this.inPoolSet.add(obj);
    }
  }

  /** Current number of pooled objects. */
  size(): number {
    return this.pool.length;
  }

  /** Remove all objects from the pool. */
  clear() {
    this.pool.length = 0;
    this.inPoolSet.clear();
  }

  /** Get multiple objects from the pool. */
  static batchGet<T>(pool: ObjectPool<T>, count: number): T[] {
    const arr: T[] = [];
    for (let i = 0; i < count; i++) arr.push(pool.get());
    return arr;
  }

  /** Release multiple objects to the pool. */
  static batchRelease<T>(pool: ObjectPool<T>, items: T[]) {
    for (const item of items) pool.release(item);
  }
}