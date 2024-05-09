import { replay } from "./replay";
import { safeReplay } from "./safeReplay";
import { Reducer } from "./types";

export const useStream = <E>(events: Iterable<E> | AsyncIterable<E>) => {
  return {
    replay: <S>(reducer: Reducer<S, E>, state?: S) =>
      replay<S, E>(events, reducer, state),
    safeReplay: <S>(reducer: Reducer<S, E>, state?: S) =>
      safeReplay<S, E>(events, reducer, state),
  };
};
