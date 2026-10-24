'use client'

import { useEffect, type RefObject } from 'react'

export function useDialogFocus(open: boolean, ref: RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    if (!open || !ref.current) return
    const previous = document.activeElement as HTMLElement | null
    const overflow = document.body.style.overflow
    const root = ref.current
    const focusable = () => Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), summary, [tabindex="0"]')).filter((node) => node.getClientRects().length > 0)
    document.body.style.overflow = 'hidden'
    ;(root.querySelector<HTMLElement>('input') || focusable()[0] || root).focus()
    const trap = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return
      const elements = focusable()
      const first = elements[0]
      const last = elements.at(-1)
      if (!first) { event.preventDefault(); root.focus(); return }
      if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', trap)
    return () => {
      document.body.style.overflow = overflow
      document.removeEventListener('keydown', trap)
      if (previous?.isConnected) previous.focus()
    }
  }, [open, ref])
}
