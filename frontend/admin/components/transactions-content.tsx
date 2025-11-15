'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import DashboardLayout from '@/components/dashboard-layout'
import ApprovalDialog from '@/components/approval-dialog'
import { mockTransactions } from '@/lib/mock-data'

interface Transaction {
  id: number
  userName: string
  userEmail: string
  orderNumber: string
  totalAmount: number
  currency: string
  paymentType: string
  status: string
  createdAt: string
  orderItems: Array<{ artworkTitle: string; sellerName: string; price: number }>
}

export default function TransactionsContent() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [dialogType, setDialogType] = useState<'approve' | 'reject'>('approve')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, searchQuery])

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions')
      if (!response.ok) throw new Error('API not available')
      const data = await response.json()
      setTransactions(data)
    } catch (error) {
      console.log('[v0] Using mock data for transactions')
      setTransactions(mockTransactions)
    } finally {
      setIsLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredTransactions(filtered)
  }

  const handleApprove = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDialogType('approve')
    setIsDialogOpen(true)
  }

  const handleReject = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setDialogType('reject')
    setIsDialogOpen(true)
  }

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedTransaction) return

    try {
      const endpoint = dialogType === 'approve' ? 'approve' : 'reject'
      const response = await fetch(`/api/admin/purchase-requests/${selectedTransaction.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dialogType === 'reject' ? JSON.stringify({ reason, adminNote: reason }) : JSON.stringify({}),
      })

      if (response.ok) {
        await fetchTransactions()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.log(`[v0] Mock ${dialogType} action`)
      setTransactions((prev) =>
        prev.map((t) =>
          t.id === selectedTransaction.id
            ? { ...t, status: dialogType === 'approve' ? 'Completed' : 'Cancelled' }
            : t
        )
      )
      setIsDialogOpen(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="default">Completed</Badge>
      case 'Pending':
        return <Badge variant="secondary">Pending</Badge>
      case 'Failed':
      case 'Cancelled':
        return <Badge variant="destructive">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingCount = transactions.filter((t) => t.status === 'Pending').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Transaction Management</h1>
            <p className="text-muted-foreground">
              Monitor and manage purchase requests {pendingCount > 0 && `(${pendingCount} pending)`}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No transactions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">{transaction.orderNumber}</TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{transaction.userName}</div>
                        <div className="text-sm text-muted-foreground">{transaction.userEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.orderItems?.length || 0} item(s)</TableCell>
                    <TableCell>
                      {transaction.currency} {transaction.totalAmount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.paymentType}</TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>{new Date(transaction.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {transaction.status === 'Pending' && (
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" onClick={() => handleApprove(transaction)}>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(transaction)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ApprovalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmAction}
        type={dialogType}
        title={dialogType === 'approve' ? 'Approve Purchase' : 'Reject Purchase'}
        description={
          dialogType === 'approve'
            ? `Are you sure you want to approve order ${selectedTransaction?.orderNumber}?`
            : `Are you sure you want to reject order ${selectedTransaction?.orderNumber}? This action requires a reason.`
        }
      />
    </DashboardLayout>
  )
}
