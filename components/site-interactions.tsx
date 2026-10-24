'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/** Enhance below-the-fold sections without hiding the initial viewport or changing layout. */
export function SiteInteractions() {
  const pathname = usePathname()

  useEffect(() => {
    const main = document.querySelector('main')
    if (!main || main.classList.contains('policy-page') || !('IntersectionObserver' in window)) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sections = Array.from(main.querySelectorAll<HTMLElement>(':scope > section:not(.hero), :scope > .container:not(.page-intro):not(.detail-hero):not(.about-hero), :scope > [data-motion-section]'))
    let observer: IntersectionObserver | undefined

    const reset = () => {
      observer?.disconnect()
      for (const section of sections) section.classList.remove('motion-pending', 'motion-visible')
    }
    const setup = () => {
      reset()
      if (preference.matches) return
      observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('motion-visible')
          observer?.unobserve(entry.target)
        }
      }, { threshold: 0, rootMargin: '0px 0px 64px 0px' })
      for (const section of sections) {
        if (section.getBoundingClientRect().top < window.innerHeight + 24) continue
        section.classList.add('motion-pending')
        observer.observe(section)
      }
    }

    setup()
    // Focusing a link or navigating to a fragment must never leave its section hidden.
    const revealTarget = (event: FocusEvent | Event) => {
      let fragment = window.location.hash.slice(1)
      try { fragment = decodeURIComponent(fragment) } catch { /* Keep malformed fragments inert. */ }
      const target = event.type === 'hashchange'
        ? document.getElementById(fragment)
        : event.target
      if (!(target instanceof Element)) return
      const section = target.closest('.motion-pending')
      section?.classList.add('motion-visible')
      if (section) observer?.unobserve(section)
    }
    preference.addEventListener('change', setup)
    main.addEventListener('focusin', revealTarget)
    window.addEventListener('hashchange', revealTarget)
    return () => {
      reset()
      preference.removeEventListener('change', setup)
      main.removeEventListener('focusin', revealTarget)
      window.removeEventListener('hashchange', revealTarget)
    }
  }, [pathname])

  return null
}
