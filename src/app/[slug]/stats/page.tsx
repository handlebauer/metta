import { redirect } from 'next/navigation'

interface StatsPageProps {
    params: Promise<{
        slug: string
    }>
}

export default async function StatsPage({ params }: StatsPageProps) {
    const { slug } = await params
    redirect(`/${slug}/stats/overview`)
}
