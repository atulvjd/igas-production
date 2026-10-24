/** Escape markup-significant characters before embedding JSON inside a script tag. */
export function serializeStructuredData(data: unknown) {
  return JSON.stringify(data).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026')
}
