/** @deprecated Use `Reducer2` */
export type Reducer<S, E> = (state: S | undefined, event: E) => S | undefined;

export interface Reducer2<S, E> {
  init(): S;
  next(state: S, event: E): S;
}
