export type EventStoreErrorName = "DuplicateError" | "NotFoundError";

export class EventStoreError extends Error {
  constructor(
    readonly name: EventStoreErrorName,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
