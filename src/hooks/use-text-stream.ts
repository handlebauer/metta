import { useEffect, useRef, useState } from 'react'

import type {
    UseTextStreamOptions,
    UseTextStreamResult,
} from '@/lib/schemas/streaming.schemas'

export function useTextStream(
    text: string,
    options: UseTextStreamOptions = {},
): UseTextStreamResult {
    const { speed = 10, onComplete, paused = false } = options

    // Single source of truth for streaming state
    const [state, setState] = useState({
        text, // Current text being streamed
        displayed: '', // Currently displayed portion
        nextText: null as string | null, // Next text to stream
        isComplete: false,
        isPaused: paused,
    })

    // Streaming control using correct Timer type
    const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // Cleanup interval on unmount
    useEffect(() => {
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    // Handle new text arrival
    useEffect(() => {
        if (text !== state.text) {
            setState(prev => ({
                ...prev,
                nextText: text,
            }))
        }
    }, [text, state.text])

    // Handle pause state
    useEffect(() => {
        setState(prev => ({ ...prev, isPaused: paused }))
    }, [paused])

    // Single effect to handle all streaming logic
    useEffect(() => {
        // Clear any existing interval
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }

        // Don't stream if paused
        if (state.isPaused) {
            return
        }

        // If we have nextText and current text is complete, switch to it
        if (
            state.nextText &&
            (state.isComplete || state.displayed.length === state.text.length)
        ) {
            setState(prev => ({
                text: prev.nextText!,
                displayed: '',
                nextText: null,
                isComplete: false,
                isPaused: prev.isPaused,
            }))
            return
        }

        // If current text is complete, don't start a new interval
        if (state.isComplete || state.displayed.length === state.text.length) {
            if (!state.isComplete) {
                setState(prev => ({ ...prev, isComplete: true }))
                onComplete?.()
            }
            return
        }

        // Start streaming current text
        intervalRef.current = setInterval(() => {
            setState(prev => {
                const newDisplayed = prev.text.slice(
                    0,
                    prev.displayed.length + 1,
                )
                const isComplete = newDisplayed.length === prev.text.length

                // If we complete this text and have next text, prepare for transition
                if (isComplete && prev.nextText) {
                    return {
                        text: prev.nextText,
                        displayed: '',
                        nextText: null,
                        isComplete: false,
                        isPaused: prev.isPaused,
                    }
                }

                // Otherwise just update displayed text
                return {
                    ...prev,
                    displayed: newDisplayed,
                    isComplete: isComplete ? true : prev.isComplete,
                }
            })
        }, speed)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [
        state.text,
        state.displayed.length,
        state.isComplete,
        state.isPaused,
        state.nextText,
        speed,
        onComplete,
    ])

    return {
        displayedText: state.displayed,
        isComplete: state.isComplete && !state.nextText,
        isPaused: state.isPaused,
        progress: state.text ? state.displayed.length / state.text.length : 0,
    }
}
