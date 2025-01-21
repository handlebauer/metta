import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

import type { ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatConversationalDate(date: string): string {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) {
        return 'Today'
    } else if (days === 1) {
        return 'Yesterday'
    } else if (days < 7) {
        return `${days} days ago`
    } else if (days < 30) {
        const weeks = Math.floor(days / 7)
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`
    } else if (days < 365) {
        const months = Math.floor(days / 30)
        return `${months} ${months === 1 ? 'month' : 'months'} ago`
    } else {
        const years = Math.floor(days / 365)
        return `${years} ${years === 1 ? 'year' : 'years'} ago`
    }
}
