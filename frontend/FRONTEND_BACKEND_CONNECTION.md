# Frontend-Backend Connection Guide

## Overview
The Synos Art Gallery frontend has been successfully connected to the backend API. This document outlines the configuration and setup.

## Configuration

### Environment Variables
The frontend uses the following environment variables (configured in `.env.local`):

\`\`\`env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080/api

# Frontend URLs
NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
NEXT_PUBLIC_ADMIN_URL=http://localhost:3000
\`\`\`

### API Base URLs
- **Backend API**: `http://localhost:8080/api` (when using Docker)
- **Frontend Gallery**: `http://localhost:3001` (when using Docker)
- **Frontend Admin**: `http://localhost:3000` (when using Docker)
- **Development Gallery**: `http://localhost:3000` (when running npm run dev)

## API Client Configuration

### Features Implemented
1. **Guest/Public Endpoints** - No authentication required:
   - ✅ Get all artworks with pagination
   - ✅ Get artwork details
   - ✅ Get featured artworks
   - ✅ Get recent artworks
   - ✅ Get related artworks
   - ✅ Search artworks with advanced filters
   - ✅ Get categories
   - ✅ Get artworks by category
   - ✅ Get exhibitions (all, active, upcoming, past)
   - ✅ Get exhibition details and artworks
   - ✅ Get active auctions
   - ✅ Get auction details
   - ✅ Get application statistics
   - ✅ Get application info

2. **Authentication Endpoints**:
   - ✅ Member login (`/members/login`)
   - ✅ Member registration (`/members/register`)
   - ✅ Get current user profile
   - ✅ JWT token management

3. **Authenticated Member Endpoints**:
   - ✅ Get/update user profile
   - ✅ Favorites management
   - ✅ Purchase history
   - ✅ Order creation
   - ✅ Auction bidding

4. **Seller Endpoints**:
   - ✅ Create/manage artworks
   - ✅ Create/manage auctions
   - ✅ Sales history

## Image Handling
The frontend includes utilities for proper image URL handling:

### Image URL Helper
\`\`\`typescript
import { getImageUrl } from '@/lib/utils'

// Usage
const imageUrl = getImageUrl(artwork.images[0]?.imageUrl)
\`\`\`

### Next.js Image Configuration
The `next.config.mjs` has been updated to handle images from the backend:

\`\`\`javascript
images: {
  unoptimized: true,
  remotePatterns: [
    {
      protocol: 'http',
      hostname: 'localhost',
      port: '8080',
      pathname: '/**',
    },
  ],
}
\`\`\`

## Testing the Connection

### API Test Page
A test page has been created at `/api-test` to verify the backend connection. It tests:

1. Application info endpoint
2. Statistics endpoint
3. Categories endpoint
4. Artworks endpoint
5. Exhibitions endpoint

### Running Tests
1. Start the backend (Docker or directly)
2. Start the frontend: `npm run dev`
3. Navigate to `http://localhost:3000/api-test`
4. Click "Run API Tests"

## Error Handling
The API client includes comprehensive error handling:

- Network errors
- Authentication errors
- Validation errors
- Server errors (500, etc.)

## Authentication Flow
1. User logs in via `/login` page
2. JWT token is stored in localStorage
3. Token is automatically included in API requests
4. Auth context manages user state
5. Protected routes check authentication status

## Development Workflow

### Starting the Application
1. **Backend**: Use Docker Compose or run directly
   \`\`\`bash
   cd backend
   docker-compose up
   \`\`\`

2. **Frontend**: 
   \`\`\`bash
   cd frontend/gallery
   npm run dev
   \`\`\`

### Making API Calls
\`\`\`typescript
import { apiClient } from '@/lib/api'

// Guest endpoints (no auth)
const artworks = await apiClient.getArtworks()
const categories = await apiClient.getCategories()

// Authenticated endpoints
const user = await apiClient.getCurrentUser()
const favorites = await apiClient.getFavorites()
\`\`\`

## Important Notes

1. **CORS**: The backend should be configured to allow requests from the frontend origin
2. **Image URLs**: Use the `getImageUrl()` helper for all artwork images
3. **Authentication**: JWT tokens are automatically managed by the API client
4. **Error Handling**: All API calls should be wrapped in try-catch blocks
5. **Loading States**: Implement loading states for better UX

## Troubleshooting

### Common Issues
1. **Connection Refused**: Check if backend is running on correct port (8080)
2. **CORS Errors**: Verify backend CORS configuration
3. **Image Loading**: Check image URL patterns in next.config.mjs
4. **Authentication**: Verify JWT token is being sent correctly

### Debug Tools
- Use browser dev tools Network tab
- Check `/api-test` page for connection status
- Verify environment variables are loaded correctly
- Check console for error messages

## Next Steps
1. Test all authentication flows
2. Verify image uploads and display
3. Test payment integration
4. Implement real-time auction updates
5. Add error boundaries for better error handling
