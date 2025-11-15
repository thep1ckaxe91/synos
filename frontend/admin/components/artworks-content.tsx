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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DashboardLayout from '@/components/dashboard-layout'
import ApprovalDialog from '@/components/approval-dialog'
import ArtworkDialog from '@/components/artwork-dialog'
import { mockArtworks } from '@/lib/mock-data'

interface Artwork {
  id: number
  title: string
  description?: string
  sellerName: string
  sellerEmail: string
  categoryName?: string
  fixedPrice?: number
  currency: string
  status: string
  createdAt: string
  primaryImageUrl?: string
  isFor: string
}

export default function ArtworksContent() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('all')
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | 'view'>('approve')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)

  useEffect(() => {
    fetchArtworks()
  }, [])

  useEffect(() => {
    filterArtworks()
  }, [artworks, searchQuery, selectedTab])

  const fetchArtworks = async () => {
    try {
      const response = await fetch('/api/admin/artworks')
      if (!response.ok) throw new Error('API not available')
      const data = await response.json()
      setArtworks(data)
    } catch (error) {
      console.log('[v0] Using mock data for artworks')
      setArtworks(mockArtworks)
    } finally {
      setIsLoading(false)
    }
  }

  const filterArtworks = () => {
    let filtered = artworks

    if (selectedTab === 'pending') {
      filtered = filtered.filter((a) => a.status === 'PendingApproval')
    } else if (selectedTab === 'approved') {
      filtered = filtered.filter((a) => a.status === 'Approved' || a.status === 'Available')
    } else if (selectedTab === 'rejected') {
      filtered = filtered.filter((a) => a.status === 'Rejected')
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.sellerName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    setFilteredArtworks(filtered)
  }

  const handleApprove = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setDialogType('approve')
    setIsDialogOpen(true)
  }

  const handleReject = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setDialogType('reject')
    setIsDialogOpen(true)
  }

  const handleView = (artwork: Artwork) => {
    setSelectedArtwork(artwork)
    setIsViewDialogOpen(true)
  }

  const handleConfirmAction = async (reason?: string) => {
    if (!selectedArtwork) return

    try {
      const endpoint = dialogType === 'approve' ? 'approve' : 'reject'
      const response = await fetch(`/api/admin/artworks/${selectedArtwork.id}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: dialogType === 'reject' ? JSON.stringify({ reason, adminNote: reason }) : undefined,
      })

      if (response.ok) {
        await fetchArtworks()
        setIsDialogOpen(false)
      }
    } catch (error) {
      console.log(`[v0] Mock ${dialogType} action`)
      setArtworks((prev) =>
        prev.map((a) =>
          a.id === selectedArtwork.id
            ? { ...a, status: dialogType === 'approve' ? 'Approved' : 'Rejected' }
            : a
        )
      )
      setIsDialogOpen(false)
    }
  }

  const handleDelete = async (artworkId: number) => {
    if (!confirm('Are you sure you want to delete this artwork?')) return

    try {
      const response = await fetch(`/api/admin/artworks/${artworkId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        await fetchArtworks()
      }
    } catch (error) {
      console.log('[v0] Mock delete action')
      setArtworks((prev) => prev.filter((a) => a.id !== artworkId))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
      case 'Available':
        return <Badge variant="default">Approved</Badge>
      case 'PendingApproval':
        return <Badge variant="secondary">Pending</Badge>
      case 'Rejected':
        return <Badge variant="destructive">Rejected</Badge>
      case 'Sold':
        return <Badge variant="outline">Sold</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const pendingCount = artworks.filter((a) => a.status === 'PendingApproval').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Artwork Management</h1>
            <p className="text-muted-foreground">Manage artwork submissions and catalog</p>
          </div>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Artworks</TabsTrigger>
              <TabsTrigger value="pending">
                Pending {pendingCount > 0 && <span className="ml-1">({pendingCount})</span>}
              </TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
            <Input
              placeholder="Search artworks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-xs"
            />
          </div>

          <TabsContent value={selectedTab} className="mt-6">
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
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
                  ) : filteredArtworks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No artworks found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredArtworks.map((artwork) => (
                      <TableRow key={artwork.id}>
                        <TableCell className="font-medium">{artwork.title}</TableCell>
                        <TableCell>{artwork.sellerName}</TableCell>
                        <TableCell>{artwork.categoryName || 'Uncategorized'}</TableCell>
                        <TableCell className="capitalize">{artwork.isFor}</TableCell>
                        <TableCell>
                          {artwork.fixedPrice
                            ? `${artwork.currency} ${artwork.fixedPrice.toFixed(2)}`
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{getStatusBadge(artwork.status)}</TableCell>
                        <TableCell>{new Date(artwork.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button size="sm" variant="outline" onClick={() => handleView(artwork)}>
                              View
                            </Button>
                            {artwork.status === 'PendingApproval' && (
                              <>
                                <Button size="sm" onClick={() => handleApprove(artwork)}>
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleReject(artwork)}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {artwork.status !== 'PendingApproval' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDelete(artwork.id)}
                              >
                                Delete
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ApprovalDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={handleConfirmAction}
        type={dialogType}
        title={dialogType === 'approve' ? 'Approve Artwork' : 'Reject Artwork'}
        description={
          dialogType === 'approve'
            ? `Are you sure you want to approve "${selectedArtwork?.title}"?`
            : `Are you sure you want to reject "${selectedArtwork?.title}"? This action requires a reason.`
        }
      />

      <ArtworkDialog
        isOpen={isViewDialogOpen}
        onClose={() => setIsViewDialogOpen(false)}
        artwork={selectedArtwork}
      />
    </DashboardLayout>
  )
}
