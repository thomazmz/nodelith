export type Patch<T> =
  T extends Date ? T
    : T extends (...args: any[]) => any ? T
      : T extends readonly (infer U)[] ? readonly Patch<U>[]
        : T extends (infer U)[] ? Patch<U>[]
          : T extends object ? { [K in keyof T]?: Patch<T[K]> }
            : T

function isMergeableObject(value: unknown): value is Record<PropertyKey, unknown> {
  if (!value || typeof value !== 'object') return false
  if (value instanceof Date) return false
  if (Array.isArray(value)) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

export function merge<T>(current: Patch<T> | undefined, patch: Patch<T> | undefined): Patch<T> {
  if (patch === null) return patch as Patch<T>
  
  if (patch === undefined) return current as Patch<T>

  if (Array.isArray(patch)) {
    return (Array.isArray(current) ? [...current, ...patch] : [...patch]) as Patch<T>
  }

  if (patch instanceof Date) return patch

  if (typeof patch === 'function') return patch

  if (!isMergeableObject(patch)) return patch

  const base = isMergeableObject(current) ? current : {}

  const result: Record<PropertyKey, unknown> = { ...base }

  for (const [key, value] of Object.entries(patch)) {
    const baseRecord = base as Record<string, unknown>
    const resultRecord = result as Record<string, unknown>
    const existing = baseRecord[key] as unknown
    resultRecord[key] = merge(existing as any, value as any)
  }

  return result as Patch<T>
}

export const Patch = Object.freeze({
  merge,
})
