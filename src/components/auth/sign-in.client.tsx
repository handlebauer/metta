'use client'

import { useState } from 'react'

import { DemoButton } from './demo-button.client'
import { MagicLinkForm } from './magic-link.client'
import { SocialButtons } from './social-buttons.client'

export function SignIn() {
    const [, setIsLoading] = useState(false)

    return (
        <div className="space-y-4">
            <MagicLinkForm onStateChange={setIsLoading} />
            <SocialButtons onStateChange={setIsLoading} />
            <DemoButton onStateChange={setIsLoading} />
        </div>
    )
}
