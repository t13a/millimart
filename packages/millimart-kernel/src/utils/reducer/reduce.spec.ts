import { describe, expect, it } from "vitest";
import { ReduceError } from "./ReduceError";
import { reduce } from "./reduce";
import { Reducer } from "./types";

type Accumulation = number | undefined;

type AccumulationEvent = {
  type: "Add" | "Sub" | "Mul" | "Div";
  data: number;
};

class AccumulationReducer implements Reducer<Accumulation, AccumulationEvent> {
  constructor(private initState: Accumulation = undefined) {}

  init(): Accumulation {
    return this.initState;
  }

  next(state: Accumulation, event: AccumulationEvent): Accumulation {
    switch (event.type) {
      case "Add":
        return (state ?? 0) + event.data;
      case "Sub":
        return (state ?? 0) - event.data;
      case "Mul":
        return (state ?? 0) * event.data;
      case "Div":
        if (event.data === 0) {
          throw new Error("Can not divide by zero");
        }
        return (state ?? 0) / event.data;
    }
  }
}

describe("reduce", () => {
  it("returns the state and the last related event from events (Iterable)", () => {
    function* iterate(): Iterable<AccumulationEvent> {
      yield { type: "Add", data: 1 };
      yield { type: "Sub", data: 2 };
      yield { type: "Add", data: 3 };
      yield { type: "Sub", data: 0 };
    }

    const { state, event } = reduce(new AccumulationReducer(), iterate());

    expect(state).toBe(2);
    expect(event).toStrictEqual({ type: "Add", data: 3 });
  });

  it("returns the state and the last related event from events (AsyncIterable)", async () => {
    async function* iterateAsync(): AsyncIterable<AccumulationEvent> {
      yield { type: "Add", data: 1 };
      yield { type: "Sub", data: 2 };
      yield { type: "Add", data: 3 };
      yield { type: "Sub", data: 0 };
    }

    const { state, event } = await reduce(
      new AccumulationReducer(),
      iterateAsync(),
    );

    expect(state).toBe(2);
    expect(event).toStrictEqual({ type: "Add", data: 3 });
  });

  it("returns the initial state if there is no event", () => {
    const { state, event } = reduce(new AccumulationReducer(), []);

    expect(state).toBe(undefined);
    expect(event).toBeUndefined();
  });

  it("returns the initial state if there is no related event", () => {
    const { state, event } = reduce(new AccumulationReducer(0), [
      { type: "Add", data: 0 },
      { type: "Sub", data: 0 },
    ]);

    expect(state).toBe(0);
    expect(event).toBeUndefined();
  });

  it("throws an error if failed to reduce", () => {
    expect(() =>
      reduce(new AccumulationReducer(0), [
        { type: "Add", data: 1 },
        { type: "Div", data: 0 },
      ]),
    ).toThrowError(ReduceError);
  });
});
