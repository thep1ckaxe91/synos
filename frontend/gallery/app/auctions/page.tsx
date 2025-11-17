"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Clock, Gavel, Lock, CalendarDays } from 'lucide-react'
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/auth-context"
import { getImageUrl, formatPrice } from "@/lib/utils"
import type { AuctionDetailDto } from "@/lib/types" // Removed GuestAuctionDto

export default function AuctionsPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [activeAuctions, setActiveAuctions] = useState<AuctionDetailDto[]>([])
  const [upcomingAuctions, setUpcomingAuctions] = useState<AuctionDetailDto[]>([]) // Changed type here
  const [loading, setLoading] = useState(true)

  const loadAuctions = useCallback(async () => {
    try {
      const active = await apiClient.getBuyerAuctions(0, 50)
      const upcoming = await apiClient.getUpcomingAuctions()
      setActiveAuctions(active)
      setUpcomingAuctions(upcoming)
    } catch (error) {
      console.error("Failed to load auctions:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setLoading(false)
        return
      }
      loadAuctions()
    }
  }, [isAuthenticated, authLoading, loadAuctions])

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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">All Auctions</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore live and upcoming auctions for exclusive artworks.
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {!isAuthenticated ? (
              <div className="text-center py-12">
                <Lock className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Authentication Required</h2>
                <p className="text-muted-foreground mb-6">
                  You need to be logged in to view and participate in auctions.
                </p>
                <div className="space-x-4">
                  <Button onClick={() => router.push("/login")}>Log In</Button>
                  <Button variant="outline" onClick={() => router.push("/register")}>
                    Sign Up
                  </Button>
                </div>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-[3/4] bg-muted animate-pulse" />
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <>
                {activeAuctions.length > 0 && (
                  <div className="mb-12">
                    <h2 className="font-serif text-3xl font-bold mb-6">Live Auctions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeAuctions.map((auction) => (
                        <Link key={auction.id} href={`/auctions/${auction.id}`}>
                          <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                            <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                              <Image
                                src={getImageUrl(auction.artwork?.artworkImages?.[0]?.imageUrl) || "/placeholder.svg"}
                                alt={auction.artwork?.title || "Auction item"}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-accent text-accent-foreground">Live Auction</Badge>
                              </div>
                            </div>
                            <CardContent className="p-6">
                              <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                                {auction.artwork?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">{auction.artwork?.seller?.fullName}</p>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground">Current Bid</span>
                                  <span className="font-semibold">
                                    {auction.currentHighestBid
                                      ? formatPrice(auction.currentHighestBid, auction.artwork?.currency || "USD")
                                      : `Starting at ${formatPrice(auction.startingPrice, auction.artwork?.currency || "USD")}`}
                                  </span>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Time left
                                  </span>
                                  <span className="font-medium text-accent">{getTimeRemaining(auction.endTime)}</span>
                                </div>

                                {auction.totalBids > 0 && (
                                  <div className="text-xs text-muted-foreground">
                                    {auction.totalBids} {auction.totalBids === 1 ? "bid" : "bids"}
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {upcomingAuctions.length > 0 && (
                  <div>
                    <h2 className="font-serif text-3xl font-bold mb-6">Upcoming Auctions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {upcomingAuctions.map((auction) => (
                        <Link key={auction.id} href={`/auctions/${auction.id}`}>
                          <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                            <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                              <Image
                                src={getImageUrl(auction.artwork?.artworkImages?.[0]?.imageUrl) || "/placeholder.svg"}
                                alt={auction.artwork?.title || "Auction item"}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 right-4">
                                <Badge className="bg-blue-100 text-blue-800">Upcoming</Badge>
                              </div>
                            </div>
                            <CardContent className="p-6">
                              <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                                {auction.artwork?.title}
                              </h3>
                              <p className="text-sm text-muted-foreground mb-4">{auction.artwork?.seller?.fullName}</p>

                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <CalendarDays className="h-3 w-3" />
                                    Starts
                                  </span>
                                  <span className="font-medium">
                                    {new Date(auction.startTime).toLocaleDateString()}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-muted-foreground flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    Ends
                                  </span>
                                  <span className="font-medium">
                                    {new Date(auction.endTime).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {activeAuctions.length === 0 && upcomingAuctions.length === 0 && (
                  <div className="text-center py-12">
                    <Gavel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No auctions available at the moment.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
