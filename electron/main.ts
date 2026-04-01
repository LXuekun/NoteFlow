import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { StoreService } from './services/store'
import { FileSystemService } from './services/fileSystem'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

let mainWindow: BrowserWindow | null = null
const storeService = new StoreService()
const fileSystemService = new FileSystemService()

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    icon: path.join(__dirname, '../public/note.svg'),
  })

  // 开发模式加载本地服务器
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// IPC 处理程序
// 笔记操作
ipcMain.handle('notes:save', async (_, note) => {
  return storeService.saveNote(note)
})

ipcMain.handle('notes:load', async (_, id: string) => {
  return storeService.loadNote(id)
})

ipcMain.handle('notes:delete', async (_, id: string) => {
  return storeService.deleteNote(id)
})

ipcMain.handle('notes:list', async () => {
  return storeService.listNotes()
})

// 元数据操作
ipcMain.handle('metadata:save', async (_, data) => {
  return storeService.saveMetadata(data)
})

ipcMain.handle('metadata:load', async () => {
  return storeService.loadMetadata()
})

// 配置操作
ipcMain.handle('config:save', async (_, config) => {
  return storeService.saveConfig(config)
})

ipcMain.handle('config:load', async () => {
  return storeService.loadConfig()
})

// 图片操作
ipcMain.handle('images:save', async (_, imageData, noteId, mimeType) => {
  return fileSystemService.saveImage(imageData, noteId, mimeType)
})

ipcMain.handle('images:delete', async (_, imageId) => {
  return fileSystemService.deleteImage(imageId)
})

ipcMain.handle('images:list', async (_, noteId) => {
  return fileSystemService.listImages(noteId)
})

// 数据路径
ipcMain.handle('app:getDataPath', () => {
  return storeService.getDataPath()
})

// 应用生命周期
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})