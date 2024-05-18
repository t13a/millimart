import { ReduceError } from "./ReduceError";
import { Reducer2 } from "./types";

export type ReduceResult<S, E> = {
  state: S;
  event?: E;
};

export function reduce<S, E>(
  reducer: Reducer2<S, E>,
  events: Iterable<E>,
): ReduceResult<S, E>;

export function reduce<S, E>(
  reducer: Reducer2<S, E>,
  events: AsyncIterable<E>,
): Promise<ReduceResult<S, E>>;

export function reduce<S, E>(
  reducer: Reducer2<S, E>,
  events: Iterable<E> | AsyncIterable<E>,
): ReduceResult<S, E> | Promise<ReduceResult<S, E>> {
  const result: ReduceResult<S, E> = { state: reducer.init() };

  if (Symbol.asyncIterator in events) {
    return new Promise<ReduceResult<S, E>>(async (resolve) => {
      for await (const nextEvent of events) {
        tryNext(result, reducer, nextEvent);
      }
      resolve(result);
    });
  } else {
    for (const nextEvent of events) {
      tryNext(result, reducer, nextEvent);
    }
    return result;
  }
}

const tryNext = <S, E>(
  result: ReduceResult<S, E>,
  reducer: Reducer2<S, E>,
  nextEvent: E,
): void => {
  let nextState: S;
  try {
    nextState = reducer.next(result.state, nextEvent);
  } catch (error) {
    throw new ReduceError<S, E>(result.state, nextEvent, error);
  }
  if (result.state !== nextState) {
    result.state = nextState;
    result.event = nextEvent;
  }
};
