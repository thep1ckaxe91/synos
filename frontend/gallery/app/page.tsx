"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, TrendingUp, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"
import type { GuestArtworkDto, GuestExhibitionDto } from "@/lib/types"

export default function HomePage() {
  const [featuredArtworks, setFeaturedArtworks] = useState<GuestArtworkDto[]>([])
  const [recentArtworks, setRecentArtworks] = useState<GuestArtworkDto[]>([])
  const [activeExhibitions, setActiveExhibitions] = useState<GuestExhibitionDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      const [statistics, exhibitions] = await Promise.all([apiClient.getStatistics(), apiClient.getActiveExhibitions()])
      setFeaturedArtworks(statistics.featuredArtworks.slice(0, 6))
      setRecentArtworks(statistics.recentArtworks.slice(0, 4))
      setActiveExhibitions(exhibitions.slice(0, 3))
    } catch (error) {
      console.error("Failed to load home data:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center bg-muted/30">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />
          </div>

          <div className="container relative z-10 px-4 text-center">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance mb-6">
              Discover the world's finest art
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 text-balance">
              Connect with contemporary artists and collectors. Browse curated exhibitions, bid on auctions, and build
              your personal collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild className="text-base">
                <Link href="/artworks">
                  Explore Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base bg-transparent">
                <Link href="/auctions">View Auctions</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Featured Artworks */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 text-accent mb-2">
                  <Sparkles className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">Featured</span>
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold">Curated Selections</h2>
              </div>
              <Button variant="ghost" asChild className="hidden sm:flex">
                <Link href="/artworks">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>

            {loading ? (
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredArtworks.map((artwork) => (
                  <Link key={artwork.id} href={`/artworks/${artwork.id}`}>
                    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-[3/4] relative overflow-hidden bg-muted">
                        <Image
                          src={getImageUrl(artwork.images[0]?.imageUrl)}
                          alt={artwork.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                          {artwork.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">{artwork.sellerName}</p>
                        <div className="flex items-center justify-between">
                          <span className="font-semibold">
                            {artwork.price ? `$${artwork.price.toLocaleString()}` : "Contact for price"}
                          </span>
                          <span className="text-xs text-muted-foreground uppercase">{artwork.artworkFor}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            <div className="text-center mt-8 sm:hidden">
              <Button variant="outline" asChild>
                <Link href="/artworks">
                  View All Artworks
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Active Exhibitions */}
        {activeExhibitions.length > 0 && (
          <section className="py-20 bg-muted/30">
            <div className="container px-4">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <div className="flex items-center gap-2 text-accent mb-2">
                    <Calendar className="h-5 w-5" />
                    <span className="text-sm font-medium uppercase tracking-wider">Now Showing</span>
                  </div>
                  <h2 className="font-serif text-4xl md:text-5xl font-bold">Current Exhibitions</h2>
                </div>
                <Button variant="ghost" asChild className="hidden sm:flex">
                  <Link href="/exhibitions">
                    View All
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {activeExhibitions.map((exhibition) => (
                  <Link key={exhibition.id} href={`/exhibitions/${exhibition.id}`}>
                    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-[4/3] relative overflow-hidden bg-muted">
                        <Image
                          src={
                            exhibition.featuredArtworks[0]?.images[0]?.imageUrl ||
                            "/placeholder.svg?height=400&width=600&query=art exhibition" ||
                            "/placeholder.svg"
                          }
                          alt={exhibition.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-serif text-xl font-semibold mb-2 group-hover:text-accent transition-colors">
                          {exhibition.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{exhibition.description}</p>
                        <div className="text-xs text-muted-foreground">
                          {exhibition.startDate && exhibition.endDate ? (
                            <>
                              {new Date(exhibition.startDate).toLocaleDateString()} -{" "}
                              {new Date(exhibition.endDate).toLocaleDateString()}
                            </>
                          ) : (
                            <span className="uppercase font-medium">{exhibition.status}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Recent Additions */}
        <section className="py-20 bg-background">
          <div className="container px-4">
            <div className="flex items-center justify-between mb-12">
              <div>
                <div className="flex items-center gap-2 text-accent mb-2">
                  <TrendingUp className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wider">New Arrivals</span>
                </div>
                <h2 className="font-serif text-4xl md:text-5xl font-bold">Recently Added</h2>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recentArtworks.map((artwork) => (
                  <Link key={artwork.id} href={`/artworks/${artwork.id}`}>
                    <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        <Image
                          src={getImageUrl(artwork.images[0]?.imageUrl)}
                          alt={artwork.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-medium mb-1 group-hover:text-accent transition-colors line-clamp-1">
                          {artwork.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{artwork.sellerName}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-accent text-accent-foreground">
          <div className="container px-4 text-center">
            <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6 text-balance">
              Start your art collection today
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-balance opacity-90">
              Join thousands of collectors and art enthusiasts. Browse exclusive works, participate in auctions, and
              discover emerging artists.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild className="text-base">
                <Link href="/register">Create Account</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base border-accent-foreground/20 hover:bg-accent-foreground/10 bg-transparent"
              >
                <Link href="/artworks">Browse Gallery</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
