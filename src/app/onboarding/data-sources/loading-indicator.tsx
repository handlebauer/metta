import { Loader2 } from 'lucide-react'

export function LoadingIndicator() {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Scanning for available pages...</span>
        </div>
    )
}
