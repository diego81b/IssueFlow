import MarkdownIt from 'markdown-it'
import DOMPurify from 'dompurify'

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

export function renderMarkdownToSafeHtml(markdown: string, options?: { addTargetBlank?: boolean }) {
  const rawHtml = md.render(String(markdown || ''))
  const clean = DOMPurify.sanitize(rawHtml, {
    // allow default safe tags and attributes; adjust if needed
  })

  if (options?.addTargetBlank ?? true) {
    return clean.replace(/<a /g, '<a target="_blank" rel="noopener noreferrer" ')
  }

  return clean
}
