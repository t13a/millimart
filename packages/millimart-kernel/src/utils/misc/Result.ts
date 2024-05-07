export type Result<T = unknown, E = unknown> = Success<T> | Failure<E>;

export type Success<T = unknown> = {
  success: true;
  value: T;
  error?: undefined;
};

export type Failure<E = unknown> = {
  success: false;
  value?: undefined;
  error: E;
};

export namespace Result {
  export const success = <T>(value: T): Success<T> => {
    return { success: true, value };
  };

  export const failure = <E>(error: E): Failure<E> => {
    return { success: false, error };
  };
}
