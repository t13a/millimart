import { ReplayError } from "./ReplayError";
import { Reducer } from "./types";

export type ReplayResult<S, E> = [S | undefined, E | undefined];

export const replay = async <S, E>(
  reducer: Reducer<S, E>,
  state: S | undefined = undefined,
  events: Iterable<E> | AsyncIterable<E>,
): Promise<ReplayResult<S, E>> => {
  let lastState: S | undefined = state;
  let lastEvent: E | undefined = undefined;
  for await (const nextEvent of events) {
    try {
      const nextState = reducer(lastState, nextEvent);
      if (lastState !== nextState) {
        lastState = nextState;
        lastEvent = nextEvent;
      }
    } catch (error) {
      throw new ReplayError(lastState, nextEvent, undefined, { cause: error });
    }
  }
  return [lastState, lastEvent];
};
