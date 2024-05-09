import { replay } from "./replay";
import { safeReplay } from "./safeReplay";
import { Reducer } from "./types";

export const useReducer = <E>(events: Iterable<E> | AsyncIterable<E>) => {
  return {
    replay: <S>(reducer: Reducer<S, E>, state?: S) =>
      replay<S, E>(reducer, state, events),
    safeReplay: <S>(reducer: Reducer<S, E>, state?: S) =>
      safeReplay<S, E>(reducer, state, events),
  };
};
