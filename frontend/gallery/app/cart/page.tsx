"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Trash2, ShoppingBag, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { Separator } from "@/components/ui/separator"

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, totalPrice, clearCart } = useCart()
  const { isAuthenticated } = useAuth()

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    router.push("/checkout")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Shopping Cart</h1>
            <p className="text-lg text-muted-foreground">
              {items.length} {items.length === 1 ? "item" : "items"} in your cart
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {items.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="font-serif text-2xl font-semibold mb-2">Your cart is empty</h3>
                  <p className="text-muted-foreground text-center mb-6">Start shopping and add artworks to your cart</p>
                  <Button asChild>
                    <Link href="/artworks">Browse Artworks</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                  {items.map((item) => (
                    <Card key={item.artworkId}>
                      <CardContent className="p-6">
                        <div className="flex gap-4">
                          <Link href={`/artworks/${item.artworkId}`}>
                            <div className="h-24 w-24 relative overflow-hidden rounded-md bg-muted shrink-0">
                              <Image
                                src={item.primaryImage || "/placeholder.svg?height=96&width=96"}
                                alt={item.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>

                          <div className="flex-1">
                            <Link href={`/artworks/${item.artworkId}`}>
                              <h3 className="font-serif text-lg font-semibold hover:text-accent transition-colors">
                                {item.title}
                              </h3>
                            </Link>
                            <p className="text-sm text-muted-foreground mb-3">{item.artistName}</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 bg-transparent"
                                  onClick={() => updateQuantity(item.artworkId, item.quantity - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="w-8 text-center font-medium">{item.quantity}</span>
                                <Button
                                  size="icon"
                                  variant="outline"
                                  className="h-8 w-8 bg-transparent"
                                  onClick={() => updateQuantity(item.artworkId, item.quantity + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>

                              <div className="text-right">
                                <p className="font-semibold">
                                  {item.currency} {(item.price * item.quantity).toLocaleString()}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {item.currency} {item.price.toLocaleString()} each
                                </p>
                              </div>
                            </div>
                          </div>

                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive hover:text-destructive shrink-0"
                            onClick={() => removeItem(item.artworkId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button variant="outline" onClick={clearCart} className="w-full bg-transparent">
                    Clear Cart
                  </Button>
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="sticky top-24">
                    <CardContent className="p-6">
                      <h3 className="font-serif text-xl font-semibold mb-4">Order Summary</h3>

                      <div className="space-y-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">${totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-medium">Free</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Tax</span>
                          <span className="font-medium">Calculated at checkout</span>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="flex justify-between mb-6">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold">${totalPrice.toLocaleString()}</span>
                      </div>

                      <Button size="lg" className="w-full" onClick={handleCheckout}>
                        Proceed to Checkout
                      </Button>

                      <Button variant="outline" size="lg" className="w-full mt-3 bg-transparent" asChild>
                        <Link href="/artworks">Continue Shopping</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
