'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Gavel, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.guest.getActiveAuctions(0, 100);
      setAuctions(data);
    } catch (error) {
      console.error('Failed to load auctions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = new Date().getTime();
    const diff = end - now;

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Gavel className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-4xl md:text-5xl">Live Auctions</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Bid on exceptional artworks and build your collection
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : auctions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <Link key={auction.id} href={`/auctions/${auction.id}`}>
                <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                    <Image
                      src={auction.imageUrl || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(auction.title)}`}
                      alt={auction.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <Badge className="absolute top-3 left-3">
                      Live Auction
                    </Badge>
                  </div>
                  <CardContent className="p-6 space-y-3">
                    <h3 className="font-medium text-xl line-clamp-1">{auction.title}</h3>
                    {auction.artistName && (
                      <p className="text-sm text-muted-foreground">{auction.artistName}</p>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <div>
                        <p className="text-xs text-muted-foreground">Current Bid</p>
                        <p className="text-xl font-medium">
                          ${auction.currentBid?.toLocaleString() || auction.startingBid?.toLocaleString()}
                        </p>
                      </div>
                      {auction.endTime && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {getTimeRemaining(auction.endTime)}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Gavel className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No active auctions</h3>
            <p className="text-muted-foreground">
              Check back later for new auctions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
