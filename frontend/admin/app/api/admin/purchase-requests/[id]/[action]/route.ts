import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; action: string }> }
) {
  try {
    const { id, action } = await params
    const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
      request.cookies.get('adminToken')?.value
    const body = await request.json()

    const response = await fetch(
      `${API_BASE_URL}/api/Admin/purchase-requests/${id}/${action}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Purchase request action error:', error)
    return NextResponse.json({ message: 'Failed to process purchase request' }, { status: 500 })
  }
}
