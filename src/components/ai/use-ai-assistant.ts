'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { getAIGreeting } from '@/actions/ai.actions'

export type Step = {
    action?: () => void
    waitForAction?: boolean
} & (
    | {
          useGreeting: true
          greetingData: {
              full_name: string
              bio?: string
          }
          message?: string
      }
    | {
          useGreeting?: false
          greetingData?: never
          message: string
      }
)

export function useAIAssistant(steps: Step[], onComplete?: () => void) {
    const [currentStep, setCurrentStep] = useState<number>(0)
    const [messages, setMessages] = useState<string[]>([])
    const [isTypingDone, setIsTypingDone] = useState<boolean>(false)
    const autoAdvanceTimeoutId = useRef<number>(null)

    // Reset state when steps array changes
    useEffect(() => {
        setCurrentStep(0)
        setMessages([])
        setIsTypingDone(false)
    }, [steps])

    const handleNextStep = useCallback(() => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1)
            setIsTypingDone(false)
        } else if (onComplete) {
            onComplete()
        }
    }, [currentStep, steps.length, onComplete])

    const handleTypingComplete = useCallback(() => {
        setIsTypingDone(true)
        // If this step should auto-advance, do it after typing is complete
        const currentStepData = steps[currentStep]
        if (currentStepData && !currentStepData.waitForAction) {
            autoAdvanceTimeoutId.current = window.setTimeout(
                handleNextStep,
                500,
            )
        }
    }, [currentStep, steps, handleNextStep])

    useEffect(() => {
        const step = steps[currentStep]
        if (!step) return

        let isSubscribed = true
        const controller = new AbortController()

        // Clear any existing auto-advance timeout
        if (autoAdvanceTimeoutId.current) {
            window.clearTimeout(autoAdvanceTimeoutId.current)
        }

        if (step.useGreeting && step.greetingData) {
            // Handle AI greeting step
            const fetchGreeting = async () => {
                try {
                    const { data } = await getAIGreeting(
                        step.greetingData!.full_name,
                        step.greetingData!.bio,
                    )

                    if (!isSubscribed) return

                    if (data) {
                        setMessages(prev => [...prev, data.greeting])
                    } else {
                        setMessages(prev => [
                            ...prev,
                            `Welcome to Metta, ${step.greetingData!.full_name}!`,
                        ])
                    }
                } catch (error) {
                    if (!isSubscribed) return
                    console.error('Failed to fetch greeting:', error)
                }
            }

            fetchGreeting()
        } else {
            // Handle regular message step
            setMessages(prev => [...prev, step.message])
        }

        return () => {
            isSubscribed = false
            controller.abort()
            if (autoAdvanceTimeoutId.current) {
                window.clearTimeout(autoAdvanceTimeoutId.current)
            }
        }
    }, [currentStep, steps, handleNextStep])

    return {
        currentStep,
        messages,
        isTypingDone,
        handleNextStep,
        handleTypingComplete,
    }
}
