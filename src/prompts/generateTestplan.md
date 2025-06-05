**Improved Prompt (concise and focused)**

````
Generate a hierarchical test plan (no code) for Vitest that fully covers the following function:

```typescript
{{ it.inputFunction }}
````

Include a list of all testcases you determine are valid to fully test the above function with 100% code coverage.
Ensure you cover special inputs or error conditions to cover.

Discuss the expected outcome and purpose of the function.
Bring up the return value, potential thrown errors, or side effects.

If your testplan requires any stubs, mocks, or fake timers, it may also be good to list them.

Plan to test the function AS-IS. If the code has any TODO comments or work in progress statements, plan for it's current state.

Wrap all code elements (variables, function names, method calls) in backticks. Organize the plan into logical sections (e.g., Primitives, Date, Array, Object, Edge Cases). Do **not** output actual test code—only the outline. Do not leave any additional commentary.

I encourage you to embrace unit test context if your unit tests have a valid reason to embrace them, such as:
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Mock } from 'vitest'

type Context = {
  something: string
  mockResponse: string
  mockFn: Mock
}

beforeEach<Context>((context) => {
  context.something = 'foo'
  context.mockResponse = 'bar'

  const mockedThing = vi.fn(() => context.mockResponse)
  vi.doMock('thing', () => ({
    thing: mockedThing
  }))

  context.mockFn = mockedThing
})

describe('something', () => {
  it<Context>('Should use context to access foo', (context) => {
    expect(context.something).toBe('foo')
  })
  it<Context>('Should use context to set the mocked response', (context) => {
    context.mockResponse = 'bazz'

    // Run code...
    const result = something()

    expect(context.mockFn).toHaveBeenCalledTimes(1)
    expect(context.mockFn).toHaveBeenCalledWith(context.mockResponse)
  })
})
```

{{@if(it.packageJson)}}
Below the user's package.json, you can optionally specify utility packages in your testplan that you would like to use to help your unit tests.
If you do pick npm packages to use, be clear which ones and note which versions they are.
```json
{{ it.packageJson | safe }}
```
{{/if}}
