import { replay } from "./replay";
import { Reducer } from "./types";

/** @deprecated */
export const useStream = <E>(events: Iterable<E> | AsyncIterable<E>) => {
  return {
    replay: <S>(reducer: Reducer<S, E>) =>
      replay<S, E>(reducer, undefined, events),
  };
};
