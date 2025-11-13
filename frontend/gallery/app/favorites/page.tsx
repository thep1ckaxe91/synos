"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Heart, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function FavoritesPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated) {
      loadFavorites()
    }
  }, [isAuthenticated, authLoading])

  const loadFavorites = async () => {
    try {
      const data = await apiClient.getFavorites()
      setFavorites(data)
    } catch (error) {
      console.error("Failed to load favorites:", error)
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveFavorite = async (artworkId: number) => {
    try {
      await apiClient.removeFromFavorites(artworkId)
      setFavorites(favorites.filter((fav) => fav.artworkId !== artworkId))
      toast({ title: "Removed from favorites" })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      })
    }
  }

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">My Favorites</h1>
            <p className="text-lg text-muted-foreground">Artworks you've saved for later</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
            ) : favorites.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-serif text-2xl font-semibold mb-2">No favorites yet</h3>
                <p className="text-muted-foreground mb-6">Start exploring and save artworks you love</p>
                <Button asChild>
                  <Link href="/artworks">Browse Artworks</Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((favorite) => (
                  <Card
                    key={favorite.artworkId}
                    className="overflow-hidden group hover:shadow-lg transition-shadow duration-300"
                  >
                    <Link href={`/artworks/${favorite.artworkId}`}>
                      <div className="aspect-square relative overflow-hidden bg-muted">
                        <Image
                          src={favorite.artwork?.primaryImage || "/placeholder.svg?height=400&width=400"}
                          alt={favorite.artwork?.title || "Artwork"}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </Link>
                    <CardContent className="p-4">
                      <Link href={`/artworks/${favorite.artworkId}`}>
                        <h3 className="font-medium mb-1 group-hover:text-accent transition-colors line-clamp-1">
                          {favorite.artwork?.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-3">{favorite.artwork?.artistName}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">
                          {favorite.artwork?.currency} {favorite.artwork?.price?.toLocaleString()}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleRemoveFavorite(favorite.artworkId)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
