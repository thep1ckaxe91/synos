import { NextRequest, NextResponse } from 'next/server'
import { mockTransactions } from '@/lib/mock-data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(mockTransactions)
  }

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('adminToken')?.value

    const response = await fetch(`${API_BASE_URL}/api/Admin/transactions/all`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Transactions API error, using mock data:', error)
    return NextResponse.json(mockTransactions)
  }
}
