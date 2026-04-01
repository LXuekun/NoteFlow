import { useState, useEffect } from 'react'
import { X, Moon, Sun, Monitor, Download, Upload, Trash2, Cloud, Check, Loader2 } from 'lucide-react'
import { useThemeStore, useNoteStore, useTagStore, useFolderStore } from '../../stores'
import type { Theme, SyncConfig, CloudProvider } from '../../types'

interface SettingsPanelProps {
  onClose: () => void
}

type TabType = 'appearance' | 'data' | 'sync'

const PROVIDER_OPTIONS: { value: CloudProvider; label: string; defaultEndpoint: string; defaultRegion: string }[] = [
  { value: 'aliyun-oss', label: '阿里云 OSS', defaultEndpoint: 'https://oss-cn-hangzhou.aliyuncs.com', defaultRegion: 'oss-cn-hangzhou' },
  { value: 'tencent-cos', label: '腾讯云 COS', defaultEndpoint: 'https://cos.ap-guangzhou.myqcloud.com', defaultRegion: 'ap-guangzhou' },
  { value: 's3', label: 'AWS S3', defaultEndpoint: 'https://s3.amazonaws.com', defaultRegion: 'us-east-1' },
  { value: 'minio', label: 'MinIO', defaultEndpoint: 'http://localhost:9000', defaultRegion: 'us-east-1' },
]

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('appearance')
  const { mode, setMode, accentColor, setAccentColor } = useThemeStore()
  const { notes } = useNoteStore()

  // 云同步状态
  const [syncConfig, setSyncConfig] = useState<SyncConfig>({
    enabled: false,
    provider: 'aliyun-oss',
    endpoint: 'https://oss-cn-hangzhou.aliyuncs.com',
    region: 'oss-cn-hangzhou',
    bucket: '',
    access_key_id: '',
    secret_access_key: '',
    auto_sync: false,
    sync_interval: 30,
  })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [lastSyncInfo, setLastSyncInfo] = useState<string | null>(null)

  // 加载同步配置
  useEffect(() => {
    if (window.tauriAPI?.getSyncConfig) {
      window.tauriAPI.getSyncConfig().then(config => {
        if (config) {
          setSyncConfig(config)
        }
      })
    }
  }, [])

  const themeOptions: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: '浅色', icon: <Sun size={18} /> },
    { value: 'dark', label: '深色', icon: <Moon size={18} /> },
    { value: 'system', label: '跟随系统', icon: <Monitor size={18} /> },
  ]

  const accentColors = [
    { value: '#3b82f6', name: '蓝色' },
    { value: '#22c55e', name: '绿色' },
    { value: '#f97316', name: '橙色' },
    { value: '#ef4444', name: '红色' },
    { value: '#8b5cf6', name: '紫色' },
    { value: '#ec4899', name: '粉色' },
    { value: '#14b8a6', name: '青色' },
  ]

  const handleProviderChange = (provider: CloudProvider) => {
    const option = PROVIDER_OPTIONS.find(o => o.value === provider)
    if (option) {
      setSyncConfig(prev => ({
        ...prev,
        provider,
        endpoint: option.defaultEndpoint,
        region: option.defaultRegion,
      }))
    }
  }

  const handleTestConnection = async () => {
    if (!window.tauriAPI?.testSyncConnection) return
    setTesting(true)
    setTestResult(null)
    try {
      const result = await window.tauriAPI.testSyncConnection(syncConfig)
      setTestResult({ success: result, message: result ? '连接成功！' : '连接失败' })
    } catch (err) {
      setTestResult({ success: false, message: String(err) })
    } finally {
      setTesting(false)
    }
  }

  const handleSaveConfig = async () => {
    if (!window.tauriAPI?.saveSyncConfig) return
    try {
      await window.tauriAPI.saveSyncConfig(syncConfig)
      alert('配置已保存')
    } catch (err) {
      alert('保存失败：' + err)
    }
  }

  const handleSyncUpload = async () => {
    if (!window.tauriAPI?.syncUpload) return
    setSyncing(true)
    try {
      const result = await window.tauriAPI.syncUpload()
      setLastSyncInfo(result.last_sync_result || '上传成功')
      alert(result.last_sync_result || '上传成功')
    } catch (err) {
      alert('上传失败：' + err)
    } finally {
      setSyncing(false)
    }
  }

  const handleSyncDownload = async () => {
    if (!window.tauriAPI?.syncDownload) return
    if (!confirm('确定要从云端下载数据吗？本地较旧的数据将被覆盖。')) return
    setSyncing(true)
    try {
      const result = await window.tauriAPI.syncDownload()
      setLastSyncInfo(result.last_sync_result || '下载成功')
      alert(result.last_sync_result || '下载成功')
      // 刷新笔记列表
      window.location.reload()
    } catch (err) {
      alert('下载失败：' + err)
    } finally {
      setSyncing(false)
    }
  }

  const handleExportData = () => {
    const data = {
      notes,
      tags: useTagStore.getState().tags,
      folders: useFolderStore.getState().folders,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `noteflow-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      try {
        const text = await file.text()
        const data = JSON.parse(text)

        if (data.notes) {
          useNoteStore.getState().setNotes(data.notes)
        }
        if (data.tags) {
          useTagStore.getState().setTags(data.tags)
        }
        if (data.folders) {
          useFolderStore.getState().setFolders(data.folders)
        }

        alert('数据导入成功！')
      } catch (error) {
        alert('导入失败，请检查文件格式')
      }
    }
    input.click()
  }

  const handleClearData = () => {
    if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：这将删除所有笔记、标签和文件夹！')) {
        localStorage.clear()
        window.location.reload()
      }
    }
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance', label: '外观', icon: <Sun size={16} /> },
    { id: 'data', label: '数据', icon: <Download size={16} /> },
    { id: 'sync', label: '云同步', icon: <Cloud size={16} /> },
  ]

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">设置</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X size={20} />
          </button>
        </div>

        {/* 选项卡 */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm transition-colors ${
                activeTab === tab.id
                  ? 'text-primary-600 dark:text-primary-400 border-b-2 border-primary-500'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* 内容 */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* 外观设置 */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* 主题模式 */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">主题模式</label>
                <div className="grid grid-cols-3 gap-2">
                  {themeOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setMode(option.value)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-colors ${
                        mode === option.value
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {option.icon}
                      <span className="text-xs">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 主题色 */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">主题色</label>
                <div className="flex gap-2">
                  {accentColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setAccentColor(color.value)}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        accentColor === color.value
                          ? 'border-gray-900 dark:border-white scale-110'
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 数据管理 */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              {/* 统计信息 */}
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  共 <span className="font-medium text-gray-900 dark:text-gray-100">{notes.length}</span> 篇笔记
                </p>
              </div>

              {/* 导出导入 */}
              <div className="flex gap-2">
                <button
                  onClick={handleExportData}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Download size={16} />
                  导出数据
                </button>
                <button
                  onClick={handleImportData}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                >
                  <Upload size={16} />
                  导入数据
                </button>
              </div>

              {/* 清除数据 */}
              <button
                onClick={handleClearData}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
                清除所有数据
              </button>
            </div>
          )}

          {/* 云同步 */}
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* 提示信息 */}
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm">
                配置云存储后，可以在多台设备之间同步笔记数据。支持阿里云OSS、腾讯云COS、AWS S3和MinIO。
              </div>

              {/* 存储提供商 */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">存储提供商</label>
                <select
                  value={syncConfig.provider}
                  onChange={(e) => handleProviderChange(e.target.value as CloudProvider)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  {PROVIDER_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Endpoint */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Endpoint</label>
                <input
                  type="text"
                  value={syncConfig.endpoint}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, endpoint: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://oss-cn-hangzhou.aliyuncs.com"
                />
              </div>

              {/* Region */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Region</label>
                <input
                  type="text"
                  value={syncConfig.region}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, region: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="oss-cn-hangzhou"
                />
              </div>

              {/* Bucket */}
              <div className="space-y-2">
                <label className="text-sm text-gray-600 dark:text-gray-400">Bucket 名称</label>
                <input
                  type="text"
                  value={syncConfig.bucket}
                  onChange={(e) => setSyncConfig(prev => ({ ...prev, bucket: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  placeholder="your-bucket-name"
                />
              </div>

              {/* Access Key */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Access Key ID</label>
                  <input
                    type="text"
                    value={syncConfig.access_key_id}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, access_key_id: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Access Key ID"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Secret Access Key</label>
                  <input
                    type="password"
                    value={syncConfig.secret_access_key}
                    onChange={(e) => setSyncConfig(prev => ({ ...prev, secret_access_key: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                    placeholder="Secret Access Key"
                  />
                </div>
              </div>

              {/* 测试结果 */}
              {testResult && (
                <div className={`p-3 rounded-lg flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  {testResult.success ? <Check size={18} /> : <X size={18} />}
                  <span className="text-sm">{testResult.message}</span>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={handleTestConnection}
                  disabled={testing || !syncConfig.bucket || !syncConfig.access_key_id}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {testing ? <Loader2 size={16} className="animate-spin" /> : null}
                  测试连接
                </button>
                <button
                  onClick={handleSaveConfig}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg"
                >
                  保存配置
                </button>
              </div>

              {/* 同步操作 */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">同步操作</h4>
                <div className="flex gap-2">
                  <button
                    onClick={handleSyncUpload}
                    disabled={syncing || !syncConfig.bucket}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    上传到云端
                  </button>
                  <button
                    onClick={handleSyncDownload}
                    disabled={syncing || !syncConfig.bucket}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50"
                  >
                    {syncing ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    从云端下载
                  </button>
                </div>
                {lastSyncInfo && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{lastSyncInfo}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 关于 */}
        <div className="px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            NoteFlow v1.0.0 · 本地优先笔记本应用
          </p>
        </div>
      </div>
    </div>
  )
}