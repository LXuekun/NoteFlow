import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Note } from '../types'

interface NoteState {
  notes: Note[]
  activeNoteId: string | null
  searchQuery: string

  // 操作
  setNotes: (notes: Note[]) => void
  addNote: (note: Note) => void
  updateNote: (id: string, updates: Partial<Note>) => void
  deleteNote: (id: string) => void
  setActiveNoteId: (id: string | null) => void
  setSearchQuery: (query: string) => void

  // 获取器
  getActiveNote: () => Note | undefined
  getFilteredNotes: () => Note[]
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      notes: [],
      activeNoteId: null,
      searchQuery: '',

      setNotes: (notes) => set({ notes }),

      addNote: (note) =>
        set((state) => ({
          notes: [note, ...state.notes],
          activeNoteId: note.id,
        })),

      updateNote: (id, updates) =>
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, ...updates, updatedAt: new Date().toISOString() }
              : note
          ),
        })),

      deleteNote: (id) =>
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
          activeNoteId: state.activeNoteId === id ? null : state.activeNoteId,
        })),

      setActiveNoteId: (id) => set({ activeNoteId: id }),

      setSearchQuery: (query) => set({ searchQuery: query }),

      getActiveNote: () => {
        const state = get()
        return state.notes.find((note) => note.id === state.activeNoteId)
      },

      getFilteredNotes: () => {
        const state = get()
        let filtered = state.notes.filter((note) => !note.isArchived)

        // 搜索过滤
        if (state.searchQuery) {
          const query = state.searchQuery.toLowerCase()
          filtered = filtered.filter(
            (note) =>
              note.title.toLowerCase().includes(query) ||
              note.content.toLowerCase().includes(query)
          )
        }

        // 排序：置顶在前，然后按更新时间排序
        return filtered.sort((a, b) => {
          if (a.isPinned !== b.isPinned) {
            return a.isPinned ? -1 : 1
          }
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        })
      },
    }),
    {
      name: 'noteflow-notes',
    }
  )
)