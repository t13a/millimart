export interface Queue<T> extends Iterable<T> {
  dequeue(): T | undefined;
  enqueue(value: T): boolean;
  isEmpty(): boolean;
  isFull(): boolean;
  peek(): T | undefined;
}

export interface BlockingQueue<T> extends AsyncIterable<T> {
  dequeue(): Promise<T | undefined>;
  enqueue(value: T): Promise<void>;
  isEmpty(): boolean;
  isFull(): boolean;
  peek(): Promise<T | undefined>;
}

export type QueueBuffer<T> = Iterable<T> &
  Pick<T[], "at" | "length" | "push" | "shift">;
