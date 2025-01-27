import { redirect } from 'next/navigation'

interface DashboardPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function DashboardPage({ params }: DashboardPageProps) {
    const { slug } = await params
    redirect(`/${slug}/tickets`)
}
