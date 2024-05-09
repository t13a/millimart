import { Reducer } from ".";

export const replay = async <S, E>(
  events: Iterable<E> | AsyncIterable<E>,
  reducer: Reducer<S, E>,
  state: S | undefined = undefined,
): Promise<S | undefined> => {
  for await (const event of events) {
    state = reducer(state, event);
  }
  return state;
};
