import { useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { useNoteStore } from '../stores'
import type { Note } from '../types'

export function useNotes() {
  const {
    notes,
    activeNoteId,
    searchQuery,
    setNotes,
    addNote,
    updateNote,
    deleteNote,
    setActiveNoteId,
    setSearchQuery,
    getActiveNote,
    getFilteredNotes,
  } = useNoteStore()

  const createNote = useCallback(
    (title: string = '无标题笔记', content: string = '') => {
      const newNote: Note = {
        id: uuidv4(),
        title,
        content,
        tags: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isPinned: false,
        isArchived: false,
      }
      addNote(newNote)
      return newNote
    },
    [addNote]
  )

  const togglePin = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId)
      if (note) {
        updateNote(noteId, { isPinned: !note.isPinned })
      }
    },
    [notes, updateNote]
  )

  const toggleArchive = useCallback(
    (noteId: string) => {
      const note = notes.find((n) => n.id === noteId)
      if (note) {
        updateNote(noteId, { isArchived: !note.isArchived })
      }
    },
    [notes, updateNote]
  )

  return {
    notes,
    activeNoteId,
    searchQuery,
    setNotes,
    addNote,
    createNote,
    updateNote,
    deleteNote,
    setActiveNoteId,
    setSearchQuery,
    getActiveNote,
    getFilteredNotes,
    togglePin,
    toggleArchive,
  }
}