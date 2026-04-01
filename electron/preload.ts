import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的API
contextBridge.exposeInMainWorld('electronAPI', {
  // 笔记操作
  notes: {
    save: (note: unknown) => ipcRenderer.invoke('notes:save', note),
    load: (id: string) => ipcRenderer.invoke('notes:load', id),
    delete: (id: string) => ipcRenderer.invoke('notes:delete', id),
    list: () => ipcRenderer.invoke('notes:list'),
  },

  // 元数据操作
  metadata: {
    save: (data: unknown) => ipcRenderer.invoke('metadata:save', data),
    load: () => ipcRenderer.invoke('metadata:load'),
  },

  // 配置操作
  config: {
    save: (config: unknown) => ipcRenderer.invoke('config:save', config),
    load: () => ipcRenderer.invoke('config:load'),
  },

  // 图片操作
  images: {
    save: (imageData: string, noteId: string, mimeType: string) =>
      ipcRenderer.invoke('images:save', imageData, noteId, mimeType),
    delete: (imageId: string) => ipcRenderer.invoke('images:delete', imageId),
    list: (noteId: string) => ipcRenderer.invoke('images:list', noteId),
  },

  // 应用信息
  app: {
    getDataPath: () => ipcRenderer.invoke('app:getDataPath'),
  },
})

// 类型定义
export interface ElectronAPI {
  notes: {
    save: (note: unknown) => Promise<void>
    load: (id: string) => Promise<unknown>
    delete: (id: string) => Promise<void>
    list: () => Promise<unknown[]>
  }
  metadata: {
    save: (data: unknown) => Promise<void>
    load: () => Promise<unknown>
  }
  config: {
    save: (config: unknown) => Promise<void>
    load: () => Promise<unknown>
  }
  images: {
    save: (imageData: string, noteId: string, mimeType: string) => Promise<string>
    delete: (imageId: string) => Promise<void>
    list: (noteId: string) => Promise<unknown[]>
  }
  app: {
    getDataPath: () => Promise<string>
  }
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}