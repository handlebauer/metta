import { useState } from 'react'
import { signInWithMagicLink } from '@/auth'
import { Check, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export interface MagicLinkFormProps {
    onStateChange?: (loading: boolean) => void
}

export function MagicLinkForm({ onStateChange }: MagicLinkFormProps) {
    const [buttonState, setButtonState] = useState<{
        status: 'idle' | 'loading' | 'success' | 'error'
        message?: string
    }>({ status: 'idle' })

    async function handleMagicLink(formData: FormData) {
        try {
            setButtonState({ status: 'loading' })
            onStateChange?.(true)
            const email = formData.get('email') as string
            const result = await signInWithMagicLink(email)
            setButtonState({
                status: 'success',
                message: result.success,
            })
        } catch (error) {
            setButtonState({
                status: 'error',
                message:
                    error instanceof Error
                        ? error.message
                        : 'An error occurred',
            })
        } finally {
            onStateChange?.(false)
            // Reset button state after 3 seconds
            setTimeout(() => {
                setButtonState({ status: 'idle' })
            }, 3000)
        }
    }

    return (
        <form action={handleMagicLink} className="space-y-4">
            <div className="space-y-2">
                <Input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="user@example.com"
                    required
                    disabled={buttonState.status === 'loading'}
                />
            </div>
            <Button
                type="submit"
                size="lg"
                className="relative w-full font-semibold"
                disabled={buttonState.status === 'loading'}
                variant={
                    buttonState.status === 'success'
                        ? 'secondary'
                        : buttonState.status === 'error'
                          ? 'destructive'
                          : 'default'
                }
            >
                {buttonState.status === 'loading' && (
                    <span className="inline-flex items-center">
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                    </span>
                )}
                {buttonState.status === 'success' && (
                    <span className="inline-flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        {buttonState.message}
                    </span>
                )}
                {buttonState.status === 'error' && (
                    <span className="inline-flex items-center">
                        <X className="mr-2 h-4 w-4" />
                        {buttonState.message}
                    </span>
                )}
                {buttonState.status === 'idle' && 'Send Magic Link'}
            </Button>
        </form>
    )
}
