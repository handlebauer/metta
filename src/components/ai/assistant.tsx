'use client'

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TypeAnimation } from 'react-type-animation'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { useAIAssistant } from './use-ai-assistant'

import type { Step } from './use-ai-assistant'

export interface AIAssistantProps {
    steps: Step[]
    showMessages?: boolean
    onComplete?: () => void
    className?: string
}

export function AIAssistant({
    steps,
    showMessages = true,
    onComplete,
    className,
}: AIAssistantProps) {
    const {
        currentStep,
        messages,
        handleNextStep,
        isTypingDone,
        handleTypingComplete,
    } = useAIAssistant(steps, onComplete)
    const actionTriggeredRef = useRef(false)

    // Handle keyboard events for navigation
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (
                e.key === 'Enter' &&
                isTypingDone &&
                currentStep < steps.length &&
                showMessages &&
                !actionTriggeredRef.current
            ) {
                if (steps[currentStep].action) {
                    actionTriggeredRef.current = true
                    // Wait for exit animation
                    setTimeout(() => {
                        steps[currentStep].action?.()
                    }, 300)
                } else if (!steps[currentStep].waitForAction) {
                    handleNextStep()
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [currentStep, handleNextStep, isTypingDone, steps, showMessages])

    // Reset action trigger ref when step changes
    useEffect(() => {
        actionTriggeredRef.current = false
    }, [currentStep])

    if (!showMessages) return null

    return (
        <motion.div
            className={cn('mx-auto w-full max-w-[500px]', className)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="flex flex-col gap-3 px-4">
                <div className="flex flex-col gap-3">
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex w-full gap-4 py-2"
                        >
                            <div className="flex-shrink-0">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-primary text-primary-foreground">
                                        AI
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            <div className="flex min-w-0 flex-1 flex-col">
                                <div className="prose prose-sm dark:prose-invert flex-1">
                                    {index === messages.length - 1 ? (
                                        <TypeAnimation
                                            sequence={[
                                                message,
                                                () => handleTypingComplete(),
                                            ]}
                                            wrapper="p"
                                            speed={80}
                                            cursor={true}
                                            className="text-sm text-foreground"
                                        />
                                    ) : (
                                        <p className="text-sm text-foreground">
                                            {message}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <AnimatePresence>
                    {currentStep < steps.length &&
                        isTypingDone &&
                        steps[currentStep].action &&
                        steps[currentStep].waitForAction && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{
                                    duration: 0.2,
                                    ease: 'easeOut',
                                }}
                                className="flex items-center justify-end gap-2 pr-8 text-xs text-muted-foreground"
                            >
                                <span>Press</span>
                                <kbd className="rounded border border-border bg-muted px-2 py-1 font-mono">
                                    <span className="text-[10px] tracking-widest">
                                        ⏎
                                    </span>{' '}
                                    Enter
                                </kbd>
                                <span>to continue</span>
                            </motion.div>
                        )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
