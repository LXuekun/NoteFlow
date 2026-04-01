// Tauri API 类型定义 (简化版，无认证)

import type { Note, CreateNoteRequest, UpdateNoteRequest, SyncConfig, SyncStatus } from '../types'

declare global {
  interface Window {
    tauriAPI: TauriAPI
  }
}

interface TauriAPI {
  // 笔记管理
  createNote: (request: CreateNoteRequest) => Promise<Note>
  updateNote: (noteId: string, request: UpdateNoteRequest) => Promise<Note>
  getNote: (noteId: string) => Promise<Note | null>
  getAllNotes: () => Promise<Note[]>
  searchNotes: (query: string) => Promise<Note[]>
  deleteNote: (noteId: string) => Promise<void>

  // 云同步
  getSyncConfig: () => Promise<SyncConfig | null>
  saveSyncConfig: (config: SyncConfig) => Promise<void>
  testSyncConnection: (config: SyncConfig) => Promise<boolean>
  syncUpload: () => Promise<SyncStatus>
  syncDownload: () => Promise<SyncStatus>
}

export type { TauriAPI }