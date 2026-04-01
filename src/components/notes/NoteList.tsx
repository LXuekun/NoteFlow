import { Pin, Trash2 } from 'lucide-react'
import type { Note } from '../../types'
import { useNoteStore, useTagStore } from '../../stores'

interface NoteListProps {
  notes: Note[]
}

export default function NoteList({ notes }: NoteListProps) {
  const { activeNoteId, setActiveNoteId, deleteNote, updateNote } = useNoteStore()
  const { tags } = useTagStore()

  const handleDelete = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    if (confirm('确定要删除这篇笔记吗？')) {
      deleteNote(noteId)
    }
  }

  const handlePin = (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation()
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      updateNote(noteId, { isPinned: !note.isPinned })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return '昨天'
    } else if (diffDays < 7) {
      return `${diffDays}天前`
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
    }
  }

  const getPreview = (content: string, maxLength: number = 80) => {
    // 移除Markdown标记
    const plainText = content
      .replace(/#{1,6}\s/g, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/\n/g, ' ')
      .trim()

    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + '...'
      : plainText
  }

  const getNoteTags = (tagIds: string[]) => {
    return tagIds
      .map((id) => tags.find((t) => t.id === id))
      .filter(Boolean)
  }

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 dark:text-gray-400 p-4 text-center">
        没有找到笔记
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {notes.map((note) => (
        <div
          key={note.id}
          onClick={() => setActiveNoteId(note.id)}
          className={`group p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors ${
            activeNoteId === note.id
              ? 'bg-primary-50 dark:bg-primary-900/20'
              : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {note.isPinned && (
                  <Pin size={12} className="text-primary-500 flex-shrink-0" />
                )}
                <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                  {note.title || '无标题'}
                </h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                {getPreview(note.content)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {formatDate(note.updatedAt)}
                </span>
                {note.tags.length > 0 && (
                  <div className="flex gap-1">
                    {getNoteTags(note.tags).slice(0, 2).map((tag) => (
                      <span
                        key={tag!.id}
                        className="text-xs px-1.5 py-0.5 rounded"
                        style={{
                          backgroundColor: `${tag!.color}20`,
                          color: tag!.color,
                        }}
                      >
                        {tag!.name}
                      </span>
                    ))}
                    {note.tags.length > 2 && (
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        +{note.tags.length - 2}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handlePin(e, note.id)}
                className={`p-1.5 rounded transition-colors ${
                  note.isPinned
                    ? 'text-primary-500 bg-primary-100 dark:bg-primary-900/30'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                title={note.isPinned ? '取消置顶' : '置顶'}
              >
                <Pin size={14} />
              </button>
              <button
                onClick={(e) => handleDelete(e, note.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                title="删除"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}