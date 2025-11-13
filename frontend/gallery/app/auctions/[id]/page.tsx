"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Clock, Gavel, ArrowLeft, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

export default function AuctionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const [auction, setAuction] = useState<any>(null)
  const [bidAmount, setBidAmount] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAuction()
    const interval = setInterval(loadAuction, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [params.id])

  const loadAuction = async () => {
    try {
      const artworkId = Number.parseInt(params.id as string)
      const auctionData = await apiClient.getAuctionDetails(artworkId)
      setAuction(auctionData)

      // Set suggested bid amount
      const minBid = auctionData.currentHighestBid
        ? auctionData.currentHighestBid + (auctionData.minimumIncrement || 50)
        : auctionData.startingPrice
      setBidAmount(minBid.toString())
    } catch (error) {
      console.error("Failed to load auction:", error)
      toast({
        title: "Error",
        description: "Failed to load auction details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePlaceBid = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const amount = Number.parseFloat(bidAmount)
    const minBid = auction.currentHighestBid
      ? auction.currentHighestBid + (auction.minimumIncrement || 50)
      : auction.startingPrice

    if (amount < minBid) {
      toast({
        title: "Invalid bid",
        description: `Minimum bid is $${minBid.toLocaleString()}`,
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await apiClient.placeBid(auction.id, amount)
      toast({
        title: "Bid placed successfully",
        description: `Your bid of $${amount.toLocaleString()} has been placed.`,
      })
      await loadAuction()
    } catch (error) {
      toast({
        title: "Failed to place bid",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getTimeRemaining = () => {
    if (!auction) return ""

    const end = new Date(auction.endTime).getTime()
    const now = new Date().getTime()
    const diff = end - now

    if (diff <= 0) return "Auction ended"

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`
    return `${minutes}m ${seconds}s`
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="aspect-square bg-muted animate-pulse rounded-lg" />
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-12 text-center">
          <p className="text-muted-foreground">Auction not found</p>
        </main>
        <Footer />
      </div>
    )
  }

  const artwork = auction.artwork
  const isActive = auction.status === "Running"
  const minBid = auction.currentHighestBid
    ? auction.currentHighestBid + (auction.minimumIncrement || 50)
    : auction.startingPrice

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Auctions
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Artwork Image */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                <Image
                  src={artwork?.artworkImages?.[0]?.imageUrl || "/placeholder.svg?height=800&width=800"}
                  alt={artwork?.title || "Artwork"}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Auction Details */}
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{artwork?.title}</h1>
                <p className="text-xl text-muted-foreground">{artwork?.seller?.fullName}</p>
              </div>

              <Card className="border-accent/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-accent" />
                    Current Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                    <p className="text-3xl font-bold">
                      {auction.currentHighestBid
                        ? `$${auction.currentHighestBid.toLocaleString()}`
                        : `Starting at $${auction.startingPrice.toLocaleString()}`}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 px-4 bg-accent/10 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-accent" />
                      <span className="font-medium">Time Remaining</span>
                    </div>
                    <span className="text-xl font-bold text-accent">{getTimeRemaining()}</span>
                  </div>

                  {auction.totalBids > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {auction.totalBids} {auction.totalBids === 1 ? "bid" : "bids"} placed
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {isActive && (
                <Card>
                  <CardHeader>
                    <CardTitle>Place Your Bid</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="bidAmount">Bid Amount (USD)</Label>
                      <Input
                        id="bidAmount"
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`Minimum $${minBid.toLocaleString()}`}
                        className="text-lg"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Minimum bid: ${minBid.toLocaleString()}</p>
                    </div>
                    <Button size="lg" className="w-full" onClick={handlePlaceBid} disabled={submitting}>
                      {submitting ? "Placing Bid..." : "Place Bid"}
                    </Button>
                  </CardContent>
                </Card>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Artwork Details</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">{artwork?.description}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{artwork?.creationYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Dimensions</p>
                    <p className="font-medium">{artwork?.dimensions}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-medium">{artwork?.condition}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reserve Price</p>
                    <p className="font-medium">${auction.reservePrice?.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Auction Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Starts</span>
                    <span>{new Date(auction.startTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ends</span>
                    <span>{new Date(auction.endTime).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Minimum Increment</span>
                    <span>${auction.minimumIncrement?.toLocaleString() || "50"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
