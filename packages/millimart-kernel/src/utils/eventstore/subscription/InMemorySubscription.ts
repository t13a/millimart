import { EventEmitter } from "events";
import equal from "fast-deep-equal";
import { EventFilter, EventStoreHelper } from "../EventStoreHelper";
import { Consumer } from "../channel";
import { ReadonlyEventStore } from "../types";
import {
  Subscription,
  SubscriptionEventMap,
  SubscriptionPosition,
  SubscriptionRequest,
} from "./types";

export type InMemorySubscriptionProps<E> = {
  id: string;
  request?: SubscriptionRequest<E>;
  store: ReadonlyEventStore<E>;
};

export class InMemorySubscription<E>
  extends EventEmitter<SubscriptionEventMap<E>>
  implements Subscription<E>
{
  private _filter: EventFilter<E>;
  private _position: SubscriptionPosition;

  constructor(private props: InMemorySubscriptionProps<E>) {
    super({ captureRejections: true });
    this._filter = props.request?.filter ?? EventFilter.noop;
    this._position = props.request?.position ?? { from: "Start" };
  }

  get id(): string {
    return this.props.id;
  }

  get filter(): EventFilter<E> {
    return this._filter;
  }

  get position(): SubscriptionPosition {
    return this._position;
  }

  async receive(consumer: Consumer<E>): Promise<boolean> {
    const helper = new EventStoreHelper(this.props.store);

    let event: E | undefined;
    switch (this._position.from) {
      case "Start":
        event = await helper.readFirstOne(this._filter);
        break;
      case "Next":
        event = await helper.readNextOne(
          this._position.lastEventId,
          this._filter,
        );
        break;
      case "End":
        event = await helper.readLastOne(this._filter);
        break;
    }
    if (!event) {
      return false;
    }

    await consumer(event);

    const lastEventId = this.props.store.extractEventId(event);
    this.updatePosition({ from: "Next", lastEventId });
    return true;
  }

  update(request: SubscriptionRequest<E>): void {
    this.updateFilter(request.filter);
    this.updatePosition(request.position);
  }

  private updateFilter(filter?: EventFilter<E>): void {
    if (!filter) {
      return;
    }
    const updated = !equal(this._filter, filter);
    this._filter = filter;
    if (updated) {
      this.emit("filter", filter);
    }
  }

  private updatePosition(position?: SubscriptionPosition): void {
    if (!position) {
      return;
    }
    const updated = !equal(this._position, position);
    this._position = position;
    if (updated) {
      this.emit("position", position);
    }
  }

  [Symbol.asyncIterator](): AsyncIterator<E> {
    const next = async (): Promise<IteratorResult<E>> => {
      let value: E | undefined;
      await this.receive((event) => (value = event));
      return value ? { done: false, value } : { done: true, value };
    };
    return { next };
  }
}
