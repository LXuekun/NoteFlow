import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { app } from 'electron'

export class FileSystemService {
  private dataPath: string

  constructor() {
    this.dataPath = path.join(app.getPath('userData'), '.noteflow')
  }

  private async ensureDir(dir: string): Promise<void> {
    try {
      await fs.mkdir(dir, { recursive: true })
    } catch {
      // 目录已存在
    }
  }

  // 保存图片
  async saveImage(base64Data: string, noteId: string, mimeType: string): Promise<string> {
    await this.ensureDir(path.join(this.dataPath, 'images'))

    // 从base64提取数据
    const matches = base64Data.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      throw new Error('Invalid image data')
    }

    const data = matches[2]
    const buffer = Buffer.from(data, 'base64')

    // 检查文件大小 (10MB限制)
    if (buffer.length > 10 * 1024 * 1024) {
      throw new Error('Image size exceeds 10MB limit')
    }

    // 生成文件名
    const ext = mimeType.split('/')[1] || 'png'
    const hash = crypto.createHash('md5').update(buffer).digest('hex').substring(0, 8)
    const filename = `${noteId}_${Date.now()}_${hash}.${ext}`
    const imagePath = path.join(this.dataPath, 'images', filename)

    await fs.writeFile(imagePath, buffer)

    return `noteflow://images/${filename}`
  }

  // 删除图片
  async deleteImage(imageId: string): Promise<void> {
    const imagePath = path.join(this.dataPath, 'images', imageId)
    try {
      await fs.unlink(imagePath)
    } catch {
      // 文件不存在
    }
  }

  // 列出笔记的所有图片
  async listImages(noteId: string): Promise<string[]> {
    const imagesDir = path.join(this.dataPath, 'images')
    try {
      const files = await fs.readdir(imagesDir)
      return files
        .filter(f => f.startsWith(noteId))
        .map(f => `noteflow://images/${f}`)
    } catch {
      return []
    }
  }

  // 读取图片
  async readImage(filename: string): Promise<Buffer> {
    const imagePath = path.join(this.dataPath, 'images', filename)
    return fs.readFile(imagePath)
  }
}