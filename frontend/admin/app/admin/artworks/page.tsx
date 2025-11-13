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
import { Search, Check, X, Eye, Edit, Trash2, ImageIcon } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

// Mock data
const pendingArtworks = [
  {
    id: 1,
    title: "Sunset Dreams",
    artist: "John Smith",
    category: "Painting",
    price: "$2,500",
    type: "Fixed",
    date: "2025-01-08",
  },
  {
    id: 2,
    title: "Abstract Thoughts",
    artist: "Sarah Johnson",
    category: "Digital Art",
    price: "$1,200",
    type: "Auction",
    date: "2025-01-08",
  },
  {
    id: 3,
    title: "Urban Life",
    artist: "Michael Chen",
    category: "Photography",
    price: "$800",
    type: "Fixed",
    date: "2025-01-07",
  },
]

const allArtworks = [
  {
    id: 4,
    title: "Mountain Vista",
    artist: "Emma Wilson",
    category: "Painting",
    price: "$3,500",
    status: "Active",
    sales: 0,
  },
  {
    id: 5,
    title: "Digital Future",
    artist: "David Brown",
    category: "Digital Art",
    price: "$1,800",
    status: "Active",
    sales: 2,
  },
  {
    id: 6,
    title: "Ocean Waves",
    artist: "Lisa Anderson",
    category: "Photography",
    price: "$1,200",
    status: "Sold",
    sales: 1,
  },
]

export default function ArtworkManagement() {
  const [selectedArtwork, setSelectedArtwork] = useState<any>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")

  const handleApproval = (artwork: any, action: "approve" | "reject") => {
    setSelectedArtwork(artwork)
    setApprovalAction(action)
    setShowApprovalDialog(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Artwork Management</h1>
        <p className="text-muted-foreground">Manage artwork submissions and catalog</p>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending">Pending Submissions ({pendingArtworks.length})</TabsTrigger>
          <TabsTrigger value="catalog">Artwork Catalog ({allArtworks.length})</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Artwork Submissions</CardTitle>
              <CardDescription>Review and approve artwork submissions from artists</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artwork</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingArtworks.map((artwork) => (
                    <TableRow key={artwork.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-foreground">{artwork.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{artwork.artist}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{artwork.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{artwork.price}</TableCell>
                      <TableCell>
                        <Badge variant={artwork.type === "Auction" ? "default" : "secondary"}>{artwork.type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{artwork.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedArtwork(artwork)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-accent hover:text-accent"
                            onClick={() => handleApproval(artwork, "approve")}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleApproval(artwork, "reject")}
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

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search artworks..." className="pl-10" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="painting">Painting</SelectItem>
                <SelectItem value="digital">Digital Art</SelectItem>
                <SelectItem value="photography">Photography</SelectItem>
                <SelectItem value="sculpture">Sculpture</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="sold">Sold</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Artworks</CardTitle>
              <CardDescription>Manage all artwork information</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Artwork</TableHead>
                    <TableHead>Artist</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sales</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allArtworks.map((artwork) => (
                    <TableRow key={artwork.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center">
                            <ImageIcon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <span className="font-medium text-foreground">{artwork.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{artwork.artist}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{artwork.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{artwork.price}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            artwork.status === "Active"
                              ? "default"
                              : artwork.status === "Sold"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {artwork.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{artwork.sales}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedArtwork(artwork)
                              setShowEditDialog(true)
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => {
                              setSelectedArtwork(artwork)
                              setShowDeleteDialog(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Category management coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{approvalAction === "approve" ? "Approve" : "Reject"} Artwork Submission</DialogTitle>
            <DialogDescription>
              Are you sure you want to {approvalAction} "{selectedArtwork?.title}" by {selectedArtwork?.artist}?
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

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Artwork</DialogTitle>
            <DialogDescription>Update artwork information</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" defaultValue={selectedArtwork?.title} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input id="artist" defaultValue={selectedArtwork?.artist} disabled />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={selectedArtwork?.category?.toLowerCase()}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="painting">Painting</SelectItem>
                    <SelectItem value="digital art">Digital Art</SelectItem>
                    <SelectItem value="photography">Photography</SelectItem>
                    <SelectItem value="sculpture">Sculpture</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input id="price" defaultValue={selectedArtwork?.price} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" rows={4} placeholder="Artwork description..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowEditDialog(false)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Artwork</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedArtwork?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
