"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from 'next/navigation'
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, ArrowLeft, Share2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"
import { getImageUrl, formatPrice } from "@/lib/utils"
import type { GuestArtworkDetailDto } from "@/lib/types"

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const { addItem } = useCart()
  const [artwork, setArtwork] = useState<GuestArtworkDetailDto | null>(null)
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  const isSeller = user?.role === 'Seller'

  useEffect(() => {
    loadArtwork()
  }, [params.id])

  const loadArtwork = async () => {
    try {
      const artworkId = Number.parseInt(params.id as string)
      const [artworkData, relatedData] = await Promise.all([
        apiClient.getArtworkDetails(artworkId),
        apiClient.getRelatedArtworks(artworkId, 4),
      ])
      
      setArtwork(artworkData)
      setRelatedArtworks(relatedData)

      if (isAuthenticated) {
        const favoriteCheck = await apiClient.checkFavorite(artworkId)
        setIsFavorite(favoriteCheck.isFavorite)
      }
    } catch (error) {
      console.error("Failed to load artwork:", error)
      toast({
        title: "Error",
        description: "Failed to load artwork details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!artwork) return

    try {
      if (isFavorite) {
        await apiClient.removeFromFavorites(artwork.id)
        setIsFavorite(false)
        toast({ title: "Removed from favorites" })
      } else {
        await apiClient.addToFavorites(artwork.id)
        setIsFavorite(true)
        toast({ title: "Added to favorites" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive",
      })
    }
  }

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (!artwork) return

    const primaryImage = artwork.images && artwork.images.length > 0 
      ? artwork.images.find(img => img.isPrimary)?.imageUrl || artwork.images[0].imageUrl
      : undefined

    addItem({
      artworkId: artwork.id,
      title: artwork.title,
      artistName: artwork.sellerName,
      price: artwork.price || 0,
      currency: "USD",
      primaryImage: getImageUrl(primaryImage),
    })

    toast({ title: "Added to cart" })
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
              <div className="h-6 bg-muted animate-pulse rounded w-1/2" />
              <div className="h-24 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!artwork) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container px-4 py-12 text-center">
          <p className="text-muted-foreground">Artwork not found</p>
        </main>
        <Footer />
      </div>
    )
  }

  const displayImages = artwork.images && artwork.images.length > 0 
    ? artwork.images 
    : []

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <div className="container px-4 py-8">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-square relative overflow-hidden rounded-lg bg-muted">
                {displayImages.length > 0 ? (
                  <Image
                    src={getImageUrl(displayImages[selectedImage]?.imageUrl) || "/placeholder.svg"}
                    alt={artwork.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No image available
                  </div>
                )}
              </div>
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative overflow-hidden rounded-md bg-muted ${
                        selectedImage === index ? "ring-2 ring-primary" : ""
                      }`}
                    >
                      <Image
                        src={getImageUrl(image.imageUrl) || "/placeholder.svg"}
                        alt={`${artwork.title} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Artwork Details */}
            <div className="space-y-6">
              <div>
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">{artwork.title}</h1>
                <p className="text-xl text-muted-foreground mb-4">{artwork.sellerName}</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">
                    {formatPrice(artwork.price, "USD")}
                  </span>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    {artwork.artworkFor === "Fixed" ? "Fixed Price" : "Auction"}
                  </span>
                </div>
              </div>

              <Separator />

              {artwork.description && (
                <>
                  <div>
                    <h3 className="font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
                  </div>
                  <Separator />
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                {artwork.creationYear && (
                  <div>
                    <p className="text-sm text-muted-foreground">Year</p>
                    <p className="font-medium">{artwork.creationYear}</p>
                  </div>
                )}
                {artwork.dimensions && (
                  <div>
                    <p className="text-sm text-muted-foreground">Dimensions</p>
                    <p className="font-medium">{artwork.dimensions}</p>
                  </div>
                )}
                {artwork.condition && (
                  <div>
                    <p className="text-sm text-muted-foreground">Condition</p>
                    <p className="font-medium">{artwork.condition}</p>
                  </div>
                )}
                {artwork.categoryName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{artwork.categoryName}</p>
                  </div>
                )}
                {artwork.material && (
                  <div>
                    <p className="text-sm text-muted-foreground">Material</p>
                    <p className="font-medium">{artwork.material}</p>
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex gap-3">
                {artwork.artworkFor === "Fixed" && artwork.status === "Available" && (
                  <>
                    {!isSeller ? (
                      <Button size="lg" onClick={handleAddToCart} className="flex-1">
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Add to Cart
                      </Button>
                    ) : (
                      <div className="flex-1 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground text-center">
                          Sellers cannot purchase artworks
                        </p>
                      </div>
                    )}
                  </>
                )}
                {artwork.artworkFor === "Auction" && artwork.status === "Available" && (
                  <>
                    {!isSeller ? (
                      <Button size="lg" asChild className="flex-1">
                        <Link href={`/auctions/${artwork.id}`}>View Auction</Link>
                      </Button>
                    ) : (
                      <div className="flex-1 p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground text-center">
                          Sellers cannot participate in auctions
                        </p>
                      </div>
                    )}
                  </>
                )}
                <Button size="lg" variant="outline" onClick={handleToggleFavorite}>
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {artwork.auctionDetails && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">Auction Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Starting Price:</span>
                        <span className="font-medium">{formatPrice(artwork.auctionDetails.startingPrice, "USD")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Current Bid:</span>
                        <span className="font-medium">
                          {artwork.auctionDetails.currentHighestBid 
                            ? formatPrice(artwork.auctionDetails.currentHighestBid, "USD")
                            : "No bids yet"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Bids:</span>
                        <span className="font-medium">{artwork.auctionDetails.bidCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span className="font-medium">{artwork.auctionDetails.status}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {artwork.sellerBio && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">About the Artist</h3>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted shrink-0" />
                      <div>
                        <p className="font-medium">{artwork.sellerName}</p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{artwork.sellerBio}</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Related Artworks */}
          {relatedArtworks.length > 0 && (
            <section className="mt-20">
              <h2 className="font-serif text-3xl font-bold mb-8">Related Artworks</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedArtworks.map((related) => {
                  const relatedImage = related.images && related.images.length > 0
                    ? related.images.find((img: any) => img.isPrimary)?.imageUrl || related.images[0].imageUrl
                    : undefined

                  return (
                    <Link key={related.id} href={`/artworks/${related.id}`}>
                      <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                        <div className="aspect-square relative overflow-hidden bg-muted">
                          <Image
                            src={getImageUrl(relatedImage) || "/placeholder.svg"}
                            alt={related.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-medium mb-1 group-hover:text-accent transition-colors line-clamp-1">
                            {related.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">{related.sellerName}</p>
                          <p className="text-sm font-semibold">{formatPrice(related.price, "USD")}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
