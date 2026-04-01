import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder,
  FolderPlus,
  Plus,
  Tag,
  Settings,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'
import { useNoteStore, useTagStore, useFolderStore } from '../../stores'
import type { Tag as TagType, Folder as FolderType } from '../../types'
import SettingsPanel from './SettingsPanel'

export default function Sidebar() {
  const [foldersExpanded, setFoldersExpanded] = useState(true)
  const [tagsExpanded, setTagsExpanded] = useState(true)
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null)
  const [editingFolderName, setEditingFolderName] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const { notes, setActiveNoteId, addNote } = useNoteStore()
  const { tags, activeTagId, setActiveTagId } = useTagStore()
  const { folders, activeFolderId, setActiveFolderId, addFolder, updateFolder, deleteFolder } = useFolderStore()

  const allNotesCount = notes.filter((n) => !n.isArchived).length

  const handleNewNote = () => {
    const newNote = {
      id: uuidv4(),
      title: '无标题笔记',
      content: '',
      tags: activeTagId ? [activeTagId] : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
      folderId: activeFolderId || undefined,
    }
    addNote(newNote)
    setActiveNoteId(newNote.id)
  }

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return
    const newFolder = {
      id: uuidv4(),
      name: newFolderName.trim(),
      createdAt: new Date().toISOString(),
    }
    addFolder(newFolder)
    setNewFolderName('')
    setShowNewFolderInput(false)
  }

  const handleStartEditFolder = (folder: FolderType) => {
    setEditingFolderId(folder.id)
    setEditingFolderName(folder.name)
  }

  const handleSaveEditFolder = () => {
    if (editingFolderId && editingFolderName.trim()) {
      updateFolder(editingFolderId, { name: editingFolderName.trim() })
    }
    setEditingFolderId(null)
    setEditingFolderName('')
  }

  const handleDeleteFolder = (folderId: string) => {
    if (confirm('确定要删除这个文件夹吗？文件夹内的笔记不会被删除。')) {
      deleteFolder(folderId)
    }
  }

  return (
    <>
      <aside className="w-64 h-full bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        {/* 顶部：新建按钮 */}
        <div className="p-3">
          <button
            onClick={handleNewNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>新建笔记</span>
          </button>
        </div>

        {/* 导航列表 */}
        <nav className="flex-1 overflow-y-auto px-2">
          {/* 全部笔记 */}
          <button
            onClick={() => {
              setActiveFolderId(null)
              setActiveTagId(null)
            }}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg mb-1 transition-colors ${
              !activeFolderId && !activeTagId
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span>全部笔记</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">{allNotesCount}</span>
          </button>

          {/* 文件夹列表 */}
          <div className="mt-4">
            <div className="flex items-center justify-between px-3 py-1">
              <button
                onClick={() => setFoldersExpanded(!foldersExpanded)}
                className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                {foldersExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>文件夹</span>
              </button>
              <button
                onClick={() => setShowNewFolderInput(true)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded text-gray-500 dark:text-gray-400"
                title="新建文件夹"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            {/* 新建文件夹输入框 */}
            {showNewFolderInput && (
              <div className="px-2 py-1">
                <div className="flex items-center gap-1">
                  <input
                    type="text"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFolder()
                      if (e.key === 'Escape') {
                        setShowNewFolderInput(false)
                        setNewFolderName('')
                      }
                    }}
                    placeholder="文件夹名称"
                    className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                  >
                    <Check size={14} />
                  </button>
                  <button
                    onClick={() => {
                      setShowNewFolderInput(false)
                      setNewFolderName('')
                    }}
                    className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            )}

            {foldersExpanded && folders.length > 0 && (
              <div className="mt-1 space-y-1">
                {folders.map((folder) => (
                  <FolderItem
                    key={folder.id}
                    folder={folder}
                    isActive={activeFolderId === folder.id}
                    isEditing={editingFolderId === folder.id}
                    editingName={editingFolderName}
                    onEditNameChange={setEditingFolderName}
                    onClick={() => {
                      setActiveFolderId(folder.id)
                      setActiveTagId(null)
                    }}
                    onStartEdit={() => handleStartEditFolder(folder)}
                    onSaveEdit={handleSaveEditFolder}
                    onCancelEdit={() => {
                      setEditingFolderId(null)
                      setEditingFolderName('')
                    }}
                    onDelete={() => handleDeleteFolder(folder.id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 标签列表 */}
          <div className="mt-4">
            <button
              onClick={() => setTagsExpanded(!tagsExpanded)}
              className="w-full flex items-center justify-between px-3 py-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <div className="flex items-center gap-1">
                {tagsExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                <span>标签</span>
              </div>
            </button>

            {tagsExpanded && tags.length > 0 && (
              <div className="mt-1 space-y-1">
                {tags.map((tag) => (
                  <TagItem
                    key={tag.id}
                    tag={tag}
                    isActive={activeTagId === tag.id}
                    onClick={() => {
                      setActiveTagId(tag.id)
                      setActiveFolderId(null)
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </nav>

        {/* 底部：设置 */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <Settings size={18} />
            <span>设置</span>
          </button>
        </div>
      </aside>

      {/* 设置面板 */}
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  )
}

// 文件夹项组件
function FolderItem({
  folder,
  isActive,
  isEditing,
  editingName,
  onEditNameChange,
  onClick,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
}: {
  folder: FolderType
  isActive: boolean
  isEditing: boolean
  editingName: string
  onEditNameChange: (name: string) => void
  onClick: () => void
  onStartEdit: () => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDelete: () => void
}) {
  const { notes } = useNoteStore()
  const count = notes.filter((n) => n.folderId === folder.id && !n.isArchived).length

  if (isEditing) {
    return (
      <div className="px-2 py-1">
        <div className="flex items-center gap-1">
          <input
            type="text"
            value={editingName}
            onChange={(e) => onEditNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit()
              if (e.key === 'Escape') onCancelEdit()
            }}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
            autoFocus
          />
          <button
            onClick={onSaveEdit}
            className="p-1 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
          >
            <Check size={14} />
          </button>
          <button
            onClick={onCancelEdit}
            className="p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Folder size={16} className="flex-shrink-0" />
        <span className="text-sm truncate">{folder.name}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
        {count > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">{count}</span>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStartEdit()
          }}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
          title="重命名"
        >
          <Edit2 size={12} />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
          title="删除"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

// 标签项组件
function TagItem({
  tag,
  isActive,
  onClick,
}: {
  tag: TagType
  isActive: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg transition-colors ${
        isActive
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
          : 'hover:bg-gray-100 dark:hover:bg-gray-700'
      }`}
    >
      <div className="flex items-center gap-2">
        <Tag size={16} style={{ color: tag.color }} />
        <span className="text-sm truncate">{tag.name}</span>
      </div>
      {tag.count > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">{tag.count}</span>
      )}
    </button>
  )
}