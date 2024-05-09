export type EventStoreErrorDataMap = {
  DuplicateError: {
    eventId: string;
  };
  NotFoundError: {
    eventId: string;
  };
};

export class EventStoreError<
  Type extends keyof EventStoreErrorDataMap,
> extends Error {
  constructor(
    readonly type: Type,
    readonly data: EventStoreErrorDataMap[Type],
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
