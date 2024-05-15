import EventEmitter from "events";

export type ExtractEventId<T> = (event: T) => string;

export type EventStoreEventMap<T> = {
  append: [event: T];
  error: [error: unknown];
};

export interface EventStore<T>
  extends ReadOnlyEventStore<T>,
    EventEmitter<EventStoreEventMap<T>> {
  append(event: T): Promise<void>;
}

export interface ReadOnlyEventStore<T> {
  readonly extractEventId: ExtractEventId<T>;
  read(options?: EventStoreReadOptions): AsyncIterable<T>;
  readFirstOne(): Promise<T | undefined>;
  readLastOne(): Promise<T | undefined>;
  readNextOne(eventId: string): Promise<T | undefined>;
  readOne(eventId: string): Promise<T | undefined>;
  readPrevOne(eventId: string): Promise<T | undefined>;
}

export type EventStoreReadOptions = {
  direction?: "backwards" | "forwards";
  fromEventId?: string;
  toEventId?: string;
  skipCount?: number;
  maxCount?: number;
};
