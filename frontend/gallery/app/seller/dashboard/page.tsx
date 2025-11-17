"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { formatPrice } from "@/lib/utils"
import { Package, DollarSign, ImageIcon, Gavel } from 'lucide-react'
import type { SellerArtworkDto, SalesHistoryDto, AuctionResponseDto } from "@/lib/types"

export default function SellerDashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [artworks, setArtworks] = useState<SellerArtworkDto[]>([])
  const [salesHistory, setSalesHistory] = useState<SalesHistoryDto[]>([])
  const [auctions, setAuctions] = useState<AuctionResponseDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "Seller") {
      loadDashboardData()
    }
  }, [isAuthenticated, user])

  const loadDashboardData = async () => {
    try {
      const [artworksData, salesData, auctionsData] = await Promise.all([
        apiClient.getSellerArtworks(),
        apiClient.getSalesHistory(),
        apiClient.getSellerAuctions(),
      ])
      setArtworks(artworksData)
      setSalesHistory(salesData)
      setAuctions(auctionsData)
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = salesHistory.reduce((sum, sale) => sum + sale.payoutAmount, 0)
  const totalSales = salesHistory.length
  const activeArtworks = artworks.filter((a) => a.status === "Available").length

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (user?.role !== "Seller") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-muted-foreground">You need to be a seller to access this page.</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-12">
          <div className="container px-4">
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Seller Dashboard</h1>
            <p className="text-muted-foreground">Manage your artworks and track your sales</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{artworks.length}</div>
                  <p className="text-xs text-muted-foreground">{activeArtworks} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalSales}</div>
                  <p className="text-xs text-muted-foreground">All time</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(totalRevenue, "VND")}</div>
                  <p className="text-xs text-muted-foreground">After commission</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Auctions</CardTitle>
                  <Gavel className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {auctions.filter((a) => a.status === "Running").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {auctions.filter((a) => a.status === "Running").length} active, {auctions.length} total
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Artwork</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add new artworks to your collection for sale or auction.
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/seller/artworks/new">Upload New Artwork</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manage Artworks</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage all your uploaded artworks and their status.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/seller/artworks">View My Artworks</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Create Auction</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Create auctions for your artworks to maximize selling potential.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/seller/auctions/new">Create New Auction</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Manage Auctions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage all your active and past auctions.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/seller/auctions">View My Auctions</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sales History</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track your sales, commissions, and earnings over time.
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/seller/sales">View Sales History</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Recent Sales */}
            {salesHistory.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Recent Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {salesHistory.slice(0, 5).map((sale) => (
                      <div key={sale.orderId} className="flex items-center justify-between pb-4 border-b last:border-0">
                        <div>
                          <p className="font-medium">{sale.artworkTitle}</p>
                          <p className="text-sm text-muted-foreground">
                            Sold to {sale.buyerName} • {new Date(sale.soldAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatPrice(sale.payoutAmount, "VND")}</p>
                          <p className="text-xs text-muted-foreground">
                            Sale: {formatPrice(sale.salePrice, "VND")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
