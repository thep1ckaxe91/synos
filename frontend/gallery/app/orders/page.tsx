"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Package } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { apiClient } from "@/lib/api"
import { useAuth } from "@/contexts/auth-context"
import { Separator } from "@/components/ui/separator"

export default function OrdersPage() {
  const router = useRouter()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    } else if (isAuthenticated) {
      loadOrders()
    }
  }, [isAuthenticated, authLoading])

  const loadOrders = async () => {
    try {
      const data = await apiClient.getPurchaseHistory()
      setOrders(data)
    } catch (error) {
      console.error("Failed to load orders:", error)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">My Orders</h1>
            <p className="text-lg text-muted-foreground">Track your purchases and order history</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 max-w-4xl">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <div className="h-6 bg-muted animate-pulse rounded" />
                    </CardHeader>
                    <CardContent>
                      <div className="h-20 bg-muted animate-pulse rounded" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-serif text-2xl font-semibold mb-2">No orders yet</h3>
                  <p className="text-muted-foreground text-center mb-6">
                    Start shopping and your orders will appear here
                  </p>
                  <Link href="/artworks">
                    <button className="px-6 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition">
                      Browse Artworks
                    </button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">Order #{order.id}</CardTitle>
                        <Badge>{order.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {order.items?.map((item: any) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="h-20 w-20 relative overflow-hidden rounded-md bg-muted shrink-0">
                              <Image
                                src={item.artwork?.primaryImage || "/placeholder.svg?height=80&width=80"}
                                alt={item.artwork?.title || "Artwork"}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{item.artwork?.title}</h4>
                              <p className="text-sm text-muted-foreground">{item.artwork?.artistName}</p>
                              <p className="text-sm font-semibold mt-1">${item.price?.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total</span>
                          <span className="text-xl font-bold">${order.totalAmount?.toLocaleString()}</span>
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
