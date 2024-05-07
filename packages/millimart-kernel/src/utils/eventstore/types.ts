export interface EventStore<T>
  extends AppendOnlyEventStore<T>,
    ReadOnlyEventStore<T> {}

export interface AppendOnlyEventStore<T> {
  append(event: T): Promise<void>;
}

export interface ReadOnlyEventStore<T> {
  read(eventId: string): Promise<T>;
  read(options?: EventStoreReadOptions): AsyncIterable<T>;
}

export type EventStoreReadOptions = {
  fromEventId?: string;
  toEventId?: string;
  maxCount?: number;
};
