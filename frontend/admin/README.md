# Art Gallery Admin Dashboard

A modern admin dashboard for managing an online art gallery platform.

## Features

- **Dashboard Overview** - Key statistics and metrics
- **Member Management** - Approve/reject member registrations
- **Artwork Management** - Review and approve artwork submissions
- **Transaction Management** - Monitor and manage purchase requests
- **Exhibition Management** - Create and manage exhibitions

## Environment Variables

This project requires the following environment variable:

\`\`\`bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
\`\`\`

### Setting Up Environment Variables

**For local development:**

1. Create a `.env.local` file in the project root
2. Add the environment variable:
   \`\`\`
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
   \`\`\`

**For Vercel deployment:**

1. Go to your project settings in Vercel
2. Navigate to the "Environment Variables" section
3. Add `NEXT_PUBLIC_API_BASE_URL` with your production API URL

**In v0 preview:**

1. Click the sidebar icon in the chat
2. Go to the "Vars" section
3. Add `NEXT_PUBLIC_API_BASE_URL` with value `http://localhost:5000`

## Installation

Install using the shadcn CLI:

\`\`\`bash
npx shadcn@latest init
\`\`\`

Or download the ZIP and install dependencies:

\`\`\`bash
npm install
\`\`\`

## Development

Run the development server:

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication

The dashboard includes a demo login for testing. For production, connect to your backend authentication API.

## Tech Stack

- **Framework:** Next.js 16
- **Styling:** Tailwind CSS v4
- **UI Components:** shadcn/ui
- **Language:** TypeScript
