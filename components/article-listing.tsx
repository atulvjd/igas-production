'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { CmsArticle } from '@/lib/cms-content'
import { readingMinutes } from '@/lib/article-content'

export function ArticleListing({ articles }: { articles: CmsArticle[] }) {
  const [category, setCategory] = useState<string | null>(null)
  const categories = [...new Set(articles.map((article) => article.category).filter(Boolean))]
  const visible = category ? articles.filter((article) => article.category === category) : articles
  return <>
    <div className="article-filter-bar"><div className="article-filters" role="group" aria-label="Filter articles by topic">
      <button type="button" aria-pressed={category === null} onClick={() => setCategory(null)}>All insights</button>
      {categories.map((topic) => <button type="button" aria-pressed={category === topic} key={topic} onClick={() => setCategory(topic)}>{topic}</button>)}
    </div><span className="article-result-count" role="status">{visible.length} {visible.length === 1 ? 'article' : 'articles'}</span></div>
    <div className="article-editorial-grid" key={category || 'all'}>{visible.map((article, index) => <article className={index === 0 ? 'article-editorial-card article-editorial-lead' : 'article-editorial-card'} key={article.slug}>
      <Link href={`/latest-thinking/${article.slug}`} className="article-editorial-link">
        {article.media.src && <div className="article-editorial-image"><img src={article.media.src} alt={article.media.alt || ''} loading="lazy" /></div>}
        <div className="article-editorial-copy"><div className="article-meta"><span>{article.category}</span>{article.date && <time dateTime={article.publicationDate}>{article.date}</time>}</div><h2>{article.title}</h2><p>{article.excerpt}</p><div className="article-editorial-footer"><span>Read article <ArrowUpRight size={16} /></span><span>{readingMinutes(article.content)} min read</span></div></div>
      </Link>
    </article>)}</div>
  </>
}
