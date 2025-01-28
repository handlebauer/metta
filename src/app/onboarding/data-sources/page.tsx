'use client'

import { useEffect, useState } from 'react'
import { redirect } from 'next/navigation'
import { AIAssistant } from '@/components/ai'
import { AnimatePresence, motion } from 'framer-motion'

import { DataSourcesSetupForm } from './data-sources-setup-form.client'

interface AIStep {
    message: string
    action?: () => void
    waitForAction?: boolean
}

export default function DataSourcesPage() {
    const [websiteUrl, setWebsiteUrl] = useState<string>('')
    const [showForm, setShowForm] = useState(false)
    const [showAI, setShowAI] = useState(true)

    useEffect(() => {
        const storedWebsite = sessionStorage.getItem('workspace_website')
        if (!storedWebsite) {
            redirect('/onboarding')
        }
        setWebsiteUrl(storedWebsite)
    }, [])

    const steps: AIStep[] = [
        {
            message:
                "Finally, let's set up your data sources. This is where Metta will look for information to help your customers.",
        },
        {
            message:
                "You can connect various sources like documentation, FAQs, or knowledge bases. Don't worry if you're not ready to connect everything now - you can always add more later.",
            action: () => {
                setShowAI(false) // Start fade out of AI
            },
            waitForAction: true,
        },
    ]

    // Watch for AI being hidden and trigger form show after animation
    useEffect(() => {
        if (!showAI && !showForm) {
            // Wait for AI fade out animation to complete
            const timer = setTimeout(() => setShowForm(true), 300)
            return () => clearTimeout(timer)
        }
    }, [showAI, showForm])

    if (!websiteUrl) {
        return null // or a loading state
    }

    return (
        <div className="container flex min-h-screen items-start justify-center pt-[20vh]">
            <div className="w-full max-w-2xl">
                <AnimatePresence mode="wait">
                    {showAI && (
                        <div className="pt-[10vh]">
                            <motion.div
                                key="ai-assistant"
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
                        </div>
                    )}
                    {showForm && (
                        <motion.div
                            key="data-sources-form"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <DataSourcesSetupForm websiteUrl={websiteUrl} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
