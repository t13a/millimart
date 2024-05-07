export const range = (start: number, end: number): Iterable<number> => {
  return (function* () {
    if (start <= end) {
      for (let i = start; i <= end; ) {
        yield i++;
      }
    } else {
      for (let i = start; i >= end; ) {
        yield i--;
      }
    }
  })();
};
