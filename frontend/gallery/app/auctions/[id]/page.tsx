'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Gavel, Clock, TrendingUp, ArrowLeft } from 'lucide-react';

export default function AuctionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [auction, setAuction] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAuction();
  }, [params.id]);

  const loadAuction = async () => {
    try {
      setIsLoading(true);
      const auctionId = parseInt(params.id as string);
      
      if (user && token) {
        const data = await apiClient.buyer.getAuctionDetails(auctionId, token);
        setAuction(data);
      } else {
        const data = await apiClient.guest.getAuctionDetails(auctionId);
        setAuction(data);
      }
    } catch (error) {
      console.error('Failed to load auction:', error);
      toast({
        title: 'Error',
        description: 'Failed to load auction details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      toast({
        title: 'Login Required',
        description: 'Please login to place a bid',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    if (user.role !== 'Buyer') {
      toast({
        title: 'Buyer Account Required',
        description: 'You need a buyer account to bid',
        variant: 'destructive',
      });
      return;
    }

    const amount = parseFloat(bidAmount);
    const minBid = auction.currentBid 
      ? auction.currentBid + (auction.minimumIncrement || 100)
      : auction.startingBid;

    if (!amount || amount < minBid) {
      toast({
        title: 'Invalid Bid',
        description: `Your bid must be at least $${minBid.toLocaleString()}`,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.buyer.placeBid(auction.id, amount, token);
      toast({
        title: 'Bid Placed!',
        description: `You bid $${amount.toLocaleString()} on this artwork`,
      });
      setBidAmount('');
      await loadAuction();
    } catch (error: any) {
      toast({
        title: 'Bid Failed',
        description: error.message || 'Failed to place bid',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return 'Auction Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="aspect-[4/3] w-full mb-6" />
              <Skeleton className="h-10 w-3/4 mb-4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-96 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Auction not found</p>
        </div>
      </div>
    );
  }

  const minBid = auction.currentBid 
    ? auction.currentBid + (auction.minimumIncrement || 100)
    : auction.startingBid;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Auctions
        </Button>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Artwork Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-muted">
              <Image
                src={auction.artworkImageUrl || `/placeholder.svg?height=600&width=800&query=${encodeURIComponent(auction.artworkTitle)}`}
                alt={auction.artworkTitle}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="font-serif text-3xl md:text-4xl mb-2 text-balance">
                    {auction.artworkTitle}
                  </h1>
                  {auction.artistName && (
                    <p className="text-xl text-muted-foreground">by {auction.artistName}</p>
                  )}
                </div>
                <Badge>Live Auction</Badge>
              </div>

              {auction.description && (
                <div className="mb-6">
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{auction.description}</p>
                </div>
              )}

              {auction.bids && auction.bids.length > 0 && (
                <div>
                  <h3 className="font-medium mb-3">Bidding History</h3>
                  <div className="space-y-2">
                    {auction.bids.slice(0, 5).map((bid: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">{bid.bidderName || 'Anonymous'}</span>
                        <span className="font-medium">${bid.amount?.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Bidding Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  {auction.endTime && getTimeRemaining(auction.endTime)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Current Bid</p>
                  <p className="text-3xl font-medium">
                    ${(auction.currentBid || auction.startingBid)?.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  {auction.totalBids || 0} bid(s)
                </div>

                {user && user.role === 'Buyer' ? (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bidAmount">Your Bid</Label>
                      <Input
                        id="bidAmount"
                        type="number"
                        placeholder={`Minimum $${minBid.toLocaleString()}`}
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        disabled={isSubmitting}
                        min={minBid}
                        step="100"
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum bid: ${minBid.toLocaleString()}
                      </p>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      <Gavel className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      {!user ? 'Login to place a bid' : 'Buyer account required to bid'}
                    </p>
                    <Button
                      className="w-full"
                      onClick={() => router.push(user ? '/profile' : '/login')}
                    >
                      {user ? 'View Profile' : 'Login to Bid'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Auction Info */}
            <Card>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-medium mb-3">Auction Details</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Starting Bid</span>
                  <span>${auction.startingBid?.toLocaleString()}</span>
                </div>
                {auction.startTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Start Time</span>
                    <span>{new Date(auction.startTime).toLocaleString()}</span>
                  </div>
                )}
                {auction.endTime && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">End Time</span>
                    <span>{new Date(auction.endTime).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
