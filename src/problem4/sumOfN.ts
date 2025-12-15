/**
 * sum_to_n_a: Mathematical Formula (Gauss Summation)
 * @param n number
 * @returns number
 *
 * Derived from the sum of an arithmetic series
 * https://letstalkscience.ca/educational-resources/backgrounders/gauss-summation
 *
 * Time Complexity: O(1) - Constant time, as it's a single arithmetic operation regarless of N.
 * Space Complexity: O(1) - No additional memory beyond input and output.
 * Performance: Extremely fast. It performs just three operations (multiplication, addition, division) no matter how large N is.
 * Efficiency: Most efficient in terms of both time and memory. No iteration or recursion needed.
 * Risk: N is very large, goes beyond Number.MAX_SAFE_INTEGER
 */
export const sum_to_n_a = (n: number): number => (n * (n + 1)) / 2;

/**
 * sum_to_n_b: Iterative (Loop)
 * @param n number
 * @returns number
 *
 * Loops from 1 to N, adding each number to a running total
 *
 * Time Complexity: O(N) – Linear time, as it performs N iterations.
 * Space Complexity: O(1) – Only uses a single variable (sum) regardless of N.
 * Performance: Slower than the formula, as it scales linearly with N. For small N, the difference is negligible, but for large N (e.g., millions), it’s noticeably slower.
 * Efficiency: Less efficient than the formula but still lightweight since it avoids extra memory allocation.
 * Risk: Performance for large N. Precision loss with sum grows beyond Number.MAX_SAFE_INTEGER
 */
export const sum_to_n_b = (n: number): number => {
  let sum: number = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
};

/**
 * sum_to_n_c: Array with Reduce
 * @param n number
 * @returns number
 *
 * Creates an array of numbers from 1 to N, then reduces it to a sum.
 *
 * Time Complexity: O(N) – Linear time. Array.from takes O(N) to build the array, and reduce takes O(N) to sum it.
 * Space Complexity: O(N) – Creates an array of size N, which requires additional memory.
 * Performance: Slower than both the formula and loop. The overhead of array creation and functional operations makes it less performant, especially for large N.
 * Efficiency: Least efficient due to memory allocation and multiple passes (array creation + reduction).
 * Risk: Memory overflow - for large N. Performance overhead - building and reducing an array is slower, risky for large N. Precision loss - summing many numbers could lead to precision issues beyond Number.MAX_SAFE_INTEGER.
 */
export const sum_to_n_c = (n: number): number =>
  Array.from({ length: n }, (_, i) => i + 1).reduce(
    (total, number) => total + number
  );

console.log('sum_to_n_a', sum_to_n_a(5));
console.log('sum_to_n_b', sum_to_n_b(5));
console.log('sum_to_n_c', sum_to_n_c(5));
