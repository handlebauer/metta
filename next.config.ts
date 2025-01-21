import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Enable static page generation
    output: 'standalone',

    // Ensure styles are properly loaded across subdomains
    crossOrigin: 'anonymous',

    async rewrites() {
        const isDev = process.env.NODE_ENV === 'development'

        const domains = {
            client: isDev ? 'client-site.localhost' : 'client-site.metta.now',
        }

        return {
            beforeFiles: [
                // Client site routing
                {
                    source: '/:path((?!_next|favicon.ico).*)*',
                    destination: '/client-site/:path*',
                    has: [
                        {
                            type: 'host',
                            value: domains.client,
                        },
                    ],
                },
            ],
            afterFiles: [],
            fallback: [],
        }
    },
}

export default nextConfig
