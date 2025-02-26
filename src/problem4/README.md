# Problem 4: Three ways to sum to n

# Task

Provide 3 unique implementations of the following function in TypeScript.

- Comment on the complexity or efficiency of each function.

**Input**: `n` - any integer

_Assuming this input will always produce a result lesser than `Number.MAX_SAFE_INTEGER`_.

**Output**: `return` - summation to `n`, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`.

# Answers

Typescript used to leverage functional array methods.

1. Using formula - Mathematical Formula (Gauss Summation)
2. Using loop - Iterative (Loop)
3. Using array operations - Array with Reduce

## How to run code

### Prerequisite

- Install latest [NodeJS](https://nodejs.org/en/download)

---

- Install dependencies `npm install`.
- Run the code with `npx ts-node sumOfN.ts`
