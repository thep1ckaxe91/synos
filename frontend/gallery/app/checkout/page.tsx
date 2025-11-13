"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, MapPin, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phoneNumber: "",
  })

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    } else if (user) {
      setFormData({
        fullName: user.fullName || "",
        email: user.email || "",
        address: user.address || "",
        city: "",
        zipCode: "",
        phoneNumber: user.phoneNumber || "",
      })
    }

    if (items.length === 0 && !authLoading) {
      router.push("/cart")
    }
  }, [user, isAuthenticated, authLoading, items.length])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const orderItems = items.map((item) => ({
        artworkId: item.artworkId,
        quantity: item.quantity,
      }))

      await apiClient.placeOrder(orderItems)

      toast({
        title: "Order placed successfully!",
        description: "Thank you for your purchase.",
      })

      clearCart()
      router.push("/orders")
    } catch (error) {
      toast({
        title: "Order failed",
        description: "Please try again",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || !isAuthenticated || items.length === 0) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <section className="bg-muted/30 py-16">
          <div className="container px-4">
            <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">Checkout</h1>
            <p className="text-lg text-muted-foreground">Complete your purchase</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4 max-w-5xl">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Checkout Form */}
                <div className="lg:col-span-2 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Contact Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="fullName">Full Name</Label>
                          <Input
                            id="fullName"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                          required
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" />
                        Shipping Address
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="address">Street Address</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={formData.city}
                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Payment will be processed securely through our payment gateway.
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Order Summary */}
                <div>
                  <Card className="sticky top-24">
                    <CardHeader>
                      <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        {items.map((item) => (
                          <div key={item.artworkId} className="flex justify-between text-sm">
                            <span className="line-clamp-1">
                              {item.title} x{item.quantity}
                            </span>
                            <span className="font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-medium">${totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Shipping</span>
                          <span className="font-medium">Free</span>
                        </div>
                      </div>

                      <Separator />

                      <div className="flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="text-2xl font-bold">${totalPrice.toLocaleString()}</span>
                      </div>

                      <Button type="submit" size="lg" className="w-full" disabled={loading}>
                        {loading ? "Processing..." : "Place Order"}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        By placing your order, you agree to our terms and conditions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </form>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
