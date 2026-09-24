const STORAGE_KEY = 'konj-state'
export function getStorage<T>(): T | null {
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return null
  const stored = JSON.parse(raw)
  if (stored.version !== 1) throw new Error('Unsupported saved version')
  return stored.data as T
}
export function setStorage<T>(data: T): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, data }))
}
