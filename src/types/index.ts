// 笔记
export interface Note {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
  isPinned: boolean
  isArchived: boolean
  folderId?: string
}

// 标签
export interface Tag {
  id: string
  name: string
  color: string
  count: number
}

// 文件夹
export interface Folder {
  id: string
  name: string
  parentId?: string
  createdAt: string
}

// 主题类型
export type Theme = 'light' | 'dark' | 'system'

// 主题配置
export interface ThemeConfig {
  mode: Theme
  accentColor: string
}

// 应用配置
export interface AppConfig {
  theme: ThemeConfig
  dataPath: string
  autoSave: boolean
  autoSaveDelay: number
}

// 应用状态
export interface AppState {
  notes: Note[]
  tags: Tag[]
  folders: Folder[]
  activeNoteId: string | null
  activeTagId: string | null
  activeFolderId: string | null
  searchQuery: string
  sidebarCollapsed: boolean
}

// 存储元数据
export interface Metadata {
  tags: Tag[]
  folders: Folder[]
  lastUpdated: string
}

// 笔记筛选条件
export interface NoteFilter {
  tagId?: string
  folderId?: string
  searchQuery?: string
  showArchived?: boolean
}

// 笔记排序
export type NoteSortBy = 'updatedAt' | 'createdAt' | 'title'
export type NoteSortOrder = 'asc' | 'desc'

export interface NoteSort {
  by: NoteSortBy
  order: NoteSortOrder
}

// 图片信息
export interface ImageInfo {
  id: string
  noteId: string
  filename: string
  path: string
  size: number
  mimeType: string
  createdAt: string
}

// 云存储提供商
export type CloudProvider = 'minio' | 's3' | 'aliyun-oss' | 'tencent-cos'

// 同步状态
export interface SyncStatus {
  enabled: boolean
  last_sync_time: string | null
  last_sync_result: string | null
  is_syncing: boolean
}

// 同步配置
export interface SyncConfig {
  enabled: boolean
  provider: CloudProvider
  endpoint: string
  region: string
  bucket: string
  access_key_id: string
  secret_access_key: string
  auto_sync: boolean
  sync_interval: number
}

// 创建笔记请求
export interface CreateNoteRequest {
  title: string
  content: string
  folder_id?: string
  tags: string[]
}

// 更新笔记请求
export interface UpdateNoteRequest {
  title?: string
  content?: string
  folder_id?: string
  is_pinned?: boolean
  is_archived?: boolean
  tags?: string[]
}