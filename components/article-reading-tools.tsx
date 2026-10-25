'use client'

import { useEffect, useState } from 'react'
import { Check, Link2 } from 'lucide-react'

export function ArticleReadingTools() {
  const [progress, setProgress] = useState(0)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    const body = document.querySelector('.article-reading-body')
    if (!body) return
    let frame = 0
    const update = () => {
      frame = 0
      const bounds = body.getBoundingClientRect()
      const distance = Math.max(1, bounds.height - window.innerHeight + 120)
      setProgress(Math.round(Math.min(1, Math.max(0, (120 - bounds.top) / distance)) * 100))
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update) }
    const observer = new ResizeObserver(schedule)
    observer.observe(body)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [])

  async function copyLink() {
    try {
      const url = new URL(window.location.href)
      url.hash = ''
      await navigator.clipboard.writeText(url.toString())
      setShareStatus('Article link copied')
    } catch {
      setShareStatus('Copy the address from your browser to share this article.')
    }
  }

  return <div className="article-reading-tools">
    <div className="article-progress-label"><span>Reading progress</span><span aria-hidden="true">{progress}%</span></div>
    <progress className="article-progress" aria-label="Reading progress" max={100} value={progress} />
    <button type="button" className="article-copy-link" onClick={copyLink}>{shareStatus === 'Article link copied' ? <Check size={15} aria-hidden="true" /> : <Link2 size={15} aria-hidden="true" />}Copy article link</button>
    <p className="article-share-status" role="status">{shareStatus}</p>
  </div>
}
