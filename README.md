# Metta - AI-Powered Customer Relationship Management

Metta is an intelligent CRM system that leverages generative AI to streamline customer support operations and minimize manual workload. The system provides comprehensive ticket management, employee interfaces, and customer self-service tools while integrating existing help resources with LLM capabilities.

## Features

- 🤖 AI-powered ticket handling and customer interactions
- 🎫 Comprehensive ticket management system
- 👥 Employee and administrative interfaces
- 🛠 Customer self-service tools
- 📱 Multi-channel support capabilities
- 🔒 Secure authentication and authorization

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Database**: Supabase
- **Package Manager**: Bun
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Authentication**: Supabase Auth

## Getting Started

### Prerequisites

- Bun (Latest version)
- Node.js 18+
- Supabase CLI

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/metta.git
cd metta
```

2. Install dependencies:

```bash
bun install
```

3. Set up your environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration values.

4. Initialize the database:

```bash
bun run supabase:init
```

5. Start the development server:

```bash
bun dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
src/
├── actions/     # Server actions organized by feature
├── app/         # Next.js app router pages and layouts
├── auth/        # Authentication related code
├── components/  # UI components
│   ├── ui/      # shadcn/ui components
│   └── feature/ # Feature-specific components
├── hooks/       # Custom React hooks
├── lib/         # Shared utilities and configurations
└── services/    # Database operations by feature
```

## Development Guidelines

1. Use Server Components by default
2. Create Client Components only when necessary (interactivity/client-side state)
3. Follow the established file naming conventions:
    - Client Components: `*.client.tsx`
    - Server Components: `*.tsx`
4. Run `bun run supabase:init` after any database schema changes

## Contributing

1. Create a feature branch (`git checkout -b feature/amazing-feature`)
2. Commit your changes (`git commit -m 'Add some amazing feature'`)
3. Push to the branch (`git push origin feature/amazing-feature`)
4. Open a Pull Request

## License

[Add your license information here]

## Support

[Add support contact information or links]
