import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface LoadingStateProps {
    skeletonCount?: number
}

export function LoadingState({ skeletonCount = 3 }: LoadingStateProps) {
    return (
        <div className="space-y-3">
            {Array.from({ length: skeletonCount }).map((_, i) => (
                <Skeleton key={i} className="h-[100px] w-full" />
            ))}
        </div>
    )
}

interface ErrorStateProps {
    error: string
}

export function ErrorState({ error }: ErrorStateProps) {
    return (
        <Card className="p-6 bg-destructive/10">
            <p className="text-destructive">Failed to load users: {error}</p>
        </Card>
    )
}

export function EmptyState() {
    return (
        <Card className="p-6">
            <p className="text-muted-foreground">No users found</p>
        </Card>
    )
}
