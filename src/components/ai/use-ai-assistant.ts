'use client'

import { useCallback, useEffect, useState } from 'react'

export interface Step {
    message: string
    action?: () => void
    waitForAction?: boolean
}

export function useAIAssistant(steps: Step[], onComplete?: () => void) {
    const [currentStep, setCurrentStep] = useState(0)
    const [messages, setMessages] = useState<string[]>([])
    const [isTypingDone, setIsTypingDone] = useState(false)

    // Initialize first message
    useEffect(() => {
        if (currentStep === 0) {
            setMessages([steps[0].message])
            setIsTypingDone(false)
        }
    }, [steps, currentStep])

    const handleNextStep = useCallback(() => {
        const nextStep = currentStep + 1
        if (nextStep < steps.length) {
            setMessages(prev => [...prev, steps[nextStep].message])
            setCurrentStep(nextStep)
            setIsTypingDone(false)
        } else if (onComplete) {
            onComplete()
        }
    }, [currentStep, steps, onComplete])

    const handleTypingComplete = useCallback(() => {
        setIsTypingDone(true)
    }, [])

    return {
        currentStep,
        messages,
        handleNextStep,
        isTypingDone,
        handleTypingComplete,
    }
}
