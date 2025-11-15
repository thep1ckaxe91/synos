# Image URL Handling Updates

## Backend Changes

### ✅ Updated GuestService.cs
- Added `IHttpContextAccessor` dependency injection
- Added `GetBaseUrl()` method to determine the base URL (handles Docker environments)
- Added `ConvertFilePathToUrl()` method to convert file paths to full HTTP URLs
- Updated both `MapToGuestArtworkDto()` and `MapToGuestArtworkDetailDto()` methods to use `ConvertFilePathToUrl()` for image URLs

**Result**: Backend now returns full HTTP URLs like `http://localhost:8080/uploads/artwork_images/filename.jpg` instead of relative paths.

## Frontend Changes

### ✅ Updated utils.ts
- Modified `getImageUrl()` function to handle full HTTP URLs from backend
- Added better comment explaining that backend returns full HTTP URLs
- Kept fallback logic for edge cases

### ✅ Updated next.config.mjs
- Added broader remote patterns to allow images from any HTTP/HTTPS source
- This ensures Next.js Image component can load external images

### ✅ Updated React Components
- **page.tsx (Home)**: Already using `getImageUrl()` helper
- **exhibitions/page.tsx**: Added `getImageUrl()` import and updated image sources
- **artworks/page.tsx**: Added `getImageUrl()` import and updated artwork images
- Fixed escaped quote issues in imports

## How It Works Now

1. **Backend Process**:
   - Artworks are stored with relative file paths in database (e.g., `artwork_images/123.jpg`)
   - GuestService converts these to full URLs using `ConvertFilePathToUrl()`
   - API returns full HTTP URLs in the `ImageUrl` property

2. **Frontend Process**:
   - `getImageUrl()` helper receives full HTTP URLs from backend
   - If URL starts with 'http', it uses it directly
   - Fallback logic handles any edge cases with relative paths
   - Next.js Image component loads the images with proper optimization

## Example Flow

**Database**: `artwork_images/sample.jpg`
**Backend Processing**: Converts to `http://localhost:8080/uploads/artwork_images/sample.jpg`
**API Response**: 
```json
{
  "images": [
    {
      "id": 1,
      "imageUrl": "http://localhost:8080/uploads/artwork_images/sample.jpg",
      "isPrimary": true
    }
  ]
}
```
**Frontend**: Uses URL directly for Image component

## Benefits

1. **Consistent URLs**: All image URLs are now full HTTP URLs
2. **Environment Flexibility**: Works in Docker, development, and production
3. **CDN Ready**: Easy to switch to CDN URLs in the future
4. **Proper Caching**: Full URLs enable better browser and CDN caching
5. **Debug Friendly**: Easy to verify image URLs in browser dev tools

## Testing

To verify the changes work:

1. Start the backend (Docker or direct)
2. Start the frontend: `npm run dev`
3. Visit `/api-test` to test API endpoints
4. Browse artworks and exhibitions to see images loading
5. Check browser dev tools Network tab to see full image URLs