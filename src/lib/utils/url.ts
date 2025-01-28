/**
 * Cleans a URL by removing protocol and trailing elements - used for display purposes
 */
export function cleanUrl(url: string) {
    return url
        .replace(/^https?:\/\//, '') // Remove protocol
        .split(/[/?#]/)[0] // Remove paths and query parameters
}

/**
 * Ensures a URL is fully formed with https:// protocol
 */
export function ensureFullyQualifiedUrl(url: string): string {
    if (!url) return url

    // Remove any existing protocol
    const cleanedUrl = url.replace(/^https?:\/\//, '')

    // Add https:// protocol
    return `https://${cleanedUrl}`
}

/**
 * Basic URL validation - checks if it's a domain with at least one dot
 */
export function isValidUrl(url: string) {
    const cleanedUrl = cleanUrl(url)
    return /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(
        cleanedUrl,
    )
}
