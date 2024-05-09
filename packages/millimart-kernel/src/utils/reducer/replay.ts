import { Reducer } from ".";

export const replay = async <S, E>(
  reducer: Reducer<S, E>,
  state: S | undefined = undefined,
  events: Iterable<E> | AsyncIterable<E>,
): Promise<S | undefined> => {
  for await (const event of events) {
    state = reducer(state, event);
  }
  return state;
};
