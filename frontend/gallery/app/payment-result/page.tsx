"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function PaymentResultPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"processing" | "success" | "failed">("processing")

  useEffect(() => {
    const vnpResponseCode = searchParams.get("vnp_ResponseCode")
    const vnpTransactionStatus = searchParams.get("vnp_TransactionStatus")

    // VNPay response codes: 00 = success, others = failed
    if (vnpResponseCode === "00" || vnpTransactionStatus === "00") {
      setStatus("success")
    } else if (vnpResponseCode || vnpTransactionStatus) {
      setStatus("failed")
    }
  }, [searchParams])

  const vnpAmount = searchParams.get("vnp_Amount")
  const vnpOrderInfo = searchParams.get("vnp_OrderInfo")
  const vnpTxnRef = searchParams.get("vnp_TxnRef")
  const vnpTransactionNo = searchParams.get("vnp_TransactionNo")
  const vnpBankCode = searchParams.get("vnp_BankCode")

  const amount = vnpAmount ? (Number.parseInt(vnpAmount) / 100).toLocaleString("vi-VN") : "0"

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="mx-auto max-w-2xl">
        {status === "processing" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                Processing Payment
              </CardTitle>
              <CardDescription>Please wait while we verify your payment...</CardDescription>
            </CardHeader>
          </Card>
        )}

        {status === "success" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-6 w-6" />
                Payment Successful
              </CardTitle>
              <CardDescription>Your payment has been processed successfully</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-t pt-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-semibold">{amount} VND</span>
                </div>
                {vnpOrderInfo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Info:</span>
                    <span className="font-medium">{vnpOrderInfo}</span>
                  </div>
                )}
                {vnpTxnRef && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono text-sm">{vnpTxnRef}</span>
                  </div>
                )}
                {vnpTransactionNo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction No:</span>
                    <span className="font-mono text-sm">{vnpTransactionNo}</span>
                  </div>
                )}
                {vnpBankCode && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="font-medium">{vnpBankCode}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link href="/orders">View Orders</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {status === "failed" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <XCircle className="h-6 w-6" />
                Payment Failed
              </CardTitle>
              <CardDescription>Unfortunately, your payment could not be processed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 border-t pt-4">
                {vnpOrderInfo && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order Info:</span>
                    <span className="font-medium">{vnpOrderInfo}</span>
                  </div>
                )}
                {vnpTxnRef && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono text-sm">{vnpTxnRef}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button asChild className="flex-1">
                  <Link href="/cart">Back to Cart</Link>
                </Button>
                <Button asChild variant="outline" className="flex-1 bg-transparent">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
