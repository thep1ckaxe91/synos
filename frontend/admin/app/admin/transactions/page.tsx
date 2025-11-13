"use client"

import { useState } from "react"
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
import { Search, Check, X, Eye, DollarSign, TrendingUp, Clock } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock data
const pendingPurchases = [
  {
    id: 1,
    artwork: "Sunset Dreams",
    buyer: "David Brown",
    seller: "John Smith",
    amount: "$2,500",
    type: "Fixed Price",
    date: "2025-01-08",
  },
  {
    id: 2,
    artwork: "Urban Life",
    buyer: "Emma Wilson",
    seller: "Michael Chen",
    amount: "$800",
    type: "Fixed Price",
    date: "2025-01-08",
  },
]

const auctionBids = [
  {
    id: 3,
    artwork: "Abstract Thoughts",
    bidder: "Lisa Anderson",
    currentBid: "$1,200",
    bids: 5,
    endDate: "2025-01-10",
    status: "Active",
  },
  {
    id: 4,
    artwork: "Digital Future",
    bidder: "David Brown",
    currentBid: "$1,800",
    bids: 8,
    endDate: "2025-01-09",
    status: "Active",
  },
]

const completedTransactions = [
  {
    id: 5,
    artwork: "Ocean Waves",
    buyer: "Emma Wilson",
    seller: "Lisa Anderson",
    amount: "$1,200",
    type: "Fixed Price",
    date: "2025-01-05",
    status: "Completed",
  },
  {
    id: 6,
    artwork: "Mountain Vista",
    buyer: "David Brown",
    seller: "Emma Wilson",
    amount: "$3,500",
    type: "Auction",
    date: "2025-01-03",
    status: "Shipped",
  },
  {
    id: 7,
    artwork: "City Lights",
    buyer: "Lisa Anderson",
    seller: "John Smith",
    amount: "$950",
    type: "Fixed Price",
    date: "2025-01-02",
    status: "Completed",
  },
]

export default function TransactionManagement() {
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")

  const handleApproval = (transaction: any, action: "approve" | "reject") => {
    setSelectedTransaction(transaction)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  const totalRevenue = "$45,231"
  const pendingAmount = "$3,300"
  const completedCount = completedTransactions.length

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
            <div className="text-2xl font-bold text-foreground">{totalRevenue}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-accent">+15.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Approval</CardTitle>
            <Clock className="h-5 w-5 text-chart-3" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{pendingAmount}</div>
            <p className="text-xs text-muted-foreground">{pendingPurchases.length} purchase requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completed Sales</CardTitle>
            <TrendingUp className="h-5 w-5 text-chart-2" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{completedCount}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Purchases ({pendingPurchases.length})</TabsTrigger>
          <TabsTrigger value="auctions">Active Auctions ({auctionBids.length})</TabsTrigger>
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
                    <TableHead>Artwork</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingPurchases.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium text-foreground">{transaction.artwork}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.buyer}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.seller}</TableCell>
                      <TableCell className="font-medium text-foreground">{transaction.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
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
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auctions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Auctions</CardTitle>
              <CardDescription>Monitor ongoing auction bids</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artwork</TableHead>
                    <TableHead>Current Bidder</TableHead>
                    <TableHead>Current Bid</TableHead>
                    <TableHead>Total Bids</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auctionBids.map((auction) => (
                    <TableRow key={auction.id}>
                      <TableCell className="font-medium text-foreground">{auction.artwork}</TableCell>
                      <TableCell className="text-muted-foreground">{auction.bidder}</TableCell>
                      <TableCell className="font-medium text-foreground">{auction.currentBid}</TableCell>
                      <TableCell className="text-muted-foreground">{auction.bids}</TableCell>
                      <TableCell className="text-muted-foreground">{auction.endDate}</TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-accent text-accent-foreground">
                          {auction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
              <CardDescription>All completed sales and auction transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artwork</TableHead>
                    <TableHead>Buyer</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {completedTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium text-foreground">{transaction.artwork}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.buyer}</TableCell>
                      <TableCell className="text-muted-foreground">{transaction.seller}</TableCell>
                      <TableCell className="font-medium text-foreground">{transaction.amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{transaction.date}</TableCell>
                      <TableCell>
                        <Badge variant={transaction.status === "Completed" ? "default" : "secondary"}>
                          {transaction.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvalAction === "approve" ? "Approve" : "Reject"} Purchase Request</DialogTitle>
            <DialogDescription>
              Are you sure you want to {approvalAction} the purchase of "{selectedTransaction?.artwork}" by{" "}
              {selectedTransaction?.buyer}?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Cancel
            </Button>
            <Button
              variant={approvalAction === "approve" ? "default" : "destructive"}
              onClick={() => setShowApprovalDialog(false)}
            >
              {approvalAction === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>Complete information about this transaction</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Artwork</p>
              <p className="text-foreground">{selectedTransaction?.artwork}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Buyer</p>
                <p className="text-foreground">{selectedTransaction?.buyer}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Seller</p>
                <p className="text-foreground">{selectedTransaction?.seller}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-foreground font-medium">{selectedTransaction?.amount}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Type</p>
                <p className="text-foreground">{selectedTransaction?.type}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-foreground">{selectedTransaction?.date}</p>
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
