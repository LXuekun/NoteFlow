import { FileText, Plus } from 'lucide-react'
import { useNoteStore } from '../../stores'
import { v4 as uuidv4 } from 'uuid'

export default function EmptyState() {
  const { addNote, setActiveNoteId } = useNoteStore()

  const handleCreateFirstNote = () => {
    const newNote = {
      id: uuidv4(),
      title: '我的第一篇笔记',
      content: '# 欢迎使用 NoteFlow\n\n开始记录你的想法吧！',
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isPinned: false,
      isArchived: false,
    }
    addNote(newNote)
    setActiveNoteId(newNote.id)
  }

  return (
    <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
          <FileText size={40} className="text-gray-400 dark:text-gray-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
          没有笔记
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          创建你的第一篇笔记开始使用
        </p>
        <button
          onClick={handleCreateFirstNote}
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
        >
          <Plus size={20} />
          创建笔记
        </button>
      </div>
    </main>
  )
}