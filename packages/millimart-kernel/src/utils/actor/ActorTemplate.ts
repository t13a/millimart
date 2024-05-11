import assert from "assert";
import { EventChannel, EventHandler } from "../eventbus";
import { EventStore, ReadOnlyEventStore } from "../eventstore";
import { Reducer, ReplayResult, useStream } from "../reducer";
import { Actor } from "./types";

export type ActorTemplateProps<T> = {
  name: string;
  store: EventStore<T>;
};

export abstract class ActorTemplate<T> implements Actor<T> {
  private channel?: EventChannel<T>;

  constructor(
    private handler: EventHandler<T>,
    private props: ActorTemplateProps<T>,
  ) {}

  get name(): string {
    return this.props.name;
  }

  attach(channel: EventChannel<T>): void {
    assert(this.channel === undefined);
    this.channel = channel;
    this.channel.receive(this.handler);
  }

  detach(): void {
    assert(this.channel !== undefined);
    this.channel.receive(undefined);
    this.channel = undefined;
  }

  protected get store(): ReadOnlyEventStore<T> {
    return this.props.store;
  }

  protected async append(
    events: T | Iterable<T> | AsyncIterable<T>,
  ): Promise<void> {
    // FIXME: Keep consistency.
    for await (const event of Array.isArray(events) ? events : [events]) {
      await this.props.store.append(event);
      await this.channel?.send(event);
    }
  }

  protected async replay<S>(
    reducer: Reducer<S, T>,
  ): Promise<ReplayResult<S, T>> {
    const { replay } = useStream(this.props.store.read());
    return await replay(reducer);
  }

  protected isAttached(): boolean {
    return this.channel !== undefined;
  }
}
