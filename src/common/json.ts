// Copyright © 2025 Navarrotech

export function safeParseJson<Type = Record<string, any>>(jsonString: string): Type | null {
  try {
    return JSON.parse(jsonString) as Type
  }
  catch (error) {
    console.error('Failed to parse JSON:', error)
    return null
  }
}

export function safeStringifyJson<Type = Record<string, any>>(
  obj: Type,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number
): string {
  try {
    const newJson = JSON.stringify(obj, replacer, space)

    // Replace &quot; with " to ensure proper JSON format
    if (typeof newJson === 'string') {
      return newJson.replace(/&quot;/g, '"')
    }

    return newJson
  }
  catch (error) {
    console.error('Failed to stringify JSON:', error)
    return '{}'
  }
}
