// Status and role mapping constants for admin dashboard

export const ARTWORK_STATUS_MAP: Record<number, string> = {
  0: 'Pending',
  1: 'Approved',
  2: 'Rejected',
  3: 'Available',
  4: 'Sold'
}

export const USER_ROLE_MAP: Record<number, string> = {
  0: 'Buyer',
  1: 'Seller'
}

export const TRANSACTION_STATUS_MAP: Record<number, string> = {
  0: 'Pending',
  1: 'Completed',
  2: 'Pending',
  3: 'Rejected',
  4: 'Shipped',
  5: 'Delivered'
}

// Helper functions
export function normalizeArtworkStatus(status: any): string {
  if (typeof status === 'number') {
    return ARTWORK_STATUS_MAP[status] || 'Unknown'
  }
  return String(status) || 'Unknown'
}

export function normalizeUserRole(role: any): string {
  if (typeof role === 'number') {
    return USER_ROLE_MAP[role] || 'Unknown'
  }
  return typeof role === 'string' ? role : 'Unknown'
}

export function normalizeTransactionStatus(status: any): string {
  if (typeof status === 'number') {
    return TRANSACTION_STATUS_MAP[status] || 'Unknown'
  }
  return String(status) || 'Unknown'
}
