import type { Article, ArticleContentBlock } from './igas-data'

export function blockText(block: ArticleContentBlock): string {
  return block.text ?? (block.children || []).map(blockText).join('')
}

export function articleHeadings(content: ArticleContentBlock[] = []) {
  return content.flatMap((block, index) => block.type === 'heading' && blockText(block).trim()
    ? [{ id: `section-${index}`, text: blockText(block), level: block.level || 2 }]
    : [])
}

export function readingMinutes(content: ArticleContentBlock[] = []) {
  const words = content.map(blockText).join(' ').trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 200))
}

export function sortArticles<T extends Pick<Article, 'slug' | 'publicationDate' | 'sortOrder'>>(articles: T[]): T[] {
  const dateValue = (value?: string) => {
    const parsed = value ? Date.parse(value) : NaN
    return Number.isNaN(parsed) ? 0 : parsed
  }
  return [...articles].sort((left, right) => (left.sortOrder ?? 0) - (right.sortOrder ?? 0)
    || dateValue(right.publicationDate) - dateValue(left.publicationDate)
    || left.slug.localeCompare(right.slug, 'en'))
}

/** Keep editor links/images useful without accepting executable URL schemes. */
export function safeContentUrl(value?: string, image = false): string | undefined {
  if (!value) return undefined
  const url = value.trim()
  if (/[\u0000-\u0020\u007f]/.test(url)) return undefined
  if (url.startsWith('/') && !url.startsWith('//') && !url.includes('\\')) return url
  if (!image && url.startsWith('#')) return url
  try {
    const parsed = new URL(url)
    return (image ? ['http:', 'https:'] : ['http:', 'https:', 'mailto:', 'tel:']).includes(parsed.protocol) ? url : undefined
  } catch { return undefined }
}
