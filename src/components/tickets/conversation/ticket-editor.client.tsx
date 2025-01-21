'use client'

import { useCallback } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Bold, Italic, Send, Strikethrough } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TicketEditorProps {
    onSend: (content: string) => Promise<void>
    isSending: boolean
}

export function TicketEditor({ onSend, isSending }: TicketEditorProps) {
    const editor = useEditor({
        extensions: [StarterKit],
        content: '',
        autofocus: true,
        immediatelyRender: false,
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
        'group cursor-text h-[140px]',
    )

    const toolbarClass = cn('flex gap-1 px-[1px] py-1 bg-zinc-50/30')
    const editorContentClass = cn('flex-1 p-3')
    const actionsClass = cn('flex justify-end px-4 py-1 bg-zinc-50/30')
    const sendButtonClass = cn(
        'shrink-0 h-8 w-8 p-0 hover:bg-transparent text-muted-foreground disabled:opacity-30 hover:text-primary disabled:bg-transparent',
    )

    const handleSend = useCallback(async () => {
        if (!editor?.getText().trim()) return
        await onSend(editor.getText())
        editor.commands.clearContent()
    }, [editor, onSend])

    return (
        <div className="p-4 pt-0">
            <div className={containerClass}>
                <div className="flex flex-col h-full">
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
                            <Bold className="w-4 h-4" />
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
                            <Italic className="w-4 h-4" />
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
                            <Strikethrough className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Editor Content */}
                    <div className={editorContentClass}>
                        <EditorContent editor={editor} />
                    </div>

                    {/* Actions */}
                    <div className={actionsClass}>
                        <Button
                            size="icon"
                            variant="ghost"
                            className={sendButtonClass}
                            onClick={handleSend}
                            disabled={isSending || !editor?.getText().trim()}
                        >
                            <Send className="w-4 h-4 text-gray-700" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
