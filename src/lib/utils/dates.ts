/**
 * Format a date string to a localized date string
 */
export function formatDate(date: string | null): string {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
    })
}

/**
 * Format a date string to a conversational format
 * e.g. "Today at 3:12 PM" or "Yesterday at 2:15 PM" or "Jan 12 at 11:02 AM"
 */
export function formatConversationalDate(date: string | null): string {
    if (!date) return ''

    const now = new Date()
    const inputDate = new Date(date)

    // Reset hours to compare just the dates
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const isToday =
        inputDate.getDate() === today.getDate() &&
        inputDate.getMonth() === today.getMonth() &&
        inputDate.getFullYear() === today.getFullYear()

    const isYesterday =
        inputDate.getDate() === yesterday.getDate() &&
        inputDate.getMonth() === yesterday.getMonth() &&
        inputDate.getFullYear() === yesterday.getFullYear()

    const timeStr = inputDate.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    })

    if (isToday) {
        return `Today at ${timeStr}`
    } else if (isYesterday) {
        return `Yesterday at ${timeStr}`
    } else {
        const dateStr = inputDate.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
        })
        return `${dateStr} at ${timeStr}`
    }
}

/**
 * Format a date string to a relative time string (e.g., "2h ago")
 */
export function formatTimeAgo(date: string | null): string {
    if (!date) return ''

    // Use a stable timestamp for both server and client
    const stableNow = Math.floor(Date.now() / 60000) * 60000
    const past = new Date(date).getTime()
    const diffMs = stableNow - past

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
