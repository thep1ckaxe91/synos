"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import { getImageUrl } from "@/lib/utils"
import type { SalesHistoryDto } from "@/lib/types"

export default function SellerSalesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [sales, setSales] = useState<SalesHistoryDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated && user?.role === "Seller") {
      loadSales()
    }
  }, [isAuthenticated, user])

  const loadSales = async () => {
    try {
      const data = await apiClient.getSalesHistory()
      setSales(data)
    } catch (error) {
      console.error("Failed to load sales history:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + sale.payoutAmount, 0)
  const totalCommission = sales.reduce((sum, sale) => sum + sale.commissionAmount, 0)

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
            <h1 className="font-serif text-4xl md:text-5xl font-bold mb-2">Sales History</h1>
            <p className="text-muted-foreground">Track your earnings and commission details</p>
          </div>
        </section>

        <section className="py-12">
          <div className="container px-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sales.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">After commission</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${totalCommission.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Platform fees</p>
                </CardContent>
              </Card>
            </div>

            {/* Sales List */}
            <Card>
              <CardHeader>
                <CardTitle>Sales History</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <p className="text-muted-foreground">Loading sales history...</p>
                ) : sales.length === 0 ? (
                  <p className="text-muted-foreground">No sales yet.</p>
                ) : (
                  <div className="space-y-4">
                    {sales.map((sale) => (
                      <div key={sale.orderId} className="flex gap-4 pb-4 border-b last:border-0">
                        <div className="w-20 h-20 relative rounded-lg overflow-hidden bg-muted shrink-0">
                          {sale.primaryImage && (
                            <Image
                              src={getImageUrl(sale.primaryImage) || "/placeholder.svg"}
                              alt={sale.artworkTitle}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium mb-1">{sale.artworkTitle}</h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            Sold to {sale.buyerName} • {new Date(sale.soldAt).toLocaleDateString()}
                          </p>
                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Sale Price:</span>
                              <span className="font-medium ml-1">${sale.salePrice.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Commission:</span>
                              <span className="font-medium ml-1">${sale.commissionAmount.toLocaleString()}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Payout:</span>
                              <span className="font-semibold text-green-600 ml-1">
                                ${sale.payoutAmount.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
