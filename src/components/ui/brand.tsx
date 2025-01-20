import Link from 'next/link'

interface BrandProps {
    children: React.ReactNode
    href?: string
}

export function Brand({ children, href = '/' }: BrandProps) {
    return (
        <Link
            href={href}
            className="text-2xl font-bold hover:opacity-80 transition-opacity"
        >
            {children}
        </Link>
    )
}
