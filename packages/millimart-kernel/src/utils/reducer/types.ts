export interface Reducer<S, E> {
  init(): S;
  next(state: S, event: E): S;
}
