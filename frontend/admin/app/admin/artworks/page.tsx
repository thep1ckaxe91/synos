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
import { Search, Check, X, Eye, Edit, Trash2, ImageIcon, Loader2 } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { apiService } from "@/lib/api-service"
import { Artwork, Category } from "@/lib/types"
import { toast } from "sonner"
import { getImageUrl } from "@/lib/utils"
import { normalizeArtworkStatus, ARTWORK_STATUS_MAP } from "@/lib/constants"

export default function ArtworkManagement() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">("approve")
  const [rejectionReason, setRejectionReason] = useState("")
  
  // Data state
  const [pendingArtworks, setPendingArtworks] = useState<Artwork[]>([])
  const [allArtworks, setAllArtworks] = useState<Artwork[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [processingApproval, setProcessingApproval] = useState(false)
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")

  // Fetch data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [artworksResponse, categoriesResponse] = await Promise.all([
        apiService.getArtworks({ skip: 0, take: 100 }),
        apiService.getCategories()
      ])
      
      let artworksData: Artwork[] = []
      if (Array.isArray(artworksResponse)) {
        artworksData = artworksResponse
      } else if (artworksResponse.items) {
        artworksData = artworksResponse.items
      } else if (artworksResponse.data) {
        artworksData = artworksResponse.data
      }
      
      const mappedArtworks = artworksData.map((item: any) => ({
        ...item,
        status: normalizeArtworkStatus(item.status)
      }))
      
      const pending = mappedArtworks.filter((artwork: Artwork) => artwork.status === 'Pending')
      const approved = mappedArtworks.filter((artwork: Artwork) => artwork.status !== 'Pending')
      
      setPendingArtworks(pending)
      setAllArtworks(approved)
      setCategories(Array.isArray(categoriesResponse) ? categoriesResponse : categoriesResponse.data || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast.error('Failed to load artworks')
    } finally {
      setLoading(false)
    }
  }

  const handleApproval = (artwork: Artwork, action: "approve" | "reject") => {
    setSelectedArtwork(artwork)
    setApprovalAction(action)
    setRejectionReason("")
    setShowApprovalDialog(true)
  }

  const executeApproval = async () => {
    if (!selectedArtwork) return
    
    try {
      setProcessingApproval(true)
      
      if (approvalAction === "approve") {
        await apiService.approveArtwork(selectedArtwork.id)
        toast.success(`Artwork "${selectedArtwork.title}" has been approved`)
      } else {
        await apiService.rejectArtwork(selectedArtwork.id, rejectionReason)
        toast.success(`Artwork "${selectedArtwork.title}" has been rejected`)
      }
      
      // Refresh data
      await loadData()
      setShowApprovalDialog(false)
    } catch (error) {
      console.error('Approval failed:', error)
      toast.error(`Failed to ${approvalAction} artwork`)
    } finally {
      setProcessingApproval(false)
    }
  }

  const formatPrice = (price: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Filter artworks
  const filteredAllArtworks = allArtworks.filter(artwork => {
    const matchesSearch = artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artwork.seller?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || artwork.category?.name === selectedCategory
    const matchesStatus = selectedStatus === 'all' || artwork.status === selectedStatus
    return matchesSearch && matchesCategory && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading artworks...</span>
      </div>
    )
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
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            {artwork.images && artwork.images.length > 0 ? (
                              <img 
                                src={getImageUrl(artwork.images[0].imageUrl) || "/placeholder.svg"} 
                                alt={artwork.title}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium text-foreground">{artwork.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{artwork.sellerName || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{artwork.categoryName || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{formatPrice(artwork.fixedPrice || 0)}</TableCell>
                      <TableCell>
                        <Badge variant={artwork.isFor === "Auction" ? "default" : "secondary"}>{artwork.isFor}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(artwork.createdAt)}</TableCell>
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
              <Input 
                placeholder="Search artworks..." 
                className="pl-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Available">Available</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
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
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAllArtworks.map((artwork) => (
                    <TableRow key={artwork.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center overflow-hidden">
                            {artwork.images && artwork.images.length > 0 ? (
                              <img 
                                src={getImageUrl(artwork.images[0].imageUrl) || "/placeholder.svg"} 
                                alt={artwork.title}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium text-foreground">{artwork.title}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{artwork.sellerName || 'Unknown'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{artwork.categoryName || 'Uncategorized'}</Badge>
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{formatPrice(artwork.fixedPrice || 0)}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            artwork.status === "Approved"
                              ? "default"
                              : artwork.status === "Rejected"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {artwork.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(artwork.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => setSelectedArtwork(artwork)}>
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
              Are you sure you want to {approvalAction} "{selectedArtwork?.title}" by {selectedArtwork?.seller?.fullName}?
            </DialogDescription>
          </DialogHeader>
          {approvalAction === "reject" && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
              />
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowApprovalDialog(false)}
              disabled={processingApproval}
            >
              Cancel
            </Button>
            <Button
              variant={approvalAction === "approve" ? "default" : "destructive"}
              onClick={executeApproval}
              disabled={processingApproval || (approvalAction === "reject" && !rejectionReason.trim())}
            >
              {processingApproval ? (
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
                <Input id="artist" defaultValue={selectedArtwork?.sellerName} disabled />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select defaultValue={selectedArtwork?.categoryName?.toLowerCase()}>
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
                <Input id="price" defaultValue={selectedArtwork?.fixedPrice} />
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
