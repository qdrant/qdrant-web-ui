import { bench, describe } from "vitest";
// create array with random numbers
const unsortedArr = [
  31, 27, 28, 42, 13, 8, 11, 30, 17, 41, 15, 43, 1, 36, 9, 16, 20, 35, 48, 37,
  7, 26, 34, 21, 22, 6, 29, 32, 49, 10, 12, 19, 24, 38, 5, 14, 44, 40, 3, 50,
  46, 25, 18, 33, 47, 4, 45, 39, 23, 2,
];

const sortedArr = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
  42, 43, 44, 45, 46, 47, 48, 49, 50,
];

const linear = (array: number[], number: number) => {
  for (const num of array) {
    if (num === number) {
      return true;
    }
  }
  return false;
};

const binary = (array: number[], number: number) => {
  let leftPoint = 0;
  let rightPoint = array.length - 1;
  let midPoint = Math.floor((leftPoint + rightPoint) / 2);

  while (array[midPoint] !== number && leftPoint <= rightPoint) {
    if (number < array[midPoint]) {
      rightPoint = midPoint - 1;
    } else {
      leftPoint = midPoint + 1;
    }
    midPoint = Math.floor((leftPoint + rightPoint) / 2);
  }

  if (array[midPoint] === number) {
    return true;
  }
  return false;
};

describe("sort", () => {
  bench(
    "linear",
    () => {
      linear(sortedArr, 20);
    },
    { iterations: 100, time: 0 }
  );

  bench(
    "binary",
    () => {
      binary(sortedArr, 20);
    },
    { iterations: 100, time: 0 }
  );
});
describe("unsorted", () => {
  bench(
    "linear",
    () => {
      linear(unsortedArr, 20);
    },
    { iterations: 100, time: 0 }
  );

  bench(
    "binary",
    () => {
      binary(unsortedArr, 20);
    },
    { iterations: 100, time: 0 }
  );
});
