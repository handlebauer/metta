import { createClient } from '@supabase/supabase-js'

import type { MessageInsert } from '@/lib/schemas/message.schemas'
import type { Database } from '@/lib/supabase/types'

export interface SeedMessage {
    content: string
    ticket_index: number
    user_index: number // -2 for test customer, -1 for demo agent, 0-1 for customers, 2-3 for agents
    role: 'customer' | 'agent'
}

export const SEED_MESSAGES: SeedMessage[] = [
    // Billing cycle question (Test Customer)
    {
        ticket_index: 1,
        user_index: -2,
        role: 'customer',
        content:
            'Hi, I noticed I was charged on the 15th, but I thought billing was on the 1st of each month.',
    },
    {
        ticket_index: 1,
        user_index: -1,
        role: 'agent',
        content:
            'Hello! Let me check your billing settings. The billing date is typically set based on your signup date.',
    },
    {
        ticket_index: 1,
        user_index: 0,
        role: 'customer',
        content:
            'Ah, that makes sense. Is it possible to change it to the 1st?',
    },
    {
        ticket_index: 1,
        user_index: -1,
        role: 'agent',
        content:
            "Yes, we can adjust that for you. I'll prorate the charges accordingly. Would you like me to make that change?",
    },
    // Password reset (Test Customer)
    {
        ticket_index: 2,
        user_index: -2,
        role: 'customer',
        content:
            "The password reset link I received isn't working. It says the token is invalid.",
    },
    {
        ticket_index: 2,
        user_index: -1,
        role: 'agent',
        content:
            "I apologize for the inconvenience. The reset links expire after 1 hour for security. I'll send you a new one right away.",
    },
    {
        ticket_index: 2,
        user_index: 0,
        role: 'customer',
        content: 'Got it, thanks! The new link worked perfectly.',
    },
    {
        ticket_index: 2,
        user_index: -1,
        role: 'agent',
        content: 'Excellent! Let me know if you need anything else.',
    },
    // Login help (Customer 1)
    {
        ticket_index: 5,
        user_index: 0,
        role: 'customer',
        content: 'Hi, I need help with my account.',
    },
    {
        ticket_index: 5,
        user_index: 1,
        role: 'agent',
        content: "Hello! I'd be happy to help. What seems to be the issue?",
    },
    {
        ticket_index: 5,
        user_index: 0,
        role: 'customer',
        content:
            "I can't log in to my account. It says my password is incorrect.",
    },
    {
        ticket_index: 5,
        user_index: 1,
        role: 'agent',
        content:
            "I'll help you reset your password. First, can you confirm if you're using the correct email address?",
    },
    // Dark mode request (Customer 2)
    {
        ticket_index: 9,
        user_index: 1,
        role: 'customer',
        content:
            'The dashboard is great, but it would be even better with a dark mode option.',
    },
    {
        ticket_index: 9,
        user_index: 0,
        role: 'agent',
        content:
            "Thanks for the suggestion! We've actually been working on a dark mode feature. Would you be interested in beta testing it?",
    },
    {
        ticket_index: 9,
        user_index: 1,
        role: 'customer',
        content: 'Yes, absolutely! That would be great.',
    },
    {
        ticket_index: 9,
        user_index: 0,
        role: 'agent',
        content:
            "Perfect! I'll add you to our beta testing group and send you instructions shortly.",
    },
]

export async function seedMessages(
    supabase: ReturnType<typeof createClient<Database>>,
) {
    console.log('💬 Creating seed messages...')

    // Get all required users
    const { data: testCustomer } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'testcustomer@example.com')
        .single()

    const { data: demoAgent } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'demo@example.com')
        .single()

    const { data: customers } = await supabase
        .from('users')
        .select('id')
        .in('email', ['customer1@example.com', 'customer2@example.com'])

    const { data: agents } = await supabase
        .from('users')
        .select('id')
        .in('email', ['agent1@example.com', 'agent2@example.com'])

    if (!testCustomer || !demoAgent || !customers || !agents) {
        throw new Error('Failed to find seed users')
    }

    // Get all tickets
    const { data: tickets } = await supabase.from('tickets').select('id')
    if (!tickets) {
        throw new Error('Failed to find tickets')
    }

    const messages: MessageInsert[] = SEED_MESSAGES.map(message => ({
        content: message.content,
        html_content: message.content, // For now, just use the same content
        ticket_id: tickets[message.ticket_index].id,
        user_id:
            message.user_index === -2
                ? testCustomer.id
                : message.user_index === -1
                  ? demoAgent.id
                  : message.user_index < 2
                    ? customers[message.user_index].id
                    : agents[message.user_index - 2].id,
        role: message.role,
    }))

    const { error } = await supabase.from('messages').insert(messages)

    if (error) throw error
    console.log('✅ Seed messages created successfully')
}
