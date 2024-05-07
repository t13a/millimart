import { BlockingQueue, QueueBuffer } from "./types";

export class DefaultBlockingQueue<T> implements BlockingQueue<T> {
  private buffer: QueueBuffer<T>;
  private dequeings: ((value: T) => void)[] = [];
  private enqueings: (() => void)[] = [];

  constructor(private capacity: number) {
    if (this.capacity < 1) {
      throw new RangeError("The capacity must be greateer than zero.");
    }
    this.buffer = new Array<T>();
  }

  dequeue(): Promise<T | undefined> {
    return new Promise<T | undefined>(async (resolve) => {
      if (this.isEmpty()) {
        this.dequeings.push((value: T) => resolve(value));
        if (this.enqueings.length > 0) {
          this.enqueings.shift()!();
        }
      } else {
        resolve(this.buffer.shift()!);
      }
    });
  }

  enqueue(value: T): Promise<void> {
    return new Promise(async (resolve) => {
      const enqueing = () => {
        this.buffer.push(value);
        resolve();
      };
      const dequeing = this.dequeings.shift();
      if (dequeing) {
        resolve();
        dequeing(value);
      } else if (this.isFull()) {
        this.enqueings.push(() => enqueing());
      } else {
        enqueing();
      }
    });
  }

  isEmpty(): boolean {
    return this.buffer.length === 0;
  }

  isFull(): boolean {
    return this.buffer.length === this.capacity;
  }

  async peek(): Promise<T | undefined> {
    return this.buffer.at(0);
  }

  [Symbol.asyncIterator](): AsyncIterator<T> {
    const next = async (): Promise<IteratorResult<T>> => {
      const value = await this.dequeue();
      return value !== undefined
        ? { done: false, value }
        : { done: true, value };
    };
    return { next };
  }
}
