"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api"
import { ArrowLeft, Calendar, Clock, DollarSign, Gavel } from 'lucide-react'
import type { SellerArtworkDto, CreateAuctionDto } from "@/lib/types"

export default function CreateAuctionPage() {
  const router = useRouter()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [artworks, setArtworks] = useState<SellerArtworkDto[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<CreateAuctionDto>({
    artworkId: 0,
    startTime: "",
    endTime: "",
    startingPrice: 0,
    reservePrice: undefined,
    minimumIncrement: 50,
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, authLoading, router])

  useEffect(() => {
    if (isAuthenticated && user?.role === "Seller") {
      loadArtworks()
    }
  }, [isAuthenticated, user])

  const loadArtworks = async () => {
    try {
      const [artworksData, auctionsData] = await Promise.all([
        apiClient.getSellerArtworks(),
        apiClient.getSellerAuctions()
      ])
      
      const artworkIdsWithAuctions = auctionsData
        .filter(auction => {
          const isActiveAuction = auction.status === "Running" || auction.status === "Scheduled"
          console.log(`Auction ${auction.id} for artwork ${auction.artworkId}: status=${auction.status}, isActive=${isActiveAuction}`)
          return isActiveAuction
        })
        .map(auction => auction.artworkId)

      const availableForAuction = artworksData.filter(
        (artwork) => {
          const isAvailable = artwork.status === "Available"
          const isForAuction = artwork.saleType === "Auction"
          const hasNoExistingAuction = !artworkIdsWithAuctions.some(id => 
            Number(id) === Number(artwork.id)
          )
          
          console.log(`Artwork ${artwork.id} (${artwork.title}):`, {
            isAvailable,
            isForAuction,
            hasNoExistingAuction,
            included: isAvailable && isForAuction && hasNoExistingAuction
          })
          
          return isAvailable && isForAuction && hasNoExistingAuction
        }
      )
      
      console.log("Final filtered artworks:", availableForAuction)
      setArtworks(availableForAuction)
    } catch (error) {
      console.error("Failed to load artworks:", error)
      toast({
        title: "Error",
        description: "Failed to load your artworks",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.artworkId) {
      toast({
        title: "Validation Error",
        description: "Please select an artwork for the auction",
        variant: "destructive",
      })
      return
    }

    if (!formData.startTime || !formData.endTime) {
      toast({
        title: "Validation Error",
        description: "Please set both start and end times for the auction",
        variant: "destructive",
      })
      return
    }

    const startTime = new Date(formData.startTime)
    const endTime = new Date(formData.endTime)
    const now = new Date()

    if (startTime <= now) {
      toast({
        title: "Validation Error",
        description: "Start time must be in the future",
        variant: "destructive",
      })
      return
    }

    if (endTime <= startTime) {
      toast({
        title: "Validation Error",
        description: "End time must be after start time",
        variant: "destructive",
      })
      return
    }

    if (formData.startingPrice <= 0) {
      toast({
        title: "Validation Error",
        description: "Starting price must be greater than 0",
        variant: "destructive",
      })
      return
    }

    if (formData.reservePrice && formData.reservePrice <= formData.startingPrice) {
      toast({
        title: "Validation Error", 
        description: "Reserve price must be higher than starting price",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      await apiClient.createAuction(formData)
      toast({
        title: "Success",
        description: "Auction created successfully",
      })
      router.push("/seller/auctions")
    } catch (error) {
      console.error("Failed to create auction:", error)
      toast({
        title: "Error",
        description: "Failed to create auction. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  // Helper function to format datetime-local input value
  const formatDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  // Set default start time to 1 hour from now, end time to 7 days from start
  useEffect(() => {
    const now = new Date()
    const defaultStart = new Date(now.getTime() + 60 * 60 * 1000) // 1 hour from now
    const defaultEnd = new Date(defaultStart.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from start
    
    setFormData(prev => ({
      ...prev,
      startTime: formatDateTimeLocal(defaultStart),
      endTime: formatDateTimeLocal(defaultEnd),
    }))
  }, [])

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
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Auctions
            </Button>
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Create New Auction</h1>
            <p className="text-muted-foreground">Set up an auction for one of your artworks</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 max-w-2xl">
            {artworks.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Gavel className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h2 className="text-2xl font-semibold mb-2">No Artworks Available for Auction</h2>
                  <p className="text-muted-foreground mb-6">
                    To create an auction, you need artworks that are:
                    <br />• Set for "Auction" sale type
                    <br />• Available status (not sold or in auction)
                    <br />• Not already having an active/scheduled auction
                    <br /><br />
                    Upload new artworks or check your existing ones.
                  </p>
                  <Button asChild>
                    <a href="/seller/artworks/new">Upload Artwork for Auction</a>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Gavel className="h-5 w-5" />
                      Auction Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="artwork">Select Artwork</Label>
                      <Select 
                        value={formData.artworkId.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, artworkId: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an artwork to auction" />
                        </SelectTrigger>
                        <SelectContent>
                          {artworks.map((artwork) => (
                            <SelectItem key={artwork.id} value={artwork.id.toString()}>
                              {artwork.title} - ${artwork.price.toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime" className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Start Time
                        </Label>
                        <Input
                          id="startTime"
                          type="datetime-local"
                          value={formData.startTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                          min={formatDateTimeLocal(new Date())}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="endTime" className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          End Time
                        </Label>
                        <Input
                          id="endTime"
                          type="datetime-local"
                          value={formData.endTime}
                          onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                          min={formData.startTime}
                          required
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Pricing
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startingPrice">Starting Price (USD)</Label>
                        <Input
                          id="startingPrice"
                          type="number"
                          min="1"
                          step="0.01"
                          value={formData.startingPrice}
                          onChange={(e) => setFormData(prev => ({ ...prev, startingPrice: parseFloat(e.target.value) || 0 }))}
                          placeholder="100.00"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="reservePrice">Reserve Price (USD) - Optional</Label>
                        <Input
                          id="reservePrice"
                          type="number"
                          min="1"
                          step="0.01"
                          value={formData.reservePrice || ""}
                          onChange={(e) => setFormData(prev => ({ 
                            ...prev, 
                            reservePrice: e.target.value ? parseFloat(e.target.value) : undefined 
                          }))}
                          placeholder="500.00"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Minimum price you're willing to accept
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="minimumIncrement">Minimum Bid Increment (USD)</Label>
                      <Input
                        id="minimumIncrement"
                        type="number"
                        min="1"
                        step="0.01"
                        value={formData.minimumIncrement}
                        onChange={(e) => setFormData(prev => ({ ...prev, minimumIncrement: parseFloat(e.target.value) || 50 }))}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Minimum amount each bid must increase by
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting} className="flex-1">
                    {submitting ? "Creating Auction..." : "Create Auction"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}