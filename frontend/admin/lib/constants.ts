// Constants and utility functions for the admin panel

// Transaction status normalization
export function normalizeTransactionStatus(status: string): string {
  if (!status) return 'pending'
  
  const normalizedStatus = status.toLowerCase().trim()
  
  switch (normalizedStatus) {
    case 'completed':
    case 'success':
    case 'successful':
    case 'paid':
      return 'completed'
    case 'pending':
    case 'processing':
    case 'in_progress':
      return 'pending'
    case 'failed':
    case 'error':
    case 'cancelled':
    case 'canceled':
      return 'failed'
    case 'refunded':
    case 'refund':
      return 'refunded'
    default:
      return 'pending'
  }
}

// Payment method constants
export const PAYMENT_METHODS = {
  VNPAY: 'vnpay',
  PAYPAL: 'paypal',
  STRIPE: 'stripe',
  CASH: 'cash'
} as const

// Transaction status options
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
} as const

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const