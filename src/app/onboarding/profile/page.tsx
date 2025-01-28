'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AIAssistant } from '@/components/ai'
import { AnimatePresence, motion } from 'framer-motion'

import { ProfileSetupForm } from './profile-setup-form.client'

interface FormData {
    full_name: string
    bio?: string
}

export default function ProfileSetupPage() {
    const router = useRouter()
    const [showForm, setShowForm] = useState(false)
    const [showAI, setShowAI] = useState(true)
    const [formData, setFormData] = useState<FormData | null>(null)

    const initialSteps = [
        {
            message:
                "Let's start by setting up your profile. This will help personalize your experience with Metta.",
            waitForAction: false,
        },
        {
            message:
                "I'll need a couple of details from you. Don't worry, you can always update these later.",
            action: () => {
                setShowAI(false) // Start fade out of AI
            },
            waitForAction: true,
        },
    ]

    const postSubmitSteps = formData
        ? [
              {
                  useGreeting: true as const,
                  greetingData: formData,
                  waitForAction: false,
              },
              {
                  message: "Let's set up your workspace next!",
                  action: () => {
                      router.push('/onboarding/workspace')
                  },
                  waitForAction: true,
              },
          ]
        : []

    // Watch for AI being hidden and trigger form show after animation
    useEffect(() => {
        if (!showAI) {
            // Wait for AI fade out animation to complete
            const timer = setTimeout(() => setShowForm(true), 300)
            return () => clearTimeout(timer)
        }
    }, [showAI])

    const handleFormSubmit = (data: FormData) => {
        setFormData(data)
        setShowForm(false)
        setTimeout(() => setShowAI(true), 300) // Wait for fade out
    }

    return (
        <div className="container flex min-h-screen justify-center">
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
                                    steps={
                                        formData
                                            ? postSubmitSteps
                                            : initialSteps
                                    }
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
                                <ProfileSetupForm onSubmit={handleFormSubmit} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}
