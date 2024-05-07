import assert from "assert";
import { EventChannel, EventHandler } from "../eventbus";
import { EventStore, EventStoreReadOptions } from "../eventstore";
import { Actor } from "./types";

export type ActorTemplateProps<T> = {
  name: string;
  store: EventStore<T>;
  handler: EventHandler<T>;
};

export abstract class ActorTemplate<T> implements Actor<T> {
  protected store: ActorTemplateEventStore<T>;
  private channel?: EventChannel<T>;

  constructor(private props: ActorTemplateProps<T>) {
    this.store = new ActorTemplateEventStore(this.props.store, (event) =>
      this.channel?.send(event),
    );
  }

  get name(): string {
    return this.props.name;
  }

  attach(channel: EventChannel<T>): void {
    // this.store.attach(channel);
    assert(this.channel === undefined);
    this.channel = channel;
    this.channel.receive(this.props.handler);
  }

  detach(): void {
    //this.store.detach();
    assert(this.channel !== undefined);
    this.channel.receive(undefined);
    this.channel = undefined;
  }

  // protected isAttached(): boolean {
  //   return this.channel !== undefined;
  // }

  // protected async replay<U>(
  //   reducer: (state: U | undefined, event: T) => U | undefined,
  // ): Promise<U | undefined> {
  //   let state: U | undefined = undefined;
  //   for await (const event of this.store.read()) {
  //     state = reducer(state, event);
  //   }
  //   return state;
  // }
}

export class ActorTemplateEventStore<T> implements EventStore<T> {
  // private channel?: EventChannel<T>;

  constructor(
    private store: EventStore<T>,
    private afterAppend: EventHandler<T>,
    //private handler: EventHandler<T>,
  ) {}

  // attach(channel: EventChannel<T>): void {
  //   assert(this.channel === undefined);
  //   this.channel = channel;
  //   //    this.channel.receive(this.handler);
  // }

  // detach(): void {
  //   assert(this.channel !== undefined);
  //   //  this.channel.receive(undefined);
  //   this.channel = undefined;
  // }

  // isAttached(): boolean {
  //   return this.channel !== undefined;
  // }

  async append(event: T): Promise<void> {
    await this.store.append(event);
    //await this.channel?.send(event);
    await this.afterAppend(event);
  }

  read(eventId: string): Promise<T>;
  read(options?: EventStoreReadOptions): AsyncIterable<T>;
  read(
    options?: string | EventStoreReadOptions,
  ): Promise<T> | AsyncIterable<T> {
    if (typeof options === "string") {
      return this.store.read(options);
    } else {
      return this.store.read(options);
    }
  }

  async replay<U>(
    reducer: (state: U | undefined, event: T) => U | undefined,
  ): Promise<U | undefined> {
    let state: U | undefined = undefined;
    for await (const event of this.store.read()) {
      state = reducer(state, event);
    }
    return state;
  }

  async safeReplay<U>(
    reducer: (state: U | undefined, event: T) => U | undefined,
  ): Promise<[U | undefined, ReplayError<T, U>[]]> {
    const errors: ReplayError<T, U>[] = [];
    const value = await this.replay<U>((state, event) => {
      try {
        return reducer(state, event);
      } catch (error) {
        errors.push(new ReplayError(state, event, error));
        return state; // returns the previous state if an error occurred.
      }
    });
    return [value, errors];
  }
}

export class ReplayError<T, U> extends Error {
  constructor(
    readonly state: U | undefined,
    readonly event: T,
    readonly cause: unknown,
  ) {
    super("Failed to replay the state", { cause });
  }
}
