"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Filter, Grid3x3, LayoutGrid, ShoppingCart } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { getImageUrl, formatPrice } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from 'next/navigation'

export default function ArtworksPage() {
  const [artworks, setArtworks] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [gridView, setGridView] = useState<"grid" | "masonry">("grid")
  const { addItem } = useCart()
  const { isAuthenticated, user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadArtworks()
  }, [selectedCategory])

  const loadData = async () => {
    try {
      const [artworksData, categoriesData] = await Promise.all([
        apiClient.getArtworks(0, 50),
        apiClient.getCategories(),
      ])
      setArtworks(artworksData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadArtworks = async () => {
    try {
      setLoading(true)
      if (selectedCategory === "all") {
        const data = await apiClient.getArtworks(0, 50)
        setArtworks(data)
      } else {
        const data = await apiClient.getArtworksByCategory(Number.parseInt(selectedCategory), 0, 50)
        setArtworks(data)
      }
    } catch (error) {
      console.error("Failed to load artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredArtworks = artworks
    .filter((artwork) => {
      if (priceRange[0] === 0 && priceRange[1] === 10000) return true
      return artwork.price >= priceRange[0] && artwork.price <= priceRange[1]
    })
    .sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price
      if (sortBy === "price-high") return b.price - a.price
      if (sortBy === "title") return a.title.localeCompare(b.title)
      return 0
    })

  const handleAddToCart = (artwork: any, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user?.role === 'Seller') {
      toast({
        title: "Not available",
        description: "Sellers cannot purchase artworks. Switch to a buyer account to make purchases.",
        variant: "destructive",
      })
      return
    }

    if (artwork.saleType !== "FixedPrice" && artwork.artworkFor !== "Fixed") {
      toast({
        title: "Not available",
        description: "This artwork is only available through auction",
        variant: "destructive",
      })
      return
    }

    addItem({
      artworkId: artwork.id,
      title: artwork.title,
      artistName: artwork.sellerName || artwork.artistName,
      price: artwork.price,
      currency: artwork.currency || "USD", // default to USD instead of VND
      primaryImage: getImageUrl(artwork.images?.[0]?.imageUrl || artwork.primaryImage),
    })

    toast({ title: "Added to cart" })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Browse Artworks</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Explore our curated collection of contemporary art from talented artists around the world.
            </p>
          </div>
        </section>

        {/* Filters and Grid */}
        <section className="py-12">
          <div className="container px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Sidebar Filters - Desktop */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24 space-y-6">
                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Category</Label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                          selectedCategory === "all" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                        }`}
                      >
                        All Artworks
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          onClick={() => setSelectedCategory(category.id.toString())}
                          className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                            selectedCategory === category.id.toString()
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-semibold mb-3 block">Price Range</Label>
                    <Slider value={priceRange} onValueChange={setPriceRange} max={10000} step={100} className="mb-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </aside>

              {/* Main Content */}
              <div className="flex-1">
                {/* Toolbar */}
                <div className="flex items-center justify-between mb-6 gap-4">
                  <div className="flex items-center gap-2">
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="lg:hidden bg-transparent">
                          <Filter className="h-4 w-4 mr-2" />
                          Filters
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="left">
                        <SheetHeader>
                          <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                          <div>
                            <Label className="text-sm font-semibold mb-3 block">Category</Label>
                            <div className="space-y-2">
                              <button
                                onClick={() => setSelectedCategory("all")}
                                className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                  selectedCategory === "all" ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                                }`}
                              >
                                All Artworks
                              </button>
                              {categories.map((category) => (
                                <button
                                  key={category.id}
                                  onClick={() => setSelectedCategory(category.id.toString())}
                                  className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                    selectedCategory === category.id.toString()
                                      ? "bg-accent text-accent-foreground"
                                      : "hover:bg-muted"
                                  }`}
                                >
                                  {category.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div>
                            <Label className="text-sm font-semibold mb-3 block">Price Range</Label>
                            <Slider
                              value={priceRange}
                              onValueChange={setPriceRange}
                              max={10000}
                              step={100}
                              className="mb-2"
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>${priceRange[0]}</span>
                              <span>${priceRange[1]}</span>
                            </div>
                          </div>
                        </div>
                      </SheetContent>
                    </Sheet>

                    <span className="text-sm text-muted-foreground">
                      {filteredArtworks.length} {filteredArtworks.length === 1 ? "artwork" : "artworks"}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="recent">Recently Added</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="title">Title: A to Z</SelectItem>
                      </SelectContent>
                    </Select>

                    <div className="hidden sm:flex items-center gap-1 border border-border rounded-md">
                      <Button
                        variant={gridView === "grid" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setGridView("grid")}
                      >
                        <Grid3x3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={gridView === "masonry" ? "secondary" : "ghost"}
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => setGridView("masonry")}
                      >
                        <LayoutGrid className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Artworks Grid */}
                {loading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(9)].map((_, i) => (
                      <Card key={i} className="overflow-hidden">
                        <div className="aspect-[3/4] bg-muted animate-pulse" />
                        <CardContent className="p-4">
                          <div className="h-5 bg-muted animate-pulse rounded mb-2" />
                          <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : filteredArtworks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No artworks found matching your criteria.</p>
                  </div>
                ) : (
                  <div
                    className={`grid gap-6 ${
                      gridView === "grid"
                        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                  >
                    {filteredArtworks.map((artwork) => (
                      <Link key={artwork.id} href={`/artworks/${artwork.id}`}>
                        <Card className="overflow-hidden group hover:shadow-lg transition-shadow duration-300">
                          <div
                            className={`relative overflow-hidden bg-muted ${
                              gridView === "grid" ? "aspect-[3/4]" : "aspect-square"
                            }`}
                          >
                            <Image
                              src={getImageUrl(artwork.images?.[0]?.imageUrl || artwork.primaryImage)}
                              alt={artwork.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-1 group-hover:text-accent transition-colors line-clamp-1">
                              {artwork.title}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">{artwork.sellerName || artwork.artistName}</p>
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-semibold">
                                {formatPrice(artwork.price, artwork.currency || "USD")} {/* default to USD */}
                              </span>
                              <span className="text-xs text-muted-foreground uppercase">
                                {artwork.saleType || artwork.artworkFor}
                              </span>
                            </div>
                            {(artwork.saleType === "FixedPrice" || artwork.artworkFor === "Fixed") && artwork.status === "Available" && user?.role !== 'Seller' && (
                              <Button
                                size="sm"
                                className="w-full"
                                onClick={(e) => handleAddToCart(artwork, e)}
                              >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Add to Cart
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
