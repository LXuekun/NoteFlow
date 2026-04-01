import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Tag } from '../types'

interface TagState {
  tags: Tag[]
  activeTagId: string | null

  // 操作
  setTags: (tags: Tag[]) => void
  addTag: (tag: Tag) => void
  updateTag: (id: string, updates: Partial<Tag>) => void
  deleteTag: (id: string) => void
  setActiveTagId: (id: string | null) => void

  // 获取器
  getTagById: (id: string) => Tag | undefined
  getTagByName: (name: string) => Tag | undefined
}

export const useTagStore = create<TagState>()(
  persist(
    (set, get) => ({
      tags: [],
      activeTagId: null,

      setTags: (tags) => set({ tags }),

      addTag: (tag) =>
        set((state) => ({
          tags: [...state.tags, tag],
        })),

      updateTag: (id, updates) =>
        set((state) => ({
          tags: state.tags.map((tag) =>
            tag.id === id ? { ...tag, ...updates } : tag
          ),
        })),

      deleteTag: (id) =>
        set((state) => ({
          tags: state.tags.filter((tag) => tag.id !== id),
          activeTagId: state.activeTagId === id ? null : state.activeTagId,
        })),

      setActiveTagId: (id) => set({ activeTagId: id }),

      getTagById: (id) => {
        return get().tags.find((tag) => tag.id === id)
      },

      getTagByName: (name) => {
        return get().tags.find(
          (tag) => tag.name.toLowerCase() === name.toLowerCase()
        )
      },
    }),
    {
      name: 'noteflow-tags',
    }
  )
)