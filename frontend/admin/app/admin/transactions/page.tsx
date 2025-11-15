"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Search, Check, X, Eye, DollarSign, TrendingUp, Clock, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { apiService } from "@/lib/api-service"
import { Transaction } from "@/lib/types"
import { toast } from "sonner"
import { normalizeTransactionStatus } from "@/lib/constants"

export default function TransactionManagement() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      const response = await apiService.getTransactions({ skip: 0, take: 100 })
      
      let transactionsData: any[] = []
      if (Array.isArray(response)) {
        transactionsData = response
      } else if (response.items && Array.isArray(response.items)) {
        transactionsData = response.items
      } else if (response.data && Array.isArray(response.data)) {
        transactionsData = response.data
      }
      
      const mappedTransactions: Transaction[] = transactionsData.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        userName: item.userName || item.buyerName || 'Unknown',
        userEmail: item.userEmail || item.buyerEmail || '',
        orderNumber: item.orderNumber || '',
        totalAmount: item.totalAmount || 0,
        currency: item.currency || 'USD',
        paymentType: item.paymentType || '',
        paymentTime: item.paymentTime || item.createdAt || '',
        status: normalizeTransactionStatus(item.status),
        createdAt: item.createdAt || item.paymentTime || '',
        updatedAt: item.updatedAt || '',
        deletedAt: item.deletedAt,
        orderItems: item.orderItems || [],
        totalItems: item.totalItems || 0,
        buyerName: item.userName || item.buyerName || 'Unknown',
      }))
      
      setTransactions(mappedTransactions)
    } catch (error) {
      console.error('Failed to load transactions:', error)
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = (transaction: Transaction, action: "approve" | "reject") => {
    setSelectedTransaction(transaction)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  const confirmApproval = async () => {
    if (!selectedTransaction) return
    
    try {
      setActionLoading(true)
      if (approvalAction === "approve") {
        await apiService.approvePurchaseRequest(selectedTransaction.id)
        toast.success('Purchase request approved')
      } else {
        await apiService.rejectPurchaseRequest(selectedTransaction.id)
        toast.success('Purchase request rejected')
      }
      setShowApprovalDialog(false)
      await loadTransactions()
    } catch (error) {
      console.error(`Failed to ${approvalAction} purchase:`, error)
      toast.error(`Failed to ${approvalAction} purchase request`)
    } finally {
      setActionLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    const currencyMap: Record<string, string> = {
      'USD': 'en-US',
      'VND': 'vi-VN',
      'EUR': 'de-DE',
      'JPY': 'ja-JP'
    }
    
    const locale = currencyMap[currency] || 'en-US'
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const pendingTransactions = transactions.filter(t => t.status === 'Pending')
  const completedTransactions = transactions.filter(t => t.status === 'Completed' || t.status === 'Shipped' || t.status === 'Delivered')

  const totalRevenue = completedTransactions.reduce((sum, t) => sum + t.totalAmount, 0)
  const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.totalAmount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading transactions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Transaction Management</h1>
        <p className="text-muted-foreground">Monitor and manage all sales and auction transactions</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-chart-1" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">From completed sales</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(pendingAmount)}</div>
            <p className="text-xs text-muted-foreground">{pendingTransactions.length} purchase requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sales</CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedTransactions.length}</div>
            <p className="text-xs text-muted-foreground">This period</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Purchases ({pendingTransactions.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedTransactions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Purchase Requests</CardTitle>
              <CardDescription>Approve or reject buyer purchase requests</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingTransactions.length > 0 ? (
                    pendingTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium text-foreground">#{transaction.id}</TableCell>
                        <TableCell className="text-muted-foreground">{transaction.buyerName || transaction.userName}</TableCell>
                        <TableCell className="font-medium text-foreground">{formatCurrency(transaction.totalAmount, transaction.currency)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.paymentType}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedTransaction(transaction)
                                setShowDetailsDialog(true)
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-accent hover:text-accent"
                              onClick={() => handleApproval(transaction, "approve")}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleApproval(transaction, "reject")}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No pending purchase requests
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search transactions..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Completed Transactions</CardTitle>
              <CardDescription>All completed sales transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTransactions.length > 0 ? (
                    completedTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell className="font-medium text-foreground">#{transaction.id}</TableCell>
                        <TableCell className="text-muted-foreground">{transaction.buyerName || transaction.userName}</TableCell>
                        <TableCell className="font-medium text-foreground">{formatCurrency(transaction.totalAmount, transaction.currency)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{transaction.paymentType}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{formatDate(transaction.createdAt)}</TableCell>
                        <TableCell>
                          <Badge variant={transaction.status === "Completed" ? "default" : "secondary"}>
                            {transaction.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No completed transactions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvalAction === "approve" ? "Approve" : "Reject"} Purchase Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to {approvalAction} transaction #{selectedTransaction?.id}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              variant={approvalAction === "approve" ? "default" : "destructive"}
              onClick={confirmApproval}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                approvalAction === "approve" ? "Approve" : "Reject"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transaction ID</p>
              <p className="text-foreground">#{selectedTransaction?.id}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Buyer</p>
                <p className="text-foreground">{selectedTransaction?.buyerName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-foreground font-medium">{selectedTransaction && formatCurrency(selectedTransaction.totalAmount, selectedTransaction.currency)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-foreground">{selectedTransaction?.paymentType}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-foreground">{selectedTransaction && formatDate(selectedTransaction.createdAt)}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
