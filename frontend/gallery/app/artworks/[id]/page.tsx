'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArtworkCard } from '@/components/artwork-card';
import { Heart, ShoppingCart, Gavel, ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ArtworkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<any>(null);
  const [relatedArtworks, setRelatedArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorited, setIsFavorited] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadArtwork();
  }, [params.id]);

  const loadArtwork = async () => {
    try {
      setIsLoading(true);
      const artworkId = parseInt(params.id as string);
      const artworkData = await apiClient.guest.getArtworkDetails(artworkId);
      setArtwork(artworkData);

      const related = await apiClient.guest.getRelatedArtworks(artworkId, 4);
      setRelatedArtworks(related);

      if (user && token) {
        const favoriteCheck = await apiClient.members.checkFavorite(artworkId, token);
        setIsFavorited(favoriteCheck.isFavorite);
      }
    } catch (error) {
      console.error('Failed to load artwork:', error);
      toast({
        title: 'Error',
        description: 'Failed to load artwork details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFavoriteToggle = async () => {
    if (!user || !token) {
      toast({
        title: 'Login Required',
        description: 'Please login to add favorites',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    try {
      if (isFavorited) {
        await apiClient.members.removeFromFavorites(artwork.id, token);
        setIsFavorited(false);
        toast({ title: 'Removed from favorites' });
      } else {
        await apiClient.members.addToFavorites(artwork.id, token);
        setIsFavorited(true);
        toast({ title: 'Added to favorites' });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update favorites',
        variant: 'destructive',
      });
    }
  };

  const handlePurchase = async () => {
    if (!user || !token) {
      toast({
        title: 'Login Required',
        description: 'Please login to purchase',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (user.role !== 'Buyer') {
      toast({
        title: 'Buyer Account Required',
        description: 'You need a buyer account to purchase artworks',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsProcessing(true);
      const order = await apiClient.buyer.placeOrder({ artworkId: artwork.id }, token);
      const payment = await apiClient.buyer.initiatePayment(order.id, token);
      
      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      }
    } catch (error: any) {
      toast({
        title: 'Purchase Failed',
        description: error.message || 'Failed to process purchase',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBidNow = () => {
    if (!user || !token) {
      router.push('/login');
      return;
    }
    router.push(`/auctions/${artwork.id}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Artwork not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Image */}
          <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
            <Image
              src={artwork.imageUrl || `/placeholder.svg?height=800&width=800&query=${encodeURIComponent(artwork.title)}`}
              alt={artwork.title}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="font-serif text-3xl md:text-4xl text-balance">{artwork.title}</h1>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleFavoriteToggle}
                  disabled={!user}
                >
                  <Heart className={`h-6 w-6 ${isFavorited ? 'fill-current text-red-500' : ''}`} />
                </Button>
              </div>
              {artwork.artistName && (
                <p className="text-xl text-muted-foreground">by {artwork.artistName}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {artwork.categoryName && <Badge>{artwork.categoryName}</Badge>}
              {artwork.saleType && (
                <Badge variant={artwork.saleType === 'Auction' ? 'default' : 'secondary'}>
                  {artwork.saleType}
                </Badge>
              )}
              {artwork.status && <Badge variant="outline">{artwork.status}</Badge>}
            </div>

            {artwork.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground leading-relaxed">{artwork.description}</p>
              </div>
            )}

            {artwork.price !== undefined && artwork.price !== null && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Price</p>
                <p className="text-3xl font-medium">${artwork.price.toLocaleString()}</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              {artwork.saleType === 'FixedPrice' && artwork.status === 'Available' && (
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handlePurchase}
                  disabled={isProcessing}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {isProcessing ? 'Processing...' : 'Purchase Now'}
                </Button>
              )}
              {artwork.saleType === 'Auction' && artwork.status === 'Available' && (
                <Button size="lg" className="w-full" onClick={handleBidNow}>
                  <Gavel className="h-5 w-5 mr-2" />
                  Place Bid
                </Button>
              )}
            </div>

            {/* Specifications */}
            {(artwork.medium || artwork.dimensions || artwork.year) && (
              <Card>
                <CardContent className="p-4 space-y-2">
                  <h3 className="font-medium mb-3">Specifications</h3>
                  {artwork.medium && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Medium</span>
                      <span>{artwork.medium}</span>
                    </div>
                  )}
                  {artwork.dimensions && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dimensions</span>
                      <span>{artwork.dimensions}</span>
                    </div>
                  )}
                  {artwork.year && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Year</span>
                      <span>{artwork.year}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Related Artworks */}
        {relatedArtworks.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl mb-6">Related Artworks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedArtworks.map((related) => (
                <ArtworkCard key={related.id} artwork={related} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
