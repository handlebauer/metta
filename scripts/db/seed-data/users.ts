export interface SeedUser {
    email: string
    password: string
    name: string
    role: 'customer' | 'agent'
    bio: string
}

export const DEMO_USER: SeedUser = {
    email: 'demo@example.com',
    password: 'demo123456',
    name: 'Demo User',
    role: 'agent',
    bio: 'Demo account for testing',
}

export const TEST_USERS: SeedUser[] = [
    {
        email: 'customer1@example.com',
        password: 'test123456',
        name: 'Alice Johnson',
        role: 'customer',
        bio: 'Regular customer account',
    },
    {
        email: 'customer2@example.com',
        password: 'test123456',
        name: 'Bob Smith',
        role: 'customer',
        bio: 'Premium customer account',
    },
    {
        email: 'agent1@example.com',
        password: 'test123456',
        name: 'Carol Williams',
        role: 'agent',
        bio: 'Support agent - Level 1',
    },
    {
        email: 'agent2@example.com',
        password: 'test123456',
        name: 'David Brown',
        role: 'agent',
        bio: 'Support agent - Level 2',
    },
]
