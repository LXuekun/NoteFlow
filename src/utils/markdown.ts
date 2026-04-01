/**
 * 从Markdown内容中提取纯文本
 */
export function extractPlainText(markdown: string): string {
  return markdown
    .replace(/#{1,6}\s/g, '') // 标题
    .replace(/\*\*([^*]+)\*\*/g, '$1') // 粗体
    .replace(/\*([^*]+)\*/g, '$1') // 斜体
    .replace(/`([^`]+)`/g, '$1') // 行内代码
    .replace(/```[\s\S]*?```/g, '') // 代码块
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 链接
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 图片
    .replace(/^\s*[-*+]\s/gm, '') // 列表
    .replace(/^\s*\d+\.\s/gm, '') // 有序列表
    .replace(/>/g, '') // 引用
    .replace(/\n+/g, ' ') // 换行
    .trim()
}

/**
 * 从Markdown内容中提取标题
 */
export function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  if (match) {
    return match[1].trim()
  }
  return '无标题'
}

/**
 * 生成Markdown预览摘要
 */
export function generateExcerpt(markdown: string, maxLength: number = 100): string {
  const plainText = extractPlainText(markdown)
  if (plainText.length <= maxLength) {
    return plainText
  }
  return plainText.substring(0, maxLength) + '...'
}

/**
 * 在Markdown中插入文本
 */
export function insertAtCursor(
  content: string,
  text: string,
  position: number
): { content: string; newPosition: number } {
  const newContent =
    content.substring(0, position) + text + content.substring(position)
  return {
    content: newContent,
    newPosition: position + text.length,
  }
}

/**
 * 包装选中文本
 */
export function wrapSelection(
  content: string,
  start: number,
  end: number,
  prefix: string,
  suffix: string = prefix
): { content: string; newStart: number; newEnd: number } {
  const selectedText = content.substring(start, end)
  const wrappedText = prefix + selectedText + suffix
  const newContent =
    content.substring(0, start) + wrappedText + content.substring(end)
  return {
    content: newContent,
    newStart: start,
    newEnd: start + wrappedText.length,
  }
}