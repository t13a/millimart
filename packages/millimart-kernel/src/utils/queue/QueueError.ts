export class QueueError extends Error {
  constructor(
    readonly name: "QueueEmptyError" | "QueueFullError",
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
