#### Purpose & Behavior
- The function `deepClone<T>(obj: T): T` creates a deep, independent copy of an input object or array.
- It handles primitives, `Date` objects, arrays, and nested objects.
- It preserves value types (e.g., strings, numbers, booleans), dates, and complex structures without reference sharing.
- It does not modify the original input.
- It returns an identical structure with all nested references cloned.
- Expected to not throw errors for valid inputs; non-object inputs are returned as-is.

---

### Test Plan Outline

#### **1. Primitives**
- **Test case:** Clone primitive types (`string`, `number`, `boolean`, `symbol`, `bigint`, `null`, `undefined`)
  - Input: primitive value
  - Expectation: returns the same primitive value (not cloned further)
  - Purpose: verify the base case that non-object types are returned unchanged

#### **2. Date Objects**
- **Test case:** Clone a `Date` object
  - Input: `new Date()`
  - Expectation: returns a new `Date` instance with identical timestamp
  - Side effect: Original date remains unchanged
  - Purpose: confirm `instanceof Date` cloning is correct

- **Test case:** Clone nested object containing a `Date`
  - Input: object with date property
  - Expectation: date property is a new date with same value

#### **3. Arrays**
- **Test case:** Clone an array of primitives
  - Input: `[1, 2, 3]`
  - Expectation: a new array with same elements, no references shared

- **Test case:** Clone an array of objects
  - Input: `[ { a: 1 }, { b: 2 } ]`
  - Expectation: each object is cloned, references differ

- **Test case:** Clone a nested array
  - Input: `[ [1, 2], [3, 4] ]`
  - Expectation: nested arrays are cloned separately

- **Test case:** Clone an array containing Date objects
  - Input: `[ new Date(), new Date() ]`
  - Expectation: dates cloned as new Date instances with same timestamps

#### **4. Objects**
- **Test case:** Clone a simple object with primitive values
  - Input: `{ a: 1, b: 'test' }`
  - Expectation: new object with same key-values

- **Test case:** Clone an object with nested objects and arrays
  - Input: `{ a: 1, b: { c: 2 }, d: [3, 4] }`
  - Expectation: all nested objects and arrays are deeply cloned, no references shared

- **Test case:** Clone object with Date property
  - Input: `{ d: new Date() }`
  - Expectation: new Date with same value, not the same reference

- **Test case:** Clone an object with prototype properties (should only copy own properties)
  - Input: object with inherited prototype properties
  - Expectation: only own properties cloned

#### **5. Edge Cases & Special Inputs**
- **Test case:** Input `null`
  - Expectation: returns `null`
- **Test case:** Input `undefined`
  - Expectation: returns `undefined`
- **Test case:** Empty object `{}` and empty array `[]`
  - Expectation: returns new empty objects/arrays (not the same references)
- **Test case:** Function as property value (function should be copied by reference)
  - Input: object `{ fn: () => {} }`
  - Expectation: the function reference remains unchanged

- **Test case:** Circular references (Note: not handled by current implementation; may cause recursion error or stack overflow)
  - Expectation: likely an infinite loop or error (documented limitation)

---

### Additional Considerations
- No external dependencies or mocks are required.
- The function does not throw errors on valid inputs, but if given circular references, it may cause maximum call stack errors.
- The function returns a deep clone, ensuring complete structural independence from the original.
- No side effects other than creating new objects/arrays/dates; original input remains unmodified.

---

### Summary
This test plan achieves 100% branch coverage by testing:
- Primitive types
- `Date` handling
- Arrays (primitive, array of objects, nested arrays, `Date`s inside arrays)
- Objects (simple, nested, with `Date`, with inherited properties)
- Edge cases (`null`, `undefined`, empty structures, functions)
- Recognizes the current limitation regarding circular references (not supported)
