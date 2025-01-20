export interface SeedTicket {
    subject: string
    description: string
    status: 'new' | 'open' | 'closed'
    customer_index: number // Index in the TEST_USERS array for the customer, or -1 for demo user
    agent_index?: number // Optional index in the TEST_USERS array for the agent
}

export const SEED_TICKETS: SeedTicket[] = [
    // Demo user tickets
    {
        subject: 'Need help with API integration',
        description:
            'Looking to integrate your REST API with our existing system. Can you provide documentation?',
        status: 'new',
        customer_index: -1, // Demo User
    },
    {
        subject: 'Billing cycle question',
        description:
            'When does the billing cycle start? I was charged on an unexpected date.',
        status: 'open',
        customer_index: -1, // Demo User
        agent_index: 2, // Carol Williams
    },
    {
        subject: 'Password reset not working',
        description:
            'The password reset link in my email is not working. Can you help?',
        status: 'closed',
        customer_index: -1, // Demo User
        agent_index: 3, // David Brown
    },
    {
        subject: 'Feature suggestion: Teams',
        description:
            'It would be great to have team management features for enterprise accounts.',
        status: 'open',
        customer_index: -1, // Demo User
        agent_index: 2, // Carol Williams
    },
    {
        subject: 'Urgent: Service downtime',
        description:
            'Getting 503 errors when trying to access the dashboard. Is there an outage?',
        status: 'new',
        customer_index: -1, // Demo User
    },
    // Regular customer tickets
    {
        subject: 'Cannot access my account',
        description:
            "I've been trying to log in for the past hour but keep getting an error message.",
        status: 'new',
        customer_index: 0, // Alice Johnson
    },
    {
        subject: 'Feature request: Dark mode',
        description: 'Would love to see a dark mode option in the dashboard.',
        status: 'open',
        customer_index: 1, // Bob Smith
        agent_index: 2, // Carol Williams
    },
    {
        subject: 'Bug in export functionality',
        description: 'When I try to export my data, the CSV file is empty.',
        status: 'open',
        customer_index: 0, // Alice Johnson
        agent_index: 3, // David Brown
    },
    {
        subject: 'Thank you for the quick support',
        description:
            'Just wanted to say thanks for helping me with my integration issue.',
        status: 'closed',
        customer_index: 1, // Bob Smith
        agent_index: 2, // Carol Williams
    },
    {
        subject: 'Integration with Slack',
        description:
            'Looking to integrate your service with our Slack workspace. Is this possible?',
        status: 'new',
        customer_index: 0, // Alice Johnson
    },
]
