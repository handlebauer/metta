'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

const variations = [
    {
        title: 'Everything you need for modern support',
        subtitle:
            'Powerful features to help you manage customer relationships with ease',
    },
    {
        title: 'Reimagining customer support for the AI era',
        subtitle: 'Smart automation meets human-centered service delivery',
    },
    {
        title: 'Support that scales with your ambitions',
        subtitle: 'AI-powered tools to transform your customer experience',
    },
    {
        title: 'Where AI meets empathy in customer care',
        subtitle: 'Next-generation support tools for the modern business',
    },
    {
        title: 'Customer support, evolved',
        subtitle: 'Harness AI to deliver exceptional service at any scale',
    },
]

export function TextVariations() {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)

    return (
        <div className="relative">
            <div className="mb-16 space-y-4 text-center">
                <h2 className="text-3xl font-medium tracking-tight md:text-4xl">
                    {variations[selectedIndex].title}
                </h2>
                <p className="text-xl font-light text-muted-foreground">
                    {variations[selectedIndex].subtitle}
                </p>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-16 top-1/2 -translate-y-1/2 rounded-full p-2 transition-colors hover:bg-muted"
                aria-label="Show text variations"
            >
                <ChevronDown
                    className={cn(
                        'h-6 w-6 transition-transform',
                        isOpen && 'rotate-180',
                    )}
                />
            </button>

            {isOpen && (
                <div className="absolute left-0 right-0 z-10 space-y-4 rounded-lg border bg-background/95 p-4 shadow-lg backdrop-blur-sm">
                    {variations.map((variation, index) => (
                        <button
                            key={index}
                            className={cn(
                                'w-full rounded-md p-3 text-left transition-colors hover:bg-muted',
                                index === selectedIndex && 'bg-muted',
                            )}
                            onClick={() => {
                                setSelectedIndex(index)
                                setIsOpen(false)
                            }}
                        >
                            <h3 className="font-medium">{variation.title}</h3>
                            <p className="text-sm text-muted-foreground">
                                {variation.subtitle}
                            </p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
