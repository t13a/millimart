/** @deprecated */
export class ReplayError<S, E> extends Error {
  constructor(
    readonly state: S | undefined,
    readonly event: E,
    message?: string,
    options?: ErrorOptions,
  ) {
    super(message, options);
  }
}
