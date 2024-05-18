export class ReduceError<S, E> extends Error {
  constructor(
    readonly state: S,
    readonly event: E,
    error: unknown,
  ) {
    super(undefined, { cause: error });
  }
}
