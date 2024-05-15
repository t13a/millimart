export type SubscriptionErrorDataMap = {
  DuplicateSinkError: {
    sink: string;
  };
  NoEventError: {
    eventId: string;
  };
  NoSubscriptionError: {
    subscriptionId: string;
  };
};

export class SubscriptionError<
  Type extends keyof SubscriptionErrorDataMap,
> extends Error {
  constructor(
    readonly type: Type,
    readonly data: SubscriptionErrorDataMap[Type],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
