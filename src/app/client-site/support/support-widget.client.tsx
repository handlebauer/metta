'use client'

import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { createSupportTicket } from '@/actions/support.actions'

type FormState = 'input' | 'submitting' | 'error' | 'success'

export function SupportWidget() {
    const [formState, setFormState] = useState<FormState>('input')
    const [errorMessage, setErrorMessage] = useState('')
    const [formData, setFormData] = useState({
        subject: '',
        description: '',
        email: '',
        name: '',
        priority: 'medium' as const,
    })

    // Reset form data after transition when moving to success state
    useEffect(() => {
        let timeoutId: number
        if (formState === 'success') {
            // Wait for transition to complete before resetting form
            timeoutId = window.setTimeout(() => {
                setFormData({
                    subject: '',
                    description: '',
                    email: '',
                    name: '',
                    priority: 'medium',
                })
            }, 300) // Match transition duration
        }
        return () => window.clearTimeout(timeoutId)
    }, [formState])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        // Start transition immediately
        setFormState('submitting')

        try {
            const { data, error } = await createSupportTicket(formData)

            // Wait for the form fade-out transition before showing result
            await new Promise(resolve => setTimeout(resolve, 300))

            if (error) {
                setErrorMessage(error)
                setFormState('error')
                return
            }

            if (data) {
                setFormState('success')
            }
        } catch (_err) {
            setErrorMessage('An unexpected error occurred. Please try again.')
            setFormState('error')
        }
    }

    return (
        <Card className="relative h-[600px] overflow-hidden p-6">
            {/* Error State */}
            <div
                className={cn(
                    'absolute inset-0 flex items-center justify-center p-6 transition-all duration-300',
                    formState === 'error'
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0',
                )}
            >
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-red-600">
                        Something went wrong
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">{errorMessage}</p>
                    <Button
                        variant="outline"
                        onClick={() => setFormState('input')}
                    >
                        Try Again
                    </Button>
                </div>
            </div>

            {/* Success State */}
            <div
                className={cn(
                    'absolute inset-0 flex items-center justify-center p-6 transition-all duration-300',
                    formState === 'success'
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0',
                )}
            >
                <div className="text-center">
                    <h3 className="mb-2 text-lg font-semibold text-green-600">
                        Support Ticket Created
                    </h3>
                    <p className="mb-4 text-sm text-gray-600">
                        Thank you for reaching out. We&apos;ll get back to you
                        shortly via email.
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => setFormState('input')}
                    >
                        Submit Another Request
                    </Button>
                </div>
            </div>

            {/* Input Form */}
            <form
                onSubmit={handleSubmit}
                className={cn(
                    'space-y-6 text-left transition-all duration-300',
                    formState === 'input'
                        ? 'pointer-events-auto opacity-100'
                        : 'pointer-events-none opacity-0',
                )}
            >
                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                        id="name"
                        placeholder="Your full name"
                        value={formData.name}
                        onChange={e =>
                            setFormData(prev => ({
                                ...prev,
                                name: e.target.value,
                            }))
                        }
                        required
                        disabled={formState !== 'input'}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={formData.email}
                        onChange={e =>
                            setFormData(prev => ({
                                ...prev,
                                email: e.target.value,
                            }))
                        }
                        required
                        disabled={formState !== 'input'}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                        id="subject"
                        placeholder="Brief summary of your issue"
                        value={formData.subject}
                        onChange={e =>
                            setFormData(prev => ({
                                ...prev,
                                subject: e.target.value,
                            }))
                        }
                        required
                        disabled={formState !== 'input'}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        placeholder="Please provide details about your issue..."
                        value={formData.description}
                        onChange={e =>
                            setFormData(prev => ({
                                ...prev,
                                description: e.target.value,
                            }))
                        }
                        className="min-h-[150px]"
                        required
                        disabled={formState !== 'input'}
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={formState !== 'input'}
                >
                    Submit Support Request
                </Button>
            </form>
        </Card>
    )
}
