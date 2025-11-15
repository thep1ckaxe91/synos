'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import DashboardLayout from '@/components/dashboard-layout'
import { mockDashboardStats } from '@/lib/mock-data'

interface DashboardStats {
  totalMembers: number
  totalActiveMembers: number
  totalArtworks: number
  totalActiveArtworks: number
  pendingRegistrations: number
  pendingPurchaseRequests: number
  totalRevenue: number
  monthlyRevenue: number
  totalTransactions: number
  activeExhibitions: number
}

export default function DashboardContent() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (!response.ok) throw new Error('API not available')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.log('[v0] Using mock data for dashboard')
      // Use mock data as fallback
      setStats(mockDashboardStats)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    { title: 'Total Members', value: stats?.totalMembers, description: `${stats?.totalActiveMembers} active` },
    { title: 'Total Artworks', value: stats?.totalArtworks, description: `${stats?.totalActiveArtworks} available` },
    { title: 'Pending Registrations', value: stats?.pendingRegistrations, description: 'Awaiting approval', highlight: true },
    { title: 'Pending Purchases', value: stats?.pendingPurchaseRequests, description: 'Awaiting approval', highlight: true },
    { title: 'Total Revenue', value: stats?.totalRevenue ? `$${stats.totalRevenue.toLocaleString()}` : '$0', description: 'All time' },
    { title: 'Monthly Revenue', value: stats?.monthlyRevenue ? `$${stats.monthlyRevenue.toLocaleString()}` : '$0', description: 'This month' },
    { title: 'Total Transactions', value: stats?.totalTransactions, description: 'Completed sales' },
    { title: 'Active Exhibitions', value: stats?.activeExhibitions, description: 'Currently running' },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your art gallery platform</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Card key={i}>
                  <CardHeader className="pb-2">
                    <Skeleton className="h-4 w-24" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-16 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat, index) => (
                <Card key={index} className={stat.highlight ? 'border-primary' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value ?? 0}</div>
                    <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                  </CardContent>
                </Card>
              ))}
        </div>
      </div>
    </DashboardLayout>
  )
}
