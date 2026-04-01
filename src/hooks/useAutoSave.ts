import { useEffect, useRef, useCallback } from 'react'

export function useAutoSave<T>(
  value: T,
  saveFunction: (value: T) => void | Promise<void>,
  delay: number = 300
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const valueRef = useRef(value)

  // 更新值引用
  useEffect(() => {
    valueRef.current = value
  }, [value])

  // 防抖保存
  const debouncedSave = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      saveFunction(valueRef.current)
    }, delay)
  }, [saveFunction, delay])

  // 监听值变化
  useEffect(() => {
    debouncedSave()

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [value, debouncedSave])

  // 立即保存
  const saveNow = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }
    saveFunction(valueRef.current)
  }, [saveFunction])

  return { saveNow }
}