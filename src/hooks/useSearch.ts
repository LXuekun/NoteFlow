import { useState, useCallback, useMemo } from 'react'
import Fuse from 'fuse.js'
import { useNoteStore } from '../stores'
import type { Note } from '../types'

interface SearchOptions {
  keys: string[]
  threshold: number
  includeScore: boolean
}

const defaultOptions: SearchOptions = {
  keys: ['title', 'content'],
  threshold: 0.4,
  includeScore: true,
}

export function useSearch(options: Partial<SearchOptions> = {}) {
  const [query, setQuery] = useState('')
  const { notes } = useNoteStore()

  const fuse = useMemo(() => {
    return new Fuse(notes, {
      ...defaultOptions,
      ...options,
    })
  }, [notes, options])

  const search = useCallback(
    (searchQuery: string): Note[] => {
      if (!searchQuery.trim()) {
        return notes.filter((n) => !n.isArchived)
      }

      // 检查是否是标签搜索 (#tag)
      if (searchQuery.startsWith('#')) {
        // 简化处理：标签搜索暂时返回所有笔记
        return notes.filter((note) => !note.isArchived)
      }

      const results = fuse.search(searchQuery)
      return results
        .filter((r) => !r.item.isArchived)
        .map((r) => r.item)
    },
    [fuse, notes]
  )

  const searchResults = useMemo(() => {
    return search(query)
  }, [query, search])

  return {
    query,
    setQuery,
    searchResults,
    search,
  }
}