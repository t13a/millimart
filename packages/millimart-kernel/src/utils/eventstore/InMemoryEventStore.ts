import { EventStoreError } from "./EventStoreError";
import { EventStore, EventStoreReadOptions } from "./types";

type ToEventId<T> = (event: T) => string;

export class InMemoryEventStore<T> implements EventStore<T> {
  private events: T[] = [];
  private indexes = new Map<string, number>();

  constructor(private toEventId: ToEventId<T>) {}

  async append(event: T): Promise<void> {
    const eventId = this.toEventId(event);
    if (this.indexes.has(eventId)) {
      throw new EventStoreError("DuplicateError");
    }
    const index = this.events.length;
    this.events.push(event);
    this.indexes.set(eventId, index);
  }

  read(eventId: string): Promise<T>;

  read(options?: EventStoreReadOptions): AsyncIterable<T>;

  read(arg?: string | EventStoreReadOptions): Promise<T> | AsyncIterable<T> {
    if (typeof arg === "string") {
      return new Promise((resolve) => resolve(this.readOne(arg)));
    } else {
      return this.readAll(arg);
    }
  }

  private readOne(eventId: string): T {
    const index = this.indexes.get(eventId);

    if (index === undefined) {
      throw new EventStoreError("NotFoundError");
    }

    return this.events[index];
  }

  private readAll(options?: EventStoreReadOptions): AsyncIterable<T> {
    const startIndex = options?.fromEventId
      ? this.indexes.get(options.fromEventId)
      : 0;

    if (startIndex === undefined) {
      throw new EventStoreError("NotFoundError");
    }

    const endIndex = options?.toEventId
      ? this.indexes.get(options.toEventId)
      : this.events.length - 1;

    if (endIndex === undefined) {
      throw new EventStoreError("NotFoundError");
    }

    const maxCount = options?.maxCount ?? -1;

    return (async function* <T>(events: T[]): AsyncIterable<T> {
      for (
        let index = startIndex;
        index <= endIndex && index - startIndex !== maxCount;
        index++
      ) {
        yield events[index];
      }
    })(this.events);
  }
}
