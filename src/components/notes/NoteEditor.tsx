import { useState, useEffect, useCallback, useRef } from 'react'
import MDEditor from '@uiw/react-md-editor'
import { Plus, X, Folder } from 'lucide-react'
import type { Note } from '../../types'
import { useNoteStore, useTagStore, useFolderStore } from '../../stores'

interface NoteEditorProps {
  note: Note
}

export default function NoteEditor({ note }: NoteEditorProps) {
  const { updateNote } = useNoteStore()
  const { tags, addTag, updateTag } = useTagStore()
  const { folders } = useFolderStore()
  const [title, setTitle] = useState(note.title)
  const [content, setContent] = useState(note.content)
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)

  // 防抖保存
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        updateNote(note.id, { title, content })
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [title, content, note.id, note.title, note.content, updateNote])

  // 同步笔记变化
  useEffect(() => {
    setTitle(note.title)
    setContent(note.content)
  }, [note.id, note.title, note.content])

  // 图片粘贴处理
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault()
          const file = item.getAsFile()
          if (!file) continue

          // 检查文件大小 (10MB)
          if (file.size > 10 * 1024 * 1024) {
            alert('图片大小不能超过10MB')
            continue
          }

          try {
            // 转换为base64并嵌入markdown
            const reader = new FileReader()
            reader.onload = () => {
              const base64 = reader.result as string
              const imageUrl = `![图片](${base64})`
              setContent((prev) => prev + '\n' + imageUrl + '\n')
            }
            reader.readAsDataURL(file)
          } catch (error) {
            console.error('Failed to paste image:', error)
            alert('粘贴图片失败')
          }
          break
        }
      }
    }

    const editor = editorRef.current
    if (editor) {
      editor.addEventListener('paste', handlePaste)
      return () => editor.removeEventListener('paste', handlePaste)
    }
  }, [])

  const handleAddTag = useCallback(() => {
    if (!newTagName.trim()) return

    // 检查标签是否已存在
    const existingTag = tags.find(
      (t) => t.name.toLowerCase() === newTagName.trim().toLowerCase()
    )

    if (existingTag) {
      // 添加到笔记
      if (!note.tags.includes(existingTag.id)) {
        updateNote(note.id, { tags: [...note.tags, existingTag.id] })
        updateTag(existingTag.id, { count: existingTag.count + 1 })
      }
    } else {
      // 创建新标签
      const newTag = {
        id: crypto.randomUUID(),
        name: newTagName.trim(),
        color: '#3b82f6',
        count: 1,
      }
      addTag(newTag)
      updateNote(note.id, { tags: [...note.tags, newTag.id] })
    }

    setNewTagName('')
    setShowTagInput(false)
  }, [newTagName, note.id, note.tags, tags, addTag, updateNote, updateTag])

  const handleRemoveTag = (tagId: string) => {
    const tag = tags.find((t) => t.id === tagId)
    if (tag) {
      updateNote(note.id, { tags: note.tags.filter((id) => id !== tagId) })
      updateTag(tagId, { count: Math.max(0, tag.count - 1) })
    }
  }

  const noteTags = note.tags
    .map((id) => tags.find((t) => t.id === id))
    .filter(Boolean)

  return (
    <div ref={editorRef} className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* 标题输入 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="笔记标题"
          className="w-full text-2xl font-semibold bg-transparent border-0 focus:outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />

        {/* 标签区域 */}
        <div className="flex items-center flex-wrap gap-2 mt-3">
          {noteTags.map((tag) => (
            <span
              key={tag!.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm rounded-full"
              style={{
                backgroundColor: `${tag!.color}20`,
                color: tag!.color,
              }}
            >
              {tag!.name}
              <button
                onClick={() => handleRemoveTag(tag!.id)}
                className="hover:opacity-70"
              >
                <X size={12} />
              </button>
            </span>
          ))}

          {showTagInput ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTag()
                  if (e.key === 'Escape') {
                    setShowTagInput(false)
                    setNewTagName('')
                  }
                }}
                onBlur={() => {
                  if (newTagName.trim()) {
                    handleAddTag()
                  } else {
                    setShowTagInput(false)
                  }
                }}
                placeholder="输入标签名"
                className="w-24 px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 border-0 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setShowTagInput(true)}
              className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
            >
              <Plus size={14} />
              添加标签
            </button>
          )}
        </div>

        {/* 文件夹选择 */}
        {folders.length > 0 && (
          <div className="flex items-center gap-2 mt-2">
            <Folder size={14} className="text-gray-400" />
            <select
              value={note.folderId || ''}
              onChange={(e) => updateNote(note.id, { folderId: e.target.value || undefined })}
              className="text-sm bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-primary-500 rounded text-gray-600 dark:text-gray-400"
            >
              <option value="">无文件夹</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Markdown编辑器 */}
      <div className="flex-1 overflow-hidden" data-color-mode="auto">
        <MDEditor
          value={content}
          onChange={(val) => setContent(val || '')}
          preview="edit"
          height="100%"
          visibleDragbar={false}
          hideToolbar={false}
          enableScroll={true}
        />
      </div>

      {/* 底部信息栏 */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 flex justify-between">
        <span>
          创建于 {new Date(note.createdAt).toLocaleDateString('zh-CN')}
        </span>
        <span>
          {content.length} 字符
        </span>
      </div>
    </div>
  )
}