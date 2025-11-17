"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"
import { Plus } from 'lucide-react'
import type { SellerArtworkDto } from "@/lib/types"

export default function SellerArtworksPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [artworks, setArtworks] = useState<SellerArtworkDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user?.role === "Seller") {
      loadArtworks()
    }
  }, [isAuthenticated, user])

  const loadArtworks = async () => {
    try {
      const data = await apiClient.getSellerArtworks()
      setArtworks(data)
    } catch (error) {
      console.error("Failed to load artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== "Seller") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <p>You need to be a seller to access this page.</p>
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
                <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">My Artworks</h1>
                <p className="text-muted-foreground">Manage all your uploaded artworks</p>
              </div>
              <Button asChild>
                <Link href="/seller/artworks/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload New
                </Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="aspect-square bg-muted animate-pulse" />
                    <CardContent className="p-4">
                      <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : artworks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't uploaded any artworks yet.</p>
                <Button asChild>
                  <Link href="/seller/artworks/new">Upload Your First Artwork</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {artworks.map((artwork) => (
                  <Card key={artwork.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <Image
                        src={getImageUrl(artwork.primaryImage || artwork.images[0]?.imageUrl)}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge
                          variant={
                            artwork.status === "Available"
                              ? "default"
                              : artwork.status === "Pending"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {artwork.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-medium mb-1 line-clamp-1">{artwork.title}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{artwork.categoryName}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">${artwork.price?.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">{artwork.saleType}</span>
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
