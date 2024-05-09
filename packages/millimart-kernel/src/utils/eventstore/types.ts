export interface EventStore<T>
  extends AppendOnlyEventStore<T>,
    ReadOnlyEventStore<T> {}

export interface AppendOnlyEventStore<T> {
  append(event: T): Promise<void>;
}

export interface ReadOnlyEventStore<T> {
  read(options?: EventStoreReadOptions): AsyncIterable<T>;
  readOne(eventId: string): Promise<T>;
}

export type EventStoreReadOptions = {
  fromEventId?: string;
  toEventId?: string;
  skipCount?: number;
  maxCount?: number;
};
