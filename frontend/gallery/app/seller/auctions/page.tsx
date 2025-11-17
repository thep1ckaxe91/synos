"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { getImageUrl, formatPrice } from "@/lib/utils"
import { Plus, Clock, Gavel, Calendar } from 'lucide-react'
import type { AuctionResponseDto } from "@/lib/types"

export default function SellerAuctionsPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const [auctions, setAuctions] = useState<AuctionResponseDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "Seller") {
      loadAuctions()
    }
  }, [isAuthenticated, user])

  const loadAuctions = async () => {
    try {
      const data = await apiClient.getSellerAuctions()
      setAuctions(data)
    } catch (error) {
      console.error("Failed to load auctions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800"
      case "Running":
        return "bg-green-100 text-green-800"
      case "Ended":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime()
    const now = new Date().getTime()
    const diff = end - now

    if (diff <= 0) return "Ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) return `${days}d ${hours}h`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">My Auctions</h1>
                <p className="text-muted-foreground">Manage your artwork auctions</p>
              </div>
              <Button asChild>
                <Link href="/seller/auctions/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Auction
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {auctions.length === 0 ? (
              <div className="text-center py-12">
                <Gavel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No auctions yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first auction to start selling your artworks through bidding.
                </p>
                <Button asChild>
                  <Link href="/seller/auctions/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Auction
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {auctions.map((auction) => (
                  <Card key={auction.id} className="overflow-hidden">
                    <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                      <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center">
                        <Gavel className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                      <div className="absolute top-4 right-4">
                        <Badge className={getStatusColor(auction.status)}>
                          {auction.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-semibold mb-2">
                        {auction.artworkTitle || "Untitled"}
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Starting Price</span>
                          <span className="font-semibold">
                            {formatPrice(auction.startingPrice, "USD")}
                          </span>
                        </div>

                        {auction.reservePrice && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Reserve Price</span>
                            <span className="font-semibold">
                              {formatPrice(auction.reservePrice, "USD")}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Start Date
                          </span>
                          <span>{new Date(auction.startTime).toLocaleDateString()}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {auction.status === "Running" ? "Time Left" : "End Date"}
                          </span>
                          <span className={auction.status === "Running" ? "font-medium text-accent" : ""}>
                            {auction.status === "Running" 
                              ? getTimeRemaining(auction.endTime)
                              : new Date(auction.endTime).toLocaleDateString()
                            }
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Min Increment</span>
                          <span>{formatPrice(auction.minimumIncrement, "USD")}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}