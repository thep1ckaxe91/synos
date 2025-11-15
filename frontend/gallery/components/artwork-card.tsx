'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';

interface ArtworkCardProps {
  artwork: {
    id: number;
    title: string;
    artistName?: string;
    price?: number;
    imageUrl?: string;
    categoryName?: string;
    saleType?: string;
    status?: string;
  };
  onFavoriteChange?: () => void;
}

export function ArtworkCard({ artwork, onFavoriteChange }: ArtworkCardProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user || !token) {
      toast({
        title: 'Login Required',
        description: 'Please login to add favorites',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      if (isFavorited) {
        await apiClient.members.removeFromFavorites(artwork.id, token);
        setIsFavorited(false);
        toast({
          title: 'Removed from favorites',
        });
      } else {
        await apiClient.members.addToFavorites(artwork.id, token);
        setIsFavorited(true);
        toast({
          title: 'Added to favorites',
        });
      }
      onFavoriteChange?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/artworks/${artwork.id}`}>
      <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative aspect-[3/4] overflow-hidden bg-muted">
          <Image
            src={artwork.imageUrl || `/placeholder.svg?height=600&width=450&query=${encodeURIComponent(artwork.title)}`}
            alt={artwork.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {user && (
            <Button
              variant="secondary"
              size="icon"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleFavoriteClick}
              disabled={isLoading}
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
            </Button>
          )}
          {artwork.saleType && (
            <Badge className="absolute top-3 left-3" variant={artwork.saleType === 'Auction' ? 'default' : 'secondary'}>
              {artwork.saleType}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-lg mb-1 line-clamp-1">{artwork.title}</h3>
          {artwork.artistName && (
            <p className="text-sm text-muted-foreground mb-2">{artwork.artistName}</p>
          )}
          <div className="flex items-center justify-between">
            {artwork.price !== undefined && artwork.price !== null && (
              <p className="font-medium">${artwork.price.toLocaleString()}</p>
            )}
            {artwork.categoryName && (
              <Badge variant="outline" className="text-xs">
                {artwork.categoryName}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
