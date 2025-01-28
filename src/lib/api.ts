interface ApiResponse<T> {
    success: boolean
    result?: T
    error?: string
}

interface ApiOptions {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
    body?: unknown
}

export async function callInternalApi<T>(
    endpoint: string,
    options: ApiOptions = {},
) {
    try {
        const requestInit: RequestInit = {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }

        if (options.body) {
            requestInit.body = JSON.stringify(options.body)
        }

        const response = await fetch(
            `${process.env.INTERNAL_API_URL}/api/${endpoint}`,
            requestInit,
        )

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = (await response.json()) as ApiResponse<T>

        if (!data.success || !data.result) {
            throw new Error(data.error || 'API call failed')
        }

        return { data: data.result, error: null }
    } catch (error) {
        console.error('API call failed:', error)
        return {
            data: null,
            error: error instanceof Error ? error.message : 'API call failed',
        }
    }
}
