import { UserWithProfileService } from '@/services/user-with-profile.services'

export async function getAgents() {
    const service = new UserWithProfileService()
    const agents = await service.findAllActiveAgents()

    // Transform the data to match the component's expected format
    return agents.map(agent => ({
        id: agent.id,
        email: agent.email,
        profile: {
            full_name: agent.profile.full_name,
            avatar_url: agent.profile.avatar_url,
            role: agent.profile.role,
        },
    }))
}
