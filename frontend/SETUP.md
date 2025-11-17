# Synos Frontend Setup Guide

This guide will help you set up and run both frontend applications (Gallery and Admin) on your local machine.

## Prerequisites

Before you begin, make sure you have the following installed:

- **Node.js** version 20.0.0 or higher
- **npm** (comes with Node.js) or **yarn**
- **Backend API** running on `http://localhost:5000` (or your configured port)

## Setup Instructions

### 1. Gallery Frontend (Public-facing application)

#### Navigate to the gallery directory:
\`\`\`bash
cd frontend/gallery
\`\`\`

#### Install dependencies:
\`\`\`bash
npm install
\`\`\`

#### Set up environment variables:
\`\`\`bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your settings
# Make sure NEXT_PUBLIC_API_URL points to your backend API
\`\`\`

#### Run the development server:
\`\`\`bash
npm run dev
\`\`\`

The gallery frontend will be available at: **http://localhost:3000**

---

### 2. Admin Frontend (Admin dashboard)

#### Navigate to the admin directory:
\`\`\`bash
cd frontend/admin
\`\`\`

#### Install dependencies:
\`\`\`bash
npm install
\`\`\`

#### Set up environment variables:
\`\`\`bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your settings
# Make sure NEXT_PUBLIC_API_URL points to your backend API
\`\`\`

#### Run the development server:
\`\`\`bash
# The admin runs on a different port to avoid conflicts
npm run dev -- -p 3001
\`\`\`

The admin frontend will be available at: **http://localhost:3001**

---

## Running Both Frontends Simultaneously

You can run both frontends at the same time in separate terminal windows:

### Terminal 1 (Gallery):
\`\`\`bash
cd frontend/gallery
npm run dev
\`\`\`

### Terminal 2 (Admin):
\`\`\`bash
cd frontend/admin
npm run dev -- -p 3001
\`\`\`

---

## Environment Variables

### Gallery Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Synos Art Gallery
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### Admin Frontend (.env.local)
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Synos Admin
NEXT_PUBLIC_APP_URL=http://localhost:3001
\`\`\`

---

## Available Scripts

Both frontends support the following npm scripts:

- `npm run dev` - Start the development server
- `npm run build` - Build for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality

---

## Port Configuration

By default:
- **Gallery Frontend**: http://localhost:3000
- **Admin Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000

You can change these ports by:
- Frontend ports: Use the `-p` flag with `npm run dev -- -p PORT_NUMBER`
- API URL: Update `NEXT_PUBLIC_API_URL` in your `.env.local` file

---

## Troubleshooting

### Port Already in Use
If you get an error that the port is already in use:
\`\`\`bash
# Use a different port
npm run dev -- -p 3002
\`\`\`

### API Connection Issues
1. Make sure your backend API is running
2. Check that `NEXT_PUBLIC_API_URL` in `.env.local` matches your backend URL
3. Check the browser console for CORS errors
4. Verify the backend is configured to allow requests from your frontend URLs

### Dependencies Installation Issues
\`\`\`bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
\`\`\`

### Build Errors
\`\`\`bash
# Check Node.js version (must be >= 20.0.0)
node --version

# Update dependencies
npm update
\`\`\`

---

## Features by Frontend

### Gallery Frontend (Port 3000)
- Public artwork browsing
- User registration and login
- Buyer features: Purchase artworks, bid on auctions, manage cart and favorites
- Seller features: Upload artworks, manage listings, view sales
- Exhibition browsing
- Category filtering and search

### Admin Frontend (Port 3001)
- Admin dashboard with statistics
- User management (approve/reject registrations)
- Artwork management (approve/reject submissions)
- Transaction monitoring
- Purchase request approval
- Exhibition management (create, edit, delete)
- Analytics and reporting

---

## Production Build

To create a production build:

\`\`\`bash
# Build the application
npm run build

# Start the production server
npm start
\`\`\`

---

## Additional Notes

- Both frontends are built with Next.js 16 and React 19
- They use Tailwind CSS for styling
- Authentication is handled via JWT tokens stored in localStorage
- Images are served from the backend API
- Make sure your backend supports CORS for the frontend URLs

For more information about the backend API, refer to the backend documentation.
