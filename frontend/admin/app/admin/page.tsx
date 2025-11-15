"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Palette, ShoppingCart, TrendingUp, Loader2 } from "lucide-react"
import { apiService } from "@/lib/api-service"
import { DashboardStats } from "@/lib/types"
import { toast } from "sonner"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [pendingArtworks, setPendingArtworks] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [statisticsResponse, artworksResponse] = await Promise.all([
        apiService.getStatistics(),
        apiService.getArtworks({ skip: 0, take: 1000 })
      ])
      
      setStats(statisticsResponse)
      const pending = artworksResponse.items?.filter((artwork: any) => artwork.status === 'Pending') || []
      setPendingArtworks(pending.length)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      toast.error('Failed to load dashboard statistics')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, Admin. Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Members</CardTitle>
            <Users className="h-5 w-5 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Artworks</CardTitle>
            <Palette className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalArtworks || 0}</div>
            <p className="text-xs text-muted-foreground">{stats?.pendingRegistrations || 0} pending approval</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Sales</CardTitle>
            <ShoppingCart className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats?.totalTransactions || 0}</div>
            <p className="text-xs text-muted-foreground">Completed transactions</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">Platform earnings</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pending Approvals</CardTitle>
            <CardDescription>Items requiring your attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Artwork Submissions</p>
                <p className="text-sm text-muted-foreground">{stats?.pendingRegistrations || 0} pending reviews</p>
              </div>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-sm font-medium text-accent">
                {stats?.pendingRegistrations || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Active Exhibitions</p>
                <p className="text-sm text-muted-foreground">{stats?.activeExhibitions || 0} currently running</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {stats?.activeExhibitions || 0}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Total Members</p>
                <p className="text-sm text-muted-foreground">Platform users</p>
              </div>
              <span className="rounded-full bg-chart-3/10 px-3 py-1 text-sm font-medium text-chart-3">
                {stats?.totalMembers || 0}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest actions in the system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-primary mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">New artwork approved</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-accent mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">User registration approved</p>
                <p className="text-xs text-muted-foreground">15 minutes ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-chart-3 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Purchase completed</p>
                <p className="text-xs text-muted-foreground">1 hour ago</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 rounded-full bg-chart-4 mt-2" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">New exhibition created</p>
                <p className="text-xs text-muted-foreground">3 hours ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
