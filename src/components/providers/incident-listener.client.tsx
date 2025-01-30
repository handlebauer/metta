'use client'

import { useIncidentListener } from '@/hooks/use-incident-listener'

interface IncidentListenerProps {
    children: React.ReactNode
}

export function IncidentListener({ children }: IncidentListenerProps) {
    useIncidentListener()
    return <>{children}</>
}
