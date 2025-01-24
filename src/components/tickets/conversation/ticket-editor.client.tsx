'use client'

import { useCallback, useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Strikethrough } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
                class: 'w-full text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 min-h-[24px]',
            },
            handleKeyDown: (_, event) => {
                if (event.key === 'Enter' && event.shiftKey) {
                    event.preventDefault()
                    if (!isSending && editor?.getText().trim()) {
                        handleSend()
                    }
                    return true
                }
                if (event.key === 'Enter' && !event.shiftKey) {
                    return false
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
        'group flex flex-col min-h-[140px] max-h-[400px]',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-text',
    )

    const toolbarClass = cn(
        'flex gap-1 px-[1px] py-1 bg-zinc-50/10 border-b border-input/20',
    )
    const editorContentClass = cn('flex-1 p-3 overflow-y-auto min-h-0')
    const actionsClass = cn(
        'flex justify-end px-4 py-1 bg-zinc-50/10 border-t border-input/20',
    )
    const hintTextClass = cn('text-xs text-muted-foreground')

    const handleSend = useCallback(async () => {
        if (!editor?.getText().trim()) return
        const content = editor.getText()
        editor.commands.clearContent()
        await onSend(content)
    }, [editor, onSend])

    const handleContainerClick = useCallback(
        (e: React.MouseEvent) => {
            // Don't focus if clicking toolbar buttons
            if ((e.target as HTMLElement).closest('.toolbar-button')) {
                return
            }
            editor?.commands.focus()
        },
        [editor],
    )

    return (
        <div className="pt-0">
            <div className={containerClass} onClick={handleContainerClick}>
                <div className="flex h-full min-h-[inherit] flex-col">
                    {/* Toolbar */}
                    <div className={toolbarClass}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                                toolbarButtonClass(
                                    editor?.isActive('bold') ?? false,
                                ),
                                'toolbar-button',
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
                            className={cn(
                                toolbarButtonClass(
                                    editor?.isActive('italic') ?? false,
                                ),
                                'toolbar-button',
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
                            className={cn(
                                toolbarButtonClass(
                                    editor?.isActive('strike') ?? false,
                                ),
                                'toolbar-button',
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

                    {/* Hint Text - Always show the bar, but only show text when focused */}
                    <div className={actionsClass}>
                        <span className={hintTextClass}>
                            {editor?.isFocused
                                ? 'Press Shift+Enter to Send'
                                : '\u00A0'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
