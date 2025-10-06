# DreamCut

DreamCut is a powerful content generation platform that enables users to create various types of digital content including avatars, cinematic clips, comics, concept art, explainers, illustrations, and more. Built with Next.js, TypeScript, and integrated with advanced AI generation capabilities.

## Features

- 🎨 Multiple Content Types:
  - Avatars & Talking Avatars
  - Cinematic Clips
  - Comics & Illustrations
  - Concept Worlds
  - Charts & Infographics
  - Product Mockups & Motion
  - Social Media Content
  - UGC Ads
  - Voice Creation & Sound FX

- 🔐 Secure Authentication
- 🎯 Real-time Content Generation
- 📱 Responsive Design
- 🚀 High Performance
- 🎭 Character Variations
- 📊 Generation History Tracking

## Prerequisites

Before you begin, ensure you have installed:

- Node.js (v18 or higher)
- pnpm (recommended) or npm

## Environment Setup

1. Clone the repository
2. Copy the environment example file:
   ```bash
   cp env.example .env
   ```
3. Fill in your environment variables in `.env`

## Installation

```bash
# Install dependencies
pnpm install

# Or using npm
npm install
```

## Development

Run the development server:

```bash
pnpm dev

# Or using npm
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Building for Production

```bash
# Build the application
pnpm build

# Start the production server
pnpm start

# Or using npm
npm run build
npm start
```

## Project Structure

```
dreamcut/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication routes
│   └── content/           # Content pages
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── forms/            # Generation forms
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions and configurations
│   ├── supabase/        # Supabase client setup
│   └── types/           # TypeScript types
└── public/              # Static assets
```

## Testing

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Or using npm
npm test
npm run test:watch
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.