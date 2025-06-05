The previous unit tests failed:
```
> {{ it.command }}

{{ it.vitestOutput }}
```

There are 3 major potential reasons for why this failed:
1. It was a bug in the unit test
2. It was a bug in the source code
3. It was something beyond this scope, like a missing package or bad environment

Depending on the reason, please respond accordingly.
<!-- 
# Your response
Return a JSON response only. Do not add text comments before or after the JSON.

Your response must follow this typescript response type:
```typescript
type Response = {
  "action": "fix-unit-test" | "fix-source-code" | "exit",
  "message": string
}
``` -->

# If it was a bug in the unit test:
Respond with a fully updated vitest test.ts file, with the corrected changes made.
Do not return a partial diff, do not add commentary before or after the file, return only the entire new document.
At the beginning of your response, please prefix the following typescript comment:
```typescript
// fix-unit-test
```

# If it was a bug in the source code:
Respond with the updated source code, using conflict markers like so:
```
<<<<<<< Your code
…your current (local) code…
=======
…incoming (remote or merged) code…
>>>>>>> Revised suggestion
```

When using conflict markers, the following must be conflict marked separately:
- imports
- global constants/types
- function content

For example, do not conflict an import and a global constant in the same conflict group.

At the beginning of your response, please prefix the following typescript comment:
```typescript
// fix-source-code
```

# If it was something beyond this scope:
Respond with only a couple of sentences, explaining:
- Why did this go wrong? (Short explanation or guess)
- What can the user do to fix this? (Suggested fixes)

At the beginning of your response, please prefix the following typescript comment:
```typescript
// exit
```
