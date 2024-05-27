import assert from "assert";
import EventEmitter from "events";
import { EventStoreError } from "./EventStoreError";
import {
  EventStore,
  EventStoreEventMap,
  EventStoreReadOptions,
  ExtractEventId,
} from "./types";

export class InMemoryEventStore<T>
  extends EventEmitter<EventStoreEventMap<T>>
  implements EventStore<T>
{
  private events: T[] = [];
  private indexes = new Map<string, number>();

  constructor(readonly extractEventId: ExtractEventId<T>) {
    super({ captureRejections: true });
  }

  async append(event: T): Promise<void> {
    const eventId = this.extractEventId(event);
    if (this.indexes.has(eventId)) {
      throw new EventStoreError("DuplicateError", { eventId });
    }
    const index = this.events.length;
    this.events.push(event);
    this.indexes.set(eventId, index);
    try {
      this.emit("append", event);
    } catch (error) {
      this.emit("error", error);
    }
  }

  private indexOfThrow(eventId: string): number {
    const index = this.indexes.get(eventId);
    if (index === undefined) {
      throw new EventStoreError("NotFoundError", { eventId });
    }
    return index;
  }

  read(options?: EventStoreReadOptions): AsyncIterable<T> {
    const direction = options?.direction ?? "forwards";

    const startIndex =
      options?.fromEventId !== undefined
        ? this.indexOfThrow(options.fromEventId)
        : direction === "forwards"
          ? 0
          : this.events.length - 1;

    const endIndex =
      options?.toEventId !== undefined
        ? this.indexOfThrow(options.toEventId)
        : direction === "forwards"
          ? this.events.length - 1
          : 0;

    const skipCount = options?.skipCount ?? 0;
    assert(skipCount >= 0);

    const maxCount = options?.maxCount ?? 0;
    assert(maxCount >= 0);

    return (
      direction === "forwards"
        ? async function* <T>(events: T[]): AsyncIterable<T> {
            for (
              let index = startIndex + skipCount;
              index <= endIndex &&
              (maxCount === 0 || index - startIndex !== maxCount + skipCount);
              index++
            ) {
              yield events[index];
            }
          }
        : async function* <T>(events: T[]): AsyncIterable<T> {
            for (
              let index = startIndex - skipCount;
              index >= endIndex &&
              (maxCount === 0 || startIndex - index !== maxCount + skipCount);
              index--
            ) {
              yield events[index];
            }
          }
    )(this.events);
  }
}
