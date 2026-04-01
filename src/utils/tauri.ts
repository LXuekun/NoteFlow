import { invoke } from '@tauri-apps/api/core'
import type { Note, CreateNoteRequest, UpdateNoteRequest, SyncConfig, SyncStatus } from '../types'

// 初始化 Tauri API (简化版，无认证)
export function initTauriAPI() {
  window.tauriAPI = {
    // 笔记管理
    createNote: (request: CreateNoteRequest) => invoke<Note>('create_note', { request }),
    updateNote: (noteId: string, request: UpdateNoteRequest) => invoke<Note>('update_note', { noteId, request }),
    getNote: (noteId: string) => invoke<Note | null>('get_note', { noteId }),
    getAllNotes: () => invoke<Note[]>('get_all_notes'),
    searchNotes: (query: string) => invoke<Note[]>('search_notes', { query }),
    deleteNote: (noteId: string) => invoke<void>('delete_note', { noteId }),

    // 云同步
    getSyncConfig: () => invoke<SyncConfig | null>('get_sync_config'),
    saveSyncConfig: (config: SyncConfig) => invoke<void>('save_sync_config', { config }),
    testSyncConnection: (config: SyncConfig) => invoke<boolean>('test_sync_connection', { config }),
    syncUpload: () => invoke<SyncStatus>('sync_upload'),
    syncDownload: () => invoke<SyncStatus>('sync_download'),
  }
}

// 检查是否在 Tauri 环境中运行
export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window
}