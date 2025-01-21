import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

interface SeedMessage {
    ticket_index: number // Index in the SEED_TICKETS array
    messages: {
        role: 'customer' | 'agent' | 'system'
        content: string
        user_email: string
    }[]
}

const SEED_MESSAGES: SeedMessage[] = [
    // Billing cycle question (Demo User)
    {
        ticket_index: 1,
        messages: [
            {
                role: 'customer',
                content:
                    'Hi, I noticed I was charged on the 15th, but I thought billing was on the 1st of each month.',
                user_email: 'demo@example.com',
            },
            {
                role: 'agent',
                content:
                    'Hello! Let me check your billing settings. The billing date is typically set based on your signup date.',
                user_email: 'agent1@example.com',
            },
            {
                role: 'customer',
                content:
                    'Ah, that makes sense. Is it possible to change it to the 1st?',
                user_email: 'demo@example.com',
            },
            {
                role: 'agent',
                content:
                    "Yes, we can adjust that for you. I'll prorate the charges accordingly. Would you like me to make that change?",
                user_email: 'agent1@example.com',
            },
        ],
    },
    // Password reset (Demo User)
    {
        ticket_index: 2,
        messages: [
            {
                role: 'customer',
                content:
                    "The password reset link I received isn't working. It says the token is invalid.",
                user_email: 'demo@example.com',
            },
            {
                role: 'agent',
                content:
                    "I apologize for the inconvenience. The reset links expire after 1 hour for security. I'll send you a new one right away.",
                user_email: 'agent2@example.com',
            },
            {
                role: 'customer',
                content: 'Got it, thanks! The new link worked perfectly.',
                user_email: 'demo@example.com',
            },
            {
                role: 'agent',
                content: 'Excellent! Let me know if you need anything else.',
                user_email: 'agent2@example.com',
            },
        ],
    },
    // Login help (Customer 1)
    {
        ticket_index: 5,
        messages: [
            {
                role: 'customer',
                content: 'Hi, I need help with my account.',
                user_email: 'customer1@example.com',
            },
            {
                role: 'agent',
                content:
                    "Hello! I'd be happy to help. What seems to be the issue?",
                user_email: 'agent1@example.com',
            },
            {
                role: 'customer',
                content:
                    "I can't log in to my account. It says my password is incorrect.",
                user_email: 'customer1@example.com',
            },
            {
                role: 'agent',
                content:
                    "I'll help you reset your password. First, can you confirm if you're using the correct email address?",
                user_email: 'agent1@example.com',
            },
        ],
    },
    // Dark mode request (Customer 2)
    {
        ticket_index: 9,
        messages: [
            {
                role: 'customer',
                content:
                    'The dashboard is great, but it would be even better with a dark mode option.',
                user_email: 'customer2@example.com',
            },
            {
                role: 'agent',
                content:
                    "Thanks for the suggestion! We've actually been working on a dark mode feature. Would you be interested in beta testing it?",
                user_email: 'agent1@example.com',
            },
            {
                role: 'customer',
                content: 'Yes, absolutely! That would be great.',
                user_email: 'customer2@example.com',
            },
            {
                role: 'agent',
                content:
                    "Perfect! I'll add you to our beta testing group and send you instructions shortly.",
                user_email: 'agent1@example.com',
            },
        ],
    },
]

export async function seedMessages(
    supabase: ReturnType<typeof createClient<Database>>,
) {
    console.log('🗨️ Creating seed messages...')

    // Get all tickets
    const { data: tickets } = await supabase
        .from('tickets')
        .select('id')
        .order('created_at')
    if (!tickets) {
        throw new Error('Failed to find tickets')
    }

    // Get all users
    const { data: users } = await supabase.from('users').select('id, email')
    if (!users) {
        throw new Error('Failed to find users')
    }

    // Create messages for each conversation
    for (const conversation of SEED_MESSAGES) {
        const ticket = tickets[conversation.ticket_index]
        if (!ticket) continue

        const messages = conversation.messages.map(message => {
            const user = users.find(u => u.email === message.user_email)
            if (!user) throw new Error(`User not found: ${message.user_email}`)

            return {
                ticket_id: ticket.id,
                user_id: user.id,
                role: message.role,
                content: message.content,
                html_content: message.content,
            }
        })

        const { error } = await supabase.from('messages').insert(messages)
        if (error) throw error
    }

    console.log('✅ Seed messages created successfully')
}
