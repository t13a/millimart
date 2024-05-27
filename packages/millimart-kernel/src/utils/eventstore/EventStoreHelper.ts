import { fromAsync } from "../misc";
import { EventStoreError } from "./EventStoreError";
import { ReadonlyEventStore } from "./types";

export type EventFilter<E> = (event: E) => boolean;

export namespace EventFilter {
  export const noop: EventFilter<unknown> = () => true;
}

export class EventStoreHelper<E> {
  constructor(private store: ReadonlyEventStore<E>) {}

  async has(eventId: string): Promise<boolean> {
    try {
      await this.readOne(eventId);
      return true;
    } catch (error) {
      if (error instanceof EventStoreError && error.type === "NotFoundError") {
        return false;
      }
      throw error;
    }
  }

  async readFirstOne(
    filter: EventFilter<E> = EventFilter.noop,
  ): Promise<E | undefined> {
    for await (const event of this.store.read({ direction: "forwards" })) {
      if (filter(event)) {
        return event;
      }
    }
    return undefined;
  }

  async readLastOne(
    filter: EventFilter<E> = EventFilter.noop,
  ): Promise<E | undefined> {
    for await (const event of this.store.read({ direction: "backwards" })) {
      if (filter(event)) {
        return event;
      }
    }
    return undefined;
  }

  async readNextOne(
    eventId: string,
    filter: EventFilter<E> = EventFilter.noop,
  ): Promise<E | undefined> {
    for await (const event of this.store.read({
      direction: "forwards",
      fromEventId: eventId,
      skipCount: 1,
    })) {
      if (filter(event)) {
        return event;
      }
    }
    return undefined;
  }

  async readOne(eventId: string): Promise<E> {
    return (
      await fromAsync(this.store.read({ fromEventId: eventId, maxCount: 1 }))
    ).at(0)!;
  }

  async readPrevOne(
    eventId: string,
    filter: EventFilter<E> = EventFilter.noop,
  ): Promise<E | undefined> {
    for await (const event of this.store.read({
      direction: "backwards",
      fromEventId: eventId,
      skipCount: 1,
    })) {
      if (filter(event)) {
        return event;
      }
    }
    return undefined;
  }
}
