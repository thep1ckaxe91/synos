"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/contexts/cart-context"

export default function ArtworkDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { toast } = useToast()
  const { addItem } = useCart()
  const [artwork, setArtwork] = useState<any>(null)
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([])
  const [isFavorite, setIsFavorite] = useState(false)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    loadArtwork()
  }, [params.id])

  const loadArtwork = async () => {
    try {
      const artworkId = Number.parseInt(params.id as string)
      const [artworkData, relatedData] = await Promise.all([
        apiClient.getArtworkDetails(artworkId),
        apiClient.request<any[]>(`/guest/artworks/${artworkId}/related?count=4`, { method: "GET" }),
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

    addItem({
      artworkId: artwork.id,
      title: artwork.title,
      artistName: artwork.seller?.fullName || artwork.artistName,
      price: artwork.price,
      currency: artwork.currency,
      primaryImage: artwork.artworkImages?.[0]?.imageUrl || artwork.primaryImage,
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

  const images = artwork.artworkImages || []
  const displayImages = images.length > 0 ? images : [{ imageUrl: artwork.primaryImage, isPrimary: true }]

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
                <Image
                  src={displayImages[selectedImage]?.imageUrl || "/placeholder.svg?height=800&width=800"}
                  alt={artwork.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {displayImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {displayImages.map((image: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square relative overflow-hidden rounded-md bg-muted ${
                        selectedImage === index ? "ring-2 ring-accent" : ""
                      }`}
                    >
                      <Image
                        src={image.imageUrl || "/placeholder.svg?height=200&width=200"}
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
                <p className="text-xl text-muted-foreground mb-4">{artwork.seller?.fullName || artwork.artistName}</p>
                <div className="flex items-center gap-4">
                  <span className="text-3xl font-bold">
                    {artwork.currency} {artwork.price?.toLocaleString()}
                  </span>
                  <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                    {artwork.saleType}
                  </span>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Year</p>
                  <p className="font-medium">{artwork.creationYear}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Dimensions</p>
                  <p className="font-medium">{artwork.dimensions}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Condition</p>
                  <p className="font-medium">{artwork.condition}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <p className="font-medium">{artwork.categoryName}</p>
                </div>
              </div>

              <Separator />

              <div className="flex gap-3">
                {artwork.saleType === "FixedPrice" && artwork.status === "Available" && (
                  <Button size="lg" onClick={handleAddToCart} className="flex-1">
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    Add to Cart
                  </Button>
                )}
                {artwork.saleType === "Auction" && artwork.status === "Available" && (
                  <Button size="lg" asChild className="flex-1">
                    <Link href={`/auctions/${artwork.id}`}>View Auction</Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" onClick={handleToggleFavorite}>
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-current" : ""}`} />
                </Button>
                <Button size="lg" variant="outline">
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>

              {artwork.seller && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3">About the Artist</h3>
                    <div className="flex items-start gap-4">
                      <div className="h-16 w-16 rounded-full bg-muted shrink-0" />
                      <div>
                        <p className="font-medium">{artwork.seller.fullName}</p>
                        {artwork.seller.bio && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{artwork.seller.bio}</p>
                        )}
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
                {relatedArtworks.map((related) => (
                  <Link key={related.id} href={`/artworks/${related.id}`}>
                    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        <Image
                          src={related.primaryImage || "/placeholder.svg?height=400&width=400"}
                          alt={related.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1 group-hover:text-accent transition-colors line-clamp-1">
                          {related.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{related.artistName}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
