import { useNoteStore, useTagStore, useFolderStore } from '../../stores'
import NoteList from '../notes/NoteList'
import NoteEditor from '../notes/NoteEditor'
import EmptyState from './EmptyState'

export default function MainContent() {
  const { activeNoteId, notes } = useNoteStore()
  const { tags, activeTagId } = useTagStore()
  const { folders, activeFolderId } = useFolderStore()

  // 获取当前筛选的笔记
  const getFilteredNotes = () => {
    let filtered = notes.filter((n) => !n.isArchived)

    // 按标签筛选
    if (activeTagId) {
      filtered = filtered.filter((n) => n.tags.includes(activeTagId))
    }

    // 按文件夹筛选
    if (activeFolderId) {
      filtered = filtered.filter((n) => n.folderId === activeFolderId)
    }

    return filtered.sort((a, b) => {
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1
      }
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
  }

  const filteredNotes = getFilteredNotes()
  const activeNote = notes.find((n) => n.id === activeNoteId)
  const activeTag = tags.find((t) => t.id === activeTagId)
  const activeFolder = folders.find((f) => f.id === activeFolderId)

  // 获取标题
  const getTitle = () => {
    if (activeTag) return `标签: ${activeTag.name}`
    if (activeFolder) return `文件夹: ${activeFolder.name}`
    return '全部笔记'
  }

  // 如果没有笔记，显示空状态
  if (notes.length === 0) {
    return <EmptyState />
  }

  return (
    <main className="flex-1 flex overflow-hidden">
      {/* 笔记列表 */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div className="p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-medium text-gray-900 dark:text-gray-100">
            {getTitle()}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {filteredNotes.length} 篇笔记
          </p>
        </div>
        <NoteList notes={filteredNotes} />
      </div>

      {/* 编辑器区域 */}
      <div className="flex-1 overflow-y-auto">
        {activeNote ? (
          <NoteEditor note={activeNote} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            选择一篇笔记开始编辑
          </div>
        )}
      </div>
    </main>
  )
}