/**
 * 格式化日期为相对时间
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) {
    return '刚刚'
  } else if (diffMin < 60) {
    return `${diffMin}分钟前`
  } else if (diffHour < 24) {
    return `${diffHour}小时前`
  } else if (diffDay < 7) {
    return `${diffDay}天前`
  } else if (diffWeek < 4) {
    return `${diffWeek}周前`
  } else if (diffMonth < 12) {
    return `${diffMonth}个月前`
  } else {
    return `${diffYear}年前`
  }
}

/**
 * 格式化日期为标准格式
 */
export function formatDate(
  dateString: string,
  format: 'short' | 'long' | 'full' = 'short'
): string {
  const date = new Date(dateString)
  const options: Intl.DateTimeFormatOptions = {}

  switch (format) {
    case 'short':
      options.year = 'numeric'
      options.month = 'short'
      options.day = 'numeric'
      break
    case 'long':
      options.year = 'numeric'
      options.month = 'long'
      options.day = 'numeric'
      options.hour = '2-digit'
      options.minute = '2-digit'
      break
    case 'full':
      options.year = 'numeric'
      options.month = 'long'
      options.day = 'numeric'
      options.weekday = 'long'
      options.hour = '2-digit'
      options.minute = '2-digit'
      options.second = '2-digit'
      break
  }

  return date.toLocaleDateString('zh-CN', options)
}

/**
 * 获取ISO格式的时间字符串
 */
export function getISOString(): string {
  return new Date().toISOString()
}

/**
 * 检查日期是否是今天
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  )
}

/**
 * 检查日期是否是昨天
 */
export function isYesterday(dateString: string): boolean {
  const date = new Date(dateString)
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  )
}