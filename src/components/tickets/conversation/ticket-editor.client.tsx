'use client'

import { useCallback, useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TicketEditorProps {
    onSend: (content: string) => Promise<void>
    isSending: boolean
    disabled?: boolean
}

export function TicketEditor({
    onSend,
    isSending,
    disabled,
}: TicketEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        autofocus: true,
        immediatelyRender: false,
        editable: !disabled,
        editorProps: {
            attributes: {
                class: 'w-full text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-y-auto min-h-[24px] max-h-[200px]',
            },
            handleKeyDown: (_, event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault()
                    if (!isSending && editor?.getText().trim()) {
                        handleSend()
                    }
                    return true
                }
                return false
            },
        },
    })

    // Update editor's editable state when disabled prop changes
    useEffect(() => {
        if (editor) {
            editor.setEditable(!disabled)
            editor.commands.focus()
        }
    }, [editor, disabled])

    // Class names
    const toolbarButtonClass = (isActive: boolean) =>
        cn(
            'h-8 w-8 p-0 hover:bg-transparent text-zinc-400 group-focus-within:text-zinc-600 transition-colors',
            isActive && 'text-zinc-900',
        )

    const containerClass = cn(
        'relative rounded-lg border border-input bg-background/80',
        'transition-all duration-200 hover:bg-background',
        'focus-within:bg-background focus-within:border-zinc-400',
        'focus-within:shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
        'group h-[140px]',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text',
    )

    const toolbarClass = cn('flex gap-1 px-[1px] py-1 bg-zinc-50/30')
    const editorContentClass = cn('flex-1 p-3')
    const actionsClass = cn('flex justify-end px-4 py-1 bg-zinc-50/30')
    const hintTextClass = cn('text-xs text-muted-foreground')

    const handleSend = useCallback(async () => {
        if (!editor?.getText().trim()) return
        await onSend(editor.getText())
        editor.commands.clearContent()
    }, [editor, onSend])

    return (
        <div className="pt-0">
            <div className={containerClass}>
                <div className="flex h-full flex-col">
                    {/* Toolbar */}
                    <div className={toolbarClass}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={toolbarButtonClass(
                                editor?.isActive('bold') ?? false,
                            )}
                            onClick={() =>
                                editor?.chain().focus().toggleBold().run()
                            }
                        >
                            <Bold className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={toolbarButtonClass(
                                editor?.isActive('italic') ?? false,
                            )}
                            onClick={() =>
                                editor?.chain().focus().toggleItalic().run()
                            }
                        >
                            <Italic className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={toolbarButtonClass(
                                editor?.isActive('strike') ?? false,
                            )}
                            onClick={() =>
                                editor?.chain().focus().toggleStrike().run()
                            }
                        >
                            <Strikethrough className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Editor Content */}
                    <div className={editorContentClass}>
                        <EditorContent editor={editor} />
                    </div>

                    {/* Hint Text - Only show when editor is focused */}
                    <div className={actionsClass}>
                        {editor?.isFocused && (
                            <span className={hintTextClass}>
                                Press Enter to Send
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
