import assert from "assert";
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
      throw new EventStoreError("DuplicateError", { eventId });
    }
    const index = this.events.length;
    this.events.push(event);
    this.indexes.set(eventId, index);
  }

  private indexOf(eventId: string): number {
    const index = this.indexes.get(eventId);
    if (index === undefined) {
      throw new EventStoreError("NotFoundError", { eventId });
    }
    return index;
  }

  read(options?: EventStoreReadOptions): AsyncIterable<T> {
    const startIndex =
      options?.fromEventId !== undefined
        ? this.indexOf(options.fromEventId)
        : 0;

    const endIndex =
      options?.toEventId !== undefined
        ? this.indexOf(options.toEventId)
        : this.events.length - 1;

    const skipCount = options?.skipCount ?? 0;
    assert(skipCount >= 0);

    const maxCount = options?.maxCount ?? -1;
    assert(maxCount >= -1);

    return (async function* <T>(events: T[]): AsyncIterable<T> {
      for (
        let index = startIndex + skipCount;
        index <= endIndex && index - startIndex !== maxCount + skipCount;
        index++
      ) {
        yield events[index];
      }
    })(this.events);
  }

  async readOne(eventId: string): Promise<T> {
    const index = this.indexOf(eventId);
    return this.events[index];
  }
}
