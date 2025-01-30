import { createServiceClient } from '@/lib/supabase/service'

/**
 * Service for system-level operations and utilities
 */
export class SystemService {
    private static instance: SystemService
    private systemUserId: string | undefined

    private constructor() {}

    /**
     * Get singleton instance of SystemService
     */
    public static getInstance(): SystemService {
        if (!SystemService.instance) {
            SystemService.instance = new SystemService()
        }
        return SystemService.instance
    }

    /**
     * Get the system user ID, caching it for subsequent calls
     */
    public async getSystemUserId(): Promise<string> {
        if (!this.systemUserId) {
            const db = createServiceClient()
            const { data, error } = await db
                .from('users')
                .select('id')
                .eq('email', 'ai.sysadmin@metta.now')
                .single()

            if (error) {
                throw error
            }
            if (!data) {
                throw new Error('System user not found')
            }

            this.systemUserId = data.id
        }

        return this.systemUserId
    }
}
