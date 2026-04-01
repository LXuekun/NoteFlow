import { useState, useEffect } from 'react'
import { useThemeStore } from './stores/themeStore'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import MainContent from './components/layout/MainContent'
import { isTauri, initTauriAPI } from './utils/tauri'

function App() {
  const { mode } = useThemeStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 应用主题
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (mode === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      root.classList.add(systemTheme)
    } else {
      root.classList.add(mode)
    }
  }, [mode])

  useEffect(() => {
    // 初始化 Tauri API
    if (isTauri()) {
      initTauriAPI()
    }

    // 数据库在 Rust 后端自动初始化，前端只需等待一下
    const timer = setTimeout(() => {
      setLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // 加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">初始化应用...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-gray-900">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <Header />

        {/* 主内容区 */}
        <MainContent />
      </div>
    </div>
  )
}

export default App