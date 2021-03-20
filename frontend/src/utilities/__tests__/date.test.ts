import { monthDiff } from "../date";

describe("date", () => {
  describe("monthDiff", () => {

    test.each([
      [new Date(2020, 0, 1), new Date(2020, 1, 1), 1],
      [new Date(2020, 11, 1), new Date(2021, 0, 1), 1],
      [new Date(2020, 6, 1), new Date(2021, 6, 1), 12],
      [new Date(2020, 10, 1), new Date(2021, 2, 1), 4],
      [new Date(2020, 10, 30), new Date(2021, 2, 1), 4],
      [new Date(2020, 0, 1), new Date(2021, 0, 1), 12],
      [new Date(2021, 0, 1), new Date(2020, 0, 1), -12],
      [new Date(2021, 0, 1), new Date(2021, 0, 1), 0]
    ])("%p to %p is %i months", (from: Date, to: Date, expected: number) => {
      const result = monthDiff(from, to);
      expect(result).toBe(expected);
    });

  });
});
