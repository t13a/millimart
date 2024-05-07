export const fromAsync = async <T>(
  iterable: AsyncIterable<T>,
): Promise<T[]> => {
  const array = new Array<T>();
  for await (const item of iterable) {
    array.push(item);
  }
  return array;
};
