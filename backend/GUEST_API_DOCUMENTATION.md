# Guest API Endpoints Documentation

## Overview
This document describes the public API endpoints available for guest (unauthenticated) users in the Synos Art Gallery system. These endpoints allow guests to browse artworks, view exhibitions, search for art, and access general information without requiring authentication.

## Base URL
All endpoints are prefixed with `/api/guest`

## Authentication
All endpoints in this controller use `[AllowAnonymous]` attribute, meaning no authentication is required.

## Endpoints

### Artwork Browsing

#### GET /api/guest/artworks
Get all available artworks with pagination.

**Query Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `take` (int, optional): Number of records to take (default: 50)

**Response:** Array of `GuestArtworkDto`

#### GET /api/guest/artworks/{artworkId}
Get detailed information about a specific artwork.

**Path Parameters:**
- `artworkId` (long): The ID of the artwork

**Response:** `GuestArtworkDetailDto` with related artworks and auction details if applicable

#### GET /api/guest/artworks/featured
Get featured artworks.

**Query Parameters:**
- `count` (int, optional): Number of artworks to return (default: 10)

**Response:** Array of `GuestArtworkDto`

#### GET /api/guest/artworks/recent
Get recently added artworks.

**Query Parameters:**
- `count` (int, optional): Number of artworks to return (default: 10)

**Response:** Array of `GuestArtworkDto`

#### GET /api/guest/artworks/{artworkId}/related
Get artworks related to a specific artwork.

**Path Parameters:**
- `artworkId` (long): The ID of the artwork

**Query Parameters:**
- `count` (int, optional): Number of related artworks to return (default: 5)

**Response:** Array of `GuestArtworkDto`

### Search Functionality

#### POST /api/guest/artworks/search
Search artworks with advanced filters.

**Request Body:** `GuestSearchRequestDto`
- `keyword` (string, optional): Search keyword
- `categoryId` (int, optional): Filter by category
- `minPrice` (decimal, optional): Minimum price filter
- `maxPrice` (decimal, optional): Maximum price filter
- `artworkFor` (string, optional): "Auction" or "Fixed" or null for all
- `sortBy` (string, optional): "Title", "Price", or "CreatedAt" (default: "CreatedAt")
- `sortOrder` (string, optional): "ASC" or "DESC" (default: "DESC")
- `page` (int): Page number (default: 1)
- `pageSize` (int): Items per page (default: 20)

**Response:** `GuestSearchResultDto` with pagination information and results

### Categories

#### GET /api/guest/categories
Get all artwork categories.

**Response:** Array of `GuestCategoryDto` with artwork counts

#### GET /api/guest/categories/{categoryId}
Get details of a specific category.

**Path Parameters:**
- `categoryId` (int): The ID of the category

**Response:** `GuestCategoryDto`

#### GET /api/guest/categories/{categoryId}/artworks
Get artworks in a specific category.

**Path Parameters:**
- `categoryId` (int): The ID of the category

**Query Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `take` (int, optional): Number of records to take (default: 50)

**Response:** Array of `GuestArtworkDto`

### Exhibitions

#### GET /api/guest/exhibitions
Get all exhibitions with pagination.

**Query Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `take` (int, optional): Number of records to take (default: 50)

**Response:** Array of `GuestExhibitionDto`

#### GET /api/guest/exhibitions/{exhibitionId}
Get detailed information about a specific exhibition.

**Path Parameters:**
- `exhibitionId` (long): The ID of the exhibition

**Response:** `GuestExhibitionDto` with featured artworks

#### GET /api/guest/exhibitions/active
Get currently active exhibitions.

**Response:** Array of `GuestExhibitionDto`

#### GET /api/guest/exhibitions/upcoming
Get upcoming exhibitions.

**Response:** Array of `GuestExhibitionDto`

#### GET /api/guest/exhibitions/past
Get past exhibitions.

**Response:** Array of `GuestExhibitionDto`

#### GET /api/guest/exhibitions/{exhibitionId}/artworks
Get all artworks in a specific exhibition.

**Path Parameters:**
- `exhibitionId` (long): The ID of the exhibition

**Response:** Array of `GuestArtworkDto`

### Auctions

#### GET /api/guest/auctions
Get active auctions.

**Query Parameters:**
- `skip` (int, optional): Number of records to skip (default: 0)
- `take` (int, optional): Number of records to take (default: 50)

**Response:** Array of `GuestArtworkDto` for artworks in active auctions

#### GET /api/guest/auctions/{artworkId}
Get auction details for a specific artwork.

**Path Parameters:**
- `artworkId` (long): The ID of the artwork

**Response:** `GuestAuctionDto` with basic auction information (bid details are not available for guests)

### Statistics and Overview

#### GET /api/guest/statistics
Get general statistics and overview data.

**Response:** `GuestStatisticsDto` with:
- Total artworks count
- Active auctions count
- Active exhibitions count
- Total categories count
- Featured artworks
- Recent artworks

### Application Information

#### GET /api/guest/info
Get general application information (About Us, Contact, etc.).

**Response:** JSON object with application details, contact information, and features

## Data Transfer Objects (DTOs)

### GuestArtworkDto
Basic artwork information for guest viewing.

### GuestArtworkDetailDto
Extended artwork information with seller bio, auction details, and related artworks.

### GuestExhibitionDto
Exhibition information with featured artworks and status.

### GuestCategoryDto
Category information with artwork count.

### GuestAuctionDto
Basic auction information (without sensitive bid data).

### GuestSearchResultDto
Search results with pagination information.

### GuestStatisticsDto
Overview statistics and featured content.

## Guest User Capabilities Satisfied

This API implementation satisfies all the requirements for guest (unauthenticated) users:

1. **Account Management:**
   - Register for a new member account (via `/api/members/register`)

2. **Browsing & Viewing:**
   - View and browse all listed artworks by category
   - Search for specific artworks and paintings
   - View information about past and forthcoming art exhibitions

3. **Static Content:**
   - Access general information pages (via `/api/guest/info`)

The API provides comprehensive access to all public content while maintaining security by not exposing sensitive information like bidding details, member information, or administrative data.