'use client'

import { useRef, useEffect } from 'react'
import { trackCopyCode } from '@/lib/analytics'

const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`

const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`

interface ArticleContentProps {
  html: string
  className?: string
  articleTitle?: string
}

export default function ArticleContent({ html, className, articleTitle }: ArticleContentProps) {
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const article = articleRef.current
    if (!article) return

    const preBlocks = article.querySelectorAll('pre')

    preBlocks.forEach((pre) => {
      if (pre.querySelector('.copy-button')) return

      pre.style.position = 'relative'

      const button = document.createElement('button')
      button.className = 'copy-button'
      button.setAttribute('aria-label', 'Copy code')
      button.innerHTML = COPY_ICON

      button.addEventListener('click', async () => {
        const code = pre.querySelector('code')
        const text = code?.textContent || pre.textContent || ''

        if (articleTitle) trackCopyCode(articleTitle)

        try {
          await navigator.clipboard.writeText(text)
        } catch {
          const textarea = document.createElement('textarea')
          textarea.value = text
          textarea.style.position = 'fixed'
          textarea.style.opacity = '0'
          document.body.appendChild(textarea)
          textarea.select()
          document.execCommand('copy')
          document.body.removeChild(textarea)
        }

        button.innerHTML = CHECK_ICON
        button.classList.add('copied')

        setTimeout(() => {
          button.innerHTML = COPY_ICON
          button.classList.remove('copied')
        }, 2000)
      })

      pre.appendChild(button)
    })

    return () => {
      const buttons = article.querySelectorAll('.copy-button')
      buttons.forEach((btn) => btn.remove())
    }
  }, [html])

  return (
    <article
      ref={articleRef}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
