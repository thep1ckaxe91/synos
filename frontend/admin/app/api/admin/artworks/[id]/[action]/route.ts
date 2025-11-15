import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export async function POST(
  request: NextRequest,
  { params }: any
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('adminToken')?.value
    const body = await request.json().catch(() => ({}))

    const response = await fetch(`${API_BASE_URL}/api/Admin/artworks/${params.id}/${params.action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('[v0] Artwork action error:', error)
    return NextResponse.json({ message: 'Failed to process artwork action' }, { status: 500 })
  }
}
