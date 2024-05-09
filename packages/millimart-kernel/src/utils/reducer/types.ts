export type Reducer<S, E> = (state: S | undefined, event: E) => S | undefined;
