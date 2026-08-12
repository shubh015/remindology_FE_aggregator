import DOMPurify from 'dompurify';

// Content rendered through this passes through an AI-generation pipeline
// over scraped/ingested source material, so it's not fully trusted even
// though it isn't directly user-submitted. Allow only the tags this rich
// text actually needs — DOMPurify strips everything else (scripts, event
// handler attributes, javascript: URIs) regardless of this list.
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u',
  'ul', 'ol', 'li', 'a', 'span',
  'h1', 'h2', 'h3', 'h4', 'blockquote', 'code', 'pre',
];
const ALLOWED_ATTR = ['href', 'target', 'rel'];

export function sanitizeHtml(html: string): string {
  // Every call site is a 'use client' page whose HTML comes from a
  // client-fetched query — during SSR the query hasn't resolved yet, so
  // there's nothing to sanitize server-side, and DOMPurify has no `window`
  // to operate on in that pass anyway. Sanitization still runs on every
  // client render, which is the only place this content ever actually
  // reaches the DOM.
  if (typeof window === 'undefined') return html;
  return DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR });
}
