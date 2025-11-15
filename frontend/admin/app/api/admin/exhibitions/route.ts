import { NextRequest, NextResponse } from 'next/server'
import { mockExhibitions } from '@/lib/mock-data'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export async function GET(request: NextRequest) {
  if (!API_BASE_URL) {
    return NextResponse.json(mockExhibitions)
  }

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('adminToken')?.value

    const response = await fetch(`${API_BASE_URL}/api/Admin/exhibitions/all`, {
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
    console.error('[v0] Exhibitions API error, using mock data:', error)
    return NextResponse.json(mockExhibitions)
  }
}

export async function POST(request: NextRequest) {
  if (!API_BASE_URL) {
    const body = await request.json()
    return NextResponse.json({ success: true, data: body })
  }

  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('adminToken')?.value
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/Admin/exhibitions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error('API request failed')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Exhibition create error:', error)
    return NextResponse.json({ message: 'Failed to create exhibition' }, { status: 500 })
  }
}
