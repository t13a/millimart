import { ReducerError } from "./ReducerError";
import { replay } from "./replay";
import { Reducer } from "./types";

export const safeReplay = async <S, E>(
  events: Iterable<E> | AsyncIterable<E>,
  reducer: Reducer<S, E>,
  state: S | undefined = undefined,
): Promise<[S | undefined, ReducerError<S, E>[]]> => {
  const errors: ReducerError<S, E>[] = [];
  const safeReducer: Reducer<S, E> = (state, event) => {
    try {
      return reducer(state, event);
    } catch (error) {
      errors.push(
        new ReducerError<S, E>(state, event, undefined, { cause: error }),
      );
      return state; // returns the previous state if an error occurred.
    }
  };
  return [await replay<S, E>(events, safeReducer, state), errors];
};
