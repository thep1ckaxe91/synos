'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface ArtworkDialogProps {
  isOpen: boolean
  onClose: () => void
  artwork: any
}

export default function ArtworkDialog({ isOpen, onClose, artwork }: ArtworkDialogProps) {
  if (!artwork) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{artwork.title}</DialogTitle>
          <DialogDescription>Artwork Details</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {artwork.primaryImageUrl && (
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <img
                src={artwork.primaryImageUrl || "/placeholder.svg"}
                alt={artwork.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Seller</p>
              <p className="text-sm">{artwork.sellerName}</p>
              <p className="text-xs text-muted-foreground">{artwork.sellerEmail}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Category</p>
              <p className="text-sm">{artwork.categoryName || 'Uncategorized'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <Badge variant="outline" className="capitalize">
                {artwork.isFor}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Price</p>
              <p className="text-sm">
                {artwork.fixedPrice
                  ? `${artwork.currency} ${artwork.fixedPrice.toFixed(2)}`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {artwork.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{artwork.description}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
