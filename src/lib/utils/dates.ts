/**
 * Format a date string to a localized date string
 */
export function formatDate(date: string | null): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString()
}

/**
 * Format a date string to a relative time string (e.g., "2h ago")
 */
export function formatTimeAgo(date: string | null): string {
    if (!date) return ''

    const now = new Date()
    const past = new Date(date)
    const diffMs = now.getTime() - past.getTime()

    // Convert to seconds, minutes, hours, days
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    if (diffMonths < 12) return `${diffMonths}mo ago`
    return `${diffYears}y ago`
}
