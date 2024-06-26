import EventEmitter from "events";

export type ExtractEventId<T> = (event: T) => string;

export type EventStoreEventMap<T> = {
  append: [event: T];
  error: [error: unknown];
};

export interface EventStore<T>
  extends ReadonlyEventStore<T>,
    EventEmitter<EventStoreEventMap<T>> {
  append(event: T): Promise<void>;
}

export interface ReadonlyEventStore<T> {
  readonly extractEventId: ExtractEventId<T>;
  read(options?: EventStoreReadOptions): AsyncIterable<T>;
}

export type EventStoreReadOptions = {
  direction?: "backwards" | "forwards";
  fromEventId?: string;
  toEventId?: string;
  skipCount?: number;
  maxCount?: number;
};
