'use client'

/**
 * RichTextEditor — reusable Tiptap-based rich text editor.
 *
 * Props:
 *   value    — HTML string (stored in DB body field)
 *   onChange — called with updated HTML string on every change
 *   placeholder — optional placeholder text
 *   minHeight — minimum editor height in px (default 400)
 *
 * Toolbar: Bold · Italic · H2 · H3 · Bullet list · Ordered list ·
 *          Blockquote · Link · Clear formatting
 *
 * Output is sanitized HTML, safe to render with dangerouslySetInnerHTML.
 */

import React, { useCallback } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

type Props = {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  minHeight?: number
}

type ToolbarButtonProps = {
  onClick: () => void
  active?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, active, disabled, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault() // Prevent editor losing focus
        onClick()
      }}
      disabled={disabled}
      title={title}
      className={`
        w-8 h-8 flex items-center justify-center rounded-sm font-sans text-[13px] font-medium
        border-none cursor-pointer transition-colors select-none
        ${active
          ? 'bg-charcoal text-white'
          : 'bg-transparent text-charcoal hover:bg-light-gray/60'
        }
        ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
      `}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-light-gray mx-1 flex-shrink-0" />
}

export function RichTextEditor({ value, onChange, placeholder, minHeight = 400 }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Disable code block — not needed for blog/news
        codeBlock: false,
        code: false,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-charcoal underline underline-offset-2 hover:text-gold transition-colors',
          rel: 'noopener noreferrer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder ?? 'Write your article here…',
      }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none',
        style: `min-height: ${minHeight}px; padding: 20px 24px; font-family: var(--font-sans, system-ui); font-size: 14px; line-height: 1.8; color: #1F1F1F;`,
      },
    },
    onUpdate({ editor }) {
      const html = editor.getHTML()
      // Treat empty editor (just a blank paragraph) as empty string
      onChange(html === '<p></p>' ? '' : html)
    },
    immediatelyRender: false,
  })

  const setLink = useCallback(() => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL', previousUrl ?? 'https://')
    if (url === null) return // cancelled
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div
      className="border border-light-gray rounded-sm bg-white overflow-hidden focus-within:border-charcoal transition-colors"
      style={{ borderWidth: '0.5px' }}
    >
      {/* ── Toolbar ── */}
      <div
        className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-light-gray bg-light-gray/10"
        style={{ borderWidth: '0 0 0.5px 0' }}
      >
        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold (Ctrl+B)"
        >
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic (Ctrl+I)"
        >
          <em>I</em>
        </ToolbarButton>

        <Divider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          H3
        </ToolbarButton>

        <Divider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet list"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/>
            <line x1="9" y1="18" x2="20" y2="18"/>
            <circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/>
            <circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/>
          </svg>
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered list"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/>
            <line x1="10" y1="18" x2="20" y2="18"/>
            <text x="2" y="8" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">1.</text>
            <text x="2" y="14" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">2.</text>
            <text x="2" y="20" fontSize="7" fill="currentColor" stroke="none" fontFamily="sans-serif">3.</text>
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/>
            <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/>
          </svg>
        </ToolbarButton>

        {/* Link */}
        <ToolbarButton
          onClick={setLink}
          active={editor.isActive('link')}
          title="Insert / edit link"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Clear formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          title="Clear formatting"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 7V4h16v3"/><path d="M5 20h6"/><path d="M13 4l-8 16"/>
            <line x1="17" y1="14" x2="22" y2="19"/><line x1="22" y1="14" x2="17" y2="19"/>
          </svg>
        </ToolbarButton>
      </div>

      {/* ── Editor area ── */}
      <EditorContent editor={editor} />
    </div>
  )
}
