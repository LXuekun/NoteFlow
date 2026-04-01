import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Folder } from '../types'

interface FolderState {
  folders: Folder[]
  activeFolderId: string | null

  // 操作
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  updateFolder: (id: string, updates: Partial<Folder>) => void
  deleteFolder: (id: string) => void
  setActiveFolderId: (id: string | null) => void
}

export const useFolderStore = create<FolderState>()(
  persist(
    (set) => ({
      folders: [],
      activeFolderId: null,

      setFolders: (folders) => set({ folders }),

      addFolder: (folder) =>
        set((state) => ({
          folders: [...state.folders, folder],
        })),

      updateFolder: (id, updates) =>
        set((state) => ({
          folders: state.folders.map((folder) =>
            folder.id === id ? { ...folder, ...updates } : folder
          ),
        })),

      deleteFolder: (id) =>
        set((state) => ({
          folders: state.folders.filter((folder) => folder.id !== id),
          activeFolderId: state.activeFolderId === id ? null : state.activeFolderId,
        })),

      setActiveFolderId: (id) => set({ activeFolderId: id }),
    }),
    {
      name: 'noteflow-folders',
    }
  )
)