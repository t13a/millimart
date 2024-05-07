import { QueueBuffer } from "./types";

export class RingBuffer<T> implements QueueBuffer<T> {
  private data: (T | undefined)[];
  private readIndex: number = 0;
  private writeIndex: number = 0;

  constructor(private readonly capacity: number) {
    if (this.capacity <= 0) {
      throw new RangeError("The capacity must be greater than zero.");
    }
    this.data = new Array(capacity);
  }

  get length(): number {
    return (
      (this.capacity + 1 + this.writeIndex - this.readIndex) %
      (this.capacity + 1)
    );
  }

  set length(_value: number) {
    throw new Error("Not implemented yet.");
  }

  at(index: number): T | undefined {
    const i = index < 0 ? this.length + index : index;
    if (i < 0 || i >= this.length) {
      return undefined;
    }
    return this.data[(this.readIndex + i) % this.capacity];
  }

  push(...items: T[]): number {
    for (let i = 0; i < items.length; i++) {
      if (this.length === this.capacity) {
        throw new Error("The buffer is full.");
      }
      this.data[this.writeIndex % this.capacity] = items[i];
      this.writeIndex++;
    }
    return this.length;
  }

  shift(): T | undefined {
    if (this.length === 0) {
      return undefined;
    }
    const item = this.data[this.readIndex];
    this.data[this.readIndex] = undefined;
    this.readIndex++;
    return item;
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    const next = (): IteratorResult<T> => {
      const value = this.at(index++);
      return value !== undefined ? { value } : { done: true, value };
    };
    return { next };
  }
}
