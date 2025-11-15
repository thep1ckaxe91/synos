'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/lib/api-client';
import { ArtworkCard } from '@/components/artwork-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin, ArrowLeft } from 'lucide-react';

export default function ExhibitionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [exhibition, setExhibition] = useState<any>(null);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExhibition();
  }, [params.id]);

  const loadExhibition = async () => {
    try {
      setIsLoading(true);
      const exhibitionId = parseInt(params.id as string);
      const [exhibitionData, artworksData] = await Promise.all([
        apiClient.guest.getExhibitionDetails(exhibitionId),
        apiClient.guest.getExhibitionArtworks(exhibitionId),
      ]);
      setExhibition(exhibitionData);
      setArtworks(artworksData);
    } catch (error) {
      console.error('Failed to load exhibition:', error);
      toast({
        title: 'Error',
        description: 'Failed to load exhibition details',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getExhibitionStatus = () => {
    if (!exhibition.startDate || !exhibition.endDate) return null;

    const now = new Date();
    const start = new Date(exhibition.startDate);
    const end = new Date(exhibition.endDate);

    if (now < start) return { label: 'Upcoming', variant: 'secondary' as const };
    if (now > end) return { label: 'Past', variant: 'outline' as const };
    return { label: 'Active', variant: 'default' as const };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-8" />
          <div className="mb-12">
            <Skeleton className="aspect-[21/9] w-full mb-8" />
            <Skeleton className="h-12 w-3/4 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!exhibition) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">Exhibition not found</p>
        </div>
      </div>
    );
  }

  const status = getExhibitionStatus();

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <Button variant="ghost" className="mb-8" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exhibitions
        </Button>

        {/* Hero Image */}
        <div className="relative aspect-[21/9] overflow-hidden rounded-lg bg-muted mb-8">
          <Image
            src={exhibition.imageUrl || `/placeholder.svg?height=600&width=1400&query=${encodeURIComponent(exhibition.name)}`}
            alt={exhibition.name}
            fill
            className="object-cover"
            priority
          />
          {status && (
            <Badge className="absolute top-6 left-6" variant={status.variant}>
              {status.label}
            </Badge>
          )}
          {exhibition.isFeatured && (
            <Badge className="absolute top-6 right-6">Featured</Badge>
          )}
        </div>

        {/* Exhibition Info */}
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl mb-6 text-balance">
            {exhibition.name}
          </h1>

          {exhibition.description && (
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-3xl">
              {exhibition.description}
            </p>
          )}

          <div className="grid md:grid-cols-2 gap-6 max-w-2xl">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Calendar className="h-5 w-5 text-primary mt-1" />
                  <div>
                    <p className="font-medium mb-1">Exhibition Dates</p>
                    <p className="text-sm text-muted-foreground">
                      {exhibition.startDate && new Date(exhibition.startDate).toLocaleDateString()}
                      {exhibition.endDate && ` - ${new Date(exhibition.endDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {exhibition.location && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium mb-1">Location</p>
                      <p className="text-sm text-muted-foreground">{exhibition.location}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Featured Artworks */}
        {artworks.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl md:text-3xl mb-6">Featured Artworks</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <ArtworkCard key={artwork.id} artwork={artwork} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
