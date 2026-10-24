import { Fragment, type ReactNode } from 'react'
import type { ArticleContentBlock } from '@/lib/igas-data'
import { blockText, safeContentUrl } from '@/lib/article-content'

function renderNode(node: ArticleContentBlock, key: string, headingId?: string): ReactNode {
  if (node.type === 'text' || typeof node.text === 'string') {
    let text: ReactNode = node.text || ''
    if (node.code) text = <code>{text}</code>
    if (node.bold) text = <strong>{text}</strong>
    if (node.italic) text = <em>{text}</em>
    if (node.underline) text = <u>{text}</u>
    if (node.strikethrough) text = <s>{text}</s>
    return <Fragment key={key}>{text}</Fragment>
  }
  const children = (node.children || []).map((child, index) => renderNode(child, `${key}-${index}`))
  switch (node.type) {
    case 'heading': {
      // The page already has an h1; retain the remaining editor heading hierarchy.
      const Heading = ({ 1: 'h2', 2: 'h2', 3: 'h3', 4: 'h4', 5: 'h5', 6: 'h6' } as const)[node.level as 1 | 2 | 3 | 4 | 5 | 6] || 'h2'
      return <Heading key={key} id={headingId}>{children}</Heading>
    }
    case 'paragraph': return blockText(node).trim() ? <p key={key}>{children}</p> : null
    case 'list': return node.format === 'ordered' ? <ol key={key}>{children}</ol> : <ul key={key}>{children}</ul>
    case 'list-item': return <li key={key}>{children}</li>
    case 'quote': return <blockquote key={key}>{children}</blockquote>
    case 'code': return <pre key={key}><code>{children}</code></pre>
    case 'link': {
      const href = safeContentUrl(node.url)
      return href ? <a key={key} href={href}>{children}</a> : <Fragment key={key}>{children}</Fragment>
    }
    case 'image': {
      const src = safeContentUrl(node.image?.url || node.url, true)
      return src ? <figure key={key}><img src={src} alt={node.image?.alternativeText || ''} width={node.image?.width} height={node.image?.height} loading="lazy" />{node.image?.caption && <figcaption>{node.image.caption}</figcaption>}</figure> : null
    }
    default: return <Fragment key={key}>{children}</Fragment>
  }
}

export function RichText({ content = [], className = 'article-rich-content' }: { content?: ArticleContentBlock[]; className?: string }) {
  return <div className={className}>{content.map((block, index) => renderNode(block, String(index), `section-${index}`))}</div>
}
