import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import type { Note, Metadata, AppConfig } from '../../src/types'

export class StoreService {
  private dataPath: string

  constructor() {
    this.dataPath = path.join(app.getPath('userData'), '.noteflow')
  }

  getDataPath(): string {
    return this.dataPath
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch {
      // 目录已存在
    }
  }

  private async initStorage(): Promise<void> {
    await this.ensureDir(this.dataPath)
    await this.ensureDir(path.join(this.dataPath, 'notes'))
    await this.ensureDir(path.join(this.dataPath, 'images'))
  }

  // 笔记操作
  async saveNote(note: Note): Promise<void> {
    await this.initStorage()
    const notePath = path.join(this.dataPath, 'notes', `${note.id}.json`)
    await fs.writeFile(notePath, JSON.stringify(note, null, 2), 'utf-8')
  }

  async loadNote(id: string): Promise<Note | null> {
    try {
      const notePath = path.join(this.dataPath, 'notes', `${id}.json`)
      const content = await fs.readFile(notePath, 'utf-8')
      return JSON.parse(content) as Note
    } catch {
      return null
    }
  }

  async deleteNote(id: string): Promise<void> {
    const notePath = path.join(this.dataPath, 'notes', `${id}.json`)
    try {
      await fs.unlink(notePath)
    } catch {
      // 文件不存在
    }
  }

  async listNotes(): Promise<Note[]> {
    await this.initStorage()
    const notesDir = path.join(this.dataPath, 'notes')
    const files = await fs.readdir(notesDir)
    const notes: Note[] = []

    for (const file of files) {
      if (file.endsWith('.json')) {
        const content = await fs.readFile(path.join(notesDir, file), 'utf-8')
        notes.push(JSON.parse(content) as Note)
      }
    }

    return notes
  }

  // 元数据操作
  async saveMetadata(data: Metadata): Promise<void> {
    await this.initStorage()
    const metaPath = path.join(this.dataPath, 'metadata.json')
    await fs.writeFile(metaPath, JSON.stringify(data, null, 2), 'utf-8')
  }

  async loadMetadata(): Promise<Metadata> {
    try {
      const metaPath = path.join(this.dataPath, 'metadata.json')
      const content = await fs.readFile(metaPath, 'utf-8')
      return JSON.parse(content) as Metadata
    } catch {
      return {
        tags: [],
        folders: [],
        lastUpdated: new Date().toISOString(),
      }
    }
  }

  // 配置操作
  async saveConfig(config: AppConfig): Promise<void> {
    await this.initStorage()
    const configPath = path.join(this.dataPath, 'config.json')
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), 'utf-8')
  }

  async loadConfig(): Promise<AppConfig> {
    try {
      const configPath = path.join(this.dataPath, 'config.json')
      const content = await fs.readFile(configPath, 'utf-8')
      return JSON.parse(content) as AppConfig
    } catch {
      return {
        theme: {
          mode: 'system',
          accentColor: '#3b82f6',
        },
        dataPath: this.dataPath,
        autoSave: true,
        autoSaveDelay: 300,
      }
    }
  }
}