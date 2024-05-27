import { EventBus, Subscription, Unsubscribe } from "./types";

/** @deprecated */
export class InMemoryEventBus<T, I = undefined> implements EventBus<T, I> {
  private subscriptions = new Set<Subscription<T, I>>();

  async publish(
    event: T,
    predicate?: (subscription: Subscription<T, I>) => boolean,
  ): Promise<void> {
    await Promise.all(
      Array.from(this.subscriptions.values(), async (subscription) => {
        if (
          (predicate && !predicate(subscription)) ||
          (subscription.predicate && !subscription.predicate(event))
        ) {
          return;
        }
        await subscription.handler(event);
      }),
    );
  }

  subscribe(subscription: Subscription<T, I>): Unsubscribe {
    this.subscriptions.add(subscription);
    return () => this.subscriptions.delete(subscription);
  }
}
