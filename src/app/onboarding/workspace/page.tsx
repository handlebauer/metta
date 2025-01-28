'use client'

import { useEffect, useState } from 'react'
import { AIAssistant } from '@/components/ai'
import { AnimatePresence, motion } from 'framer-motion'

import { WorkspaceSetupForm } from './workspace-setup-form.client'

export default function WorkspaceSetupPage() {
    const [showForm, setShowForm] = useState(false)
    const [showAI, setShowAI] = useState(true)

    const steps = [
        {
            message:
                "Now, let's set up your workspace. This is where you and your team will manage customer support.",
        },
        {
            message:
                "First, I'll need your website URL. We'll use this to help set up your workspace.",
            action: () => setShowAI(false), // Start fade out of AI
            waitForAction: true,
        },
    ]

    // Watch for AI being hidden and trigger form show after animation
    useEffect(() => {
        if (!showAI) {
            // Wait for AI fade out animation to complete
            const timer = setTimeout(() => setShowForm(true), 300)
            return () => clearTimeout(timer)
        }
    }, [showAI])

    return (
        <div className="container flex h-screen justify-center">
            <div className="w-full max-w-2xl pt-[30vh]">
                <div className="relative min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {showAI && (
                            <motion.div
                                className="absolute inset-0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <AIAssistant
                                    steps={steps}
                                    showMessages={showAI}
                                />
                            </motion.div>
                        )}
                        {showForm && (
                            <motion.div
                                className="absolute inset-0"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <WorkspaceSetupForm />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
