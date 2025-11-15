import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImageUrl(imagePath: string | undefined | null): string {
  if (!imagePath) {
    return "/placeholder.svg"
  }
  
  // Backend returns full HTTP URLs, use them directly
  if (imagePath.startsWith('http')) {
    return imagePath
  }
  
  // Fallback: construct full URL if we get a relative path
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
  const apiBaseUrl = baseUrl.replace('/api', '')
  
  // Ensure imagePath starts with /
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${apiBaseUrl}${cleanPath}`
}

// Format price with currency
export function formatPrice(price: number | undefined | null, currency = 'USD'): string {
  if (price === null || price === undefined) {
    return 'Price on request'
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price)
}

// Format date
export function formatDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
