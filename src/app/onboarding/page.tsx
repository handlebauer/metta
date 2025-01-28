'use client'

import { useRouter } from 'next/navigation'
import { AIAssistant } from '@/components/ai'

export default function OnboardingPage() {
    const router = useRouter()

    const steps = [
        {
            message:
                "Hi, I'm Metta's AI assistant. I'll help you set up your workspace and get started.",
        },
        {
            message:
                "We'll go through a few quick steps to get you up and running.",
            action: () => router.push('/onboarding/profile'),
            waitForAction: true,
        },
    ]

    return (
        <div className="container flex h-screen justify-center">
            <div className="w-full max-w-2xl pt-[30vh]">
                <div className="relative min-h-[300px]">
                    <AIAssistant steps={steps} />
                </div>
            </div>
        </div>
    )
}
