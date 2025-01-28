/**
 * Splits a long text into smaller chunks with overlapping context.
 *
 * @param text - The full text to be split
 * @param options - Configuration options for chunking
 * @returns Array of chunks with their source information
 */
export interface ChunkOptions {
    chunkSize?: number
    overlapSize?: number
}

export interface TextChunk {
    content: string
    metadata: {
        startChar: number
        endChar: number
    }
}

/**
 * Finds the best breakpoint in text near the target index
 */
function findBreakpoint(
    text: string,
    targetIndex: number,
    direction: 'forward' | 'backward',
): number {
    // Priority of break characters (in order of preference)
    const breakPoints = [
        /\n#{1,6} /g, // Headers (global)
        /\n\n/g, // Double newline (global)
        /\n/g, // Single newline (global)
        /\. /g, // End of sentence (global)
        / /g, // Word boundary (global)
    ]

    const searchRange = 100 // Characters to look in either direction
    const start = Math.max(
        0,
        targetIndex - (direction === 'backward' ? searchRange : 0),
    )
    const end = Math.min(
        text.length,
        targetIndex + (direction === 'forward' ? searchRange : 0),
    )
    const searchText = text.slice(start, end)

    for (const breakPoint of breakPoints) {
        // Reset lastIndex for each pattern since we're reusing them
        breakPoint.lastIndex = 0
        const matches = Array.from(searchText.matchAll(breakPoint))
        if (matches.length > 0) {
            const match =
                direction === 'forward'
                    ? matches[0]
                    : matches[matches.length - 1]
            const offset = match.index || 0
            return (
                start + offset + (direction === 'forward' ? 0 : match[0].length)
            )
        }
    }

    return targetIndex
}

export function chunkText(
    text: string,
    { chunkSize = 1000, overlapSize = 100 }: ChunkOptions = {},
): TextChunk[] {
    // Normalize line endings and remove extra whitespace
    const normalizedText = text.replace(/\r\n/g, '\n').trim()
    const chunks: TextChunk[] = []

    // If text is smaller than chunk size, return it as a single chunk
    if (normalizedText.length <= chunkSize) {
        return [
            {
                content: normalizedText,
                metadata: {
                    startChar: 0,
                    endChar: normalizedText.length,
                },
            },
        ]
    }

    let startIndex = 0

    while (startIndex < normalizedText.length) {
        // Find the ideal end point for this chunk
        let endIndex = Math.min(startIndex + chunkSize, normalizedText.length)

        // If we're not at the end, find a natural break point
        if (endIndex < normalizedText.length) {
            endIndex = findBreakpoint(normalizedText, endIndex, 'backward')
        }

        // Calculate context boundaries with smart breaks
        const contextStart =
            startIndex > 0
                ? findBreakpoint(
                      normalizedText,
                      Math.max(0, startIndex - overlapSize),
                      'forward',
                  )
                : 0
        const contextEnd =
            endIndex < normalizedText.length
                ? findBreakpoint(
                      normalizedText,
                      Math.min(normalizedText.length, endIndex + overlapSize),
                      'backward',
                  )
                : normalizedText.length

        // Extract the chunk with context
        const chunkContent = normalizedText.slice(contextStart, contextEnd)

        // Only add chunk if it contains meaningful content
        if (chunkContent.trim().length > 0) {
            chunks.push({
                content: chunkContent,
                metadata: {
                    startChar: contextStart,
                    endChar: contextEnd,
                },
            })
        }

        // Move the start pointer for the next chunk
        startIndex = endIndex
    }

    return chunks
}
