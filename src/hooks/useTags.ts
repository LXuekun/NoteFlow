import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useTagStore } from '../stores'
import type { Tag } from '../types'

const TAG_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#14b8a6', // teal
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
]

export function useTags() {
  const {
    tags,
    activeTagId,
    setTags,
    addTag,
    updateTag,
    deleteTag,
    setActiveTagId,
    getTagById,
    getTagByName,
  } = useTagStore()

  const createTag = useCallback(
    (name: string, color?: string) => {
      // 检查标签是否已存在
      const existingTag = tags.find(
        (t) => t.name.toLowerCase() === name.toLowerCase()
      )
      if (existingTag) {
        return existingTag
      }

      const newTag: Tag = {
        id: uuidv4(),
        name: name.trim(),
        color: color || TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)],
        count: 0,
      }
      addTag(newTag)
      return newTag
    },
    [tags, addTag]
  )

  const incrementTagCount = useCallback(
    (tagId: string) => {
      const tag = tags.find((t) => t.id === tagId)
      if (tag) {
        updateTag(tagId, { count: tag.count + 1 })
      }
    },
    [tags, updateTag]
  )

  const decrementTagCount = useCallback(
    (tagId: string) => {
      const tag = tags.find((t) => t.id === tagId)
      if (tag && tag.count > 0) {
        updateTag(tagId, { count: tag.count - 1 })
      }
    },
    [tags, updateTag]
  )

  return {
    tags,
    activeTagId,
    setTags,
    addTag,
    createTag,
    updateTag,
    deleteTag,
    setActiveTagId,
    getTagById,
    getTagByName,
    incrementTagCount,
    decrementTagCount,
    TAG_COLORS,
  }
}