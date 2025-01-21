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
            <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-medium tracking-tight">
                    {variations[selectedIndex].title}
                </h2>
                <p className="text-xl text-muted-foreground font-light">
                    {variations[selectedIndex].subtitle}
                </p>
            </div>

            <button
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-16 top-1/2 -translate-y-1/2 p-2 hover:bg-muted rounded-full transition-colors"
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
                <div className="absolute left-0 right-0 bg-background/95 backdrop-blur-sm rounded-lg shadow-lg p-4 space-y-4 border z-10">
                    {variations.map((variation, index) => (
                        <button
                            key={index}
                            className={cn(
                                'w-full text-left p-3 rounded-md hover:bg-muted transition-colors',
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
