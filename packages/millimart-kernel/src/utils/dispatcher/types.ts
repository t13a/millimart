export type Dispatcher<C, E> = (command: C) => AsyncIterable<E>;
