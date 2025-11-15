'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Palette, Plus, DollarSign, Package } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [artworks, setArtworks] = useState<any[]>([]);
  const [salesHistory, setSalesHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'Seller') {
      toast({
        title: 'Access Denied',
        description: 'This page is only for sellers',
        variant: 'destructive',
      });
      router.push('/artworks');
      return;
    }

    loadData();
  }, [user, router]);

  const loadData = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const [artworksData, salesData] = await Promise.all([
        apiClient.seller.getArtworks(token),
        apiClient.seller.getSalesHistory(token),
      ]);
      setArtworks(artworksData);
      setSalesHistory(salesData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'sold':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!user || user.role !== 'Seller') {
    return null;
  }

  const totalRevenue = salesHistory.reduce((sum, sale) => sum + (sale.saleAmount || 0), 0);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              <h1 className="font-serif text-4xl">My Studio</h1>
            </div>
            <Link href="/seller/upload">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Upload Artwork
              </Button>
            </Link>
          </div>
          <p className="text-lg text-muted-foreground">
            Manage your artworks and track sales
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Artworks</p>
                  <p className="text-2xl font-medium">{artworks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-secondary/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-medium">{salesHistory.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-medium">${totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList>
            <TabsTrigger value="artworks">My Artworks</TabsTrigger>
            <TabsTrigger value="sales">Sales History</TabsTrigger>
          </TabsList>

          <TabsContent value="artworks">
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
            ) : artworks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artworks.map((artwork) => (
                  <Card key={artwork.id}>
                    <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                      <Image
                        src={artwork.imageUrl || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(artwork.title)}`}
                        alt={artwork.title}
                        fill
                        className="object-cover"
                      />
                      <Badge className="absolute top-3 left-3" variant={getStatusColor(artwork.status)}>
                        {artwork.status}
                      </Badge>
                      {artwork.saleType && (
                        <Badge className="absolute top-3 right-3">
                          {artwork.saleType}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-6 space-y-2">
                      <h3 className="font-medium text-lg line-clamp-1">{artwork.title}</h3>
                      <div className="flex items-center justify-between">
                        <p className="text-muted-foreground">{artwork.categoryName}</p>
                        {artwork.price && (
                          <p className="font-medium">${artwork.price.toLocaleString()}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No artworks yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start by uploading your first artwork
                </p>
                <Link href="/seller/upload">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Artwork
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          <TabsContent value="sales">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : salesHistory.length > 0 ? (
              <div className="space-y-4">
                {salesHistory.map((sale) => (
                  <Card key={sale.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{sale.artworkTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Sold to {sale.buyerName} on {new Date(sale.saleDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-medium">${sale.saleAmount?.toLocaleString()}</p>
                          {sale.commissionAmount && (
                            <p className="text-xs text-muted-foreground">
                              Commission: ${sale.commissionAmount?.toLocaleString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No sales yet</h3>
                <p className="text-muted-foreground">
                  Your sales will appear here once you make your first sale
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
