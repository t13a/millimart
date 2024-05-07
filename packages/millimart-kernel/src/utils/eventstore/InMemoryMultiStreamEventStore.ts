import { EventStoreError } from "./EventStoreError";

type ToEventId<T> = (event: T) => string;

export type MultiStreamEventStoreReadOptions = {
  fromEventId?: string;
  maxCount?: number;
};

export interface MultiStreamEventStore<T> {
  append(streamId: string, event: T): Promise<void>;
  read(
    streamId: string,
    options?: MultiStreamEventStoreReadOptions,
  ): AsyncIterable<T>;
}

// Suspend to implement due to I'm not sure this is necessery.
export class InMemoryMultiStreamEventStore<T>
  implements MultiStreamEventStore<T>
{
  private events: T[] = [];
  private indexes = new Map<string, number>();
  private streams = new Map<string, number[]>();

  constructor(private toEventId: ToEventId<T>) {}

  async append(streamId: string, event: T): Promise<void> {
    const eventId = this.toEventId(event);
    if (this.indexes.has(eventId)) {
      throw new EventStoreError("DuplicateError");
    }
    const index = this.events.length;
    this.events.push(event);
    this.indexes.set(eventId, index);
    (
      this.streams.get(streamId) ??
      this.streams.set(streamId, []).get(streamId)!
    ).push(index);
  }

  read(
    streamId: string,
    options?: MultiStreamEventStoreReadOptions,
  ): AsyncIterable<T> {
    const stream = this.streams.get(streamId);

    if (!stream || stream.length === 0) {
      return (async function* () {})();
    }

    if (options) {
      throw new Error("Not implemented yet.");
    }

    let startStreamIndex = 0;
    const endStreamIndex = stream.length - 1;

    return (async function* (events: T[]) {
      for (
        let streamIndex = startStreamIndex;
        streamIndex <= endStreamIndex;
        streamIndex++
      ) {
        const eventIndex = stream[streamIndex];
        yield events[eventIndex];
      }
    })(this.events);
  }
}
