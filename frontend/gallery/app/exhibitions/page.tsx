'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function ExhibitionsPage() {
  const [activeExhibitions, setActiveExhibitions] = useState<any[]>([]);
  const [upcomingExhibitions, setUpcomingExhibitions] = useState<any[]>([]);
  const [pastExhibitions, setPastExhibitions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadExhibitions();
  }, []);

  const loadExhibitions = async () => {
    try {
      setIsLoading(true);
      const [active, upcoming, past] = await Promise.all([
        apiClient.guest.getActiveExhibitions(),
        apiClient.guest.getUpcomingExhibitions(),
        apiClient.guest.getPastExhibitions(),
      ]);
      setActiveExhibitions(active);
      setUpcomingExhibitions(upcoming);
      setPastExhibitions(past);
    } catch (error) {
      console.error('Failed to load exhibitions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const ExhibitionCard = ({ exhibition }: { exhibition: any }) => (
    <Link href={`/exhibitions/${exhibition.id}`}>
      <Card className="group hover:shadow-lg transition-shadow cursor-pointer">
        <div className="relative aspect-video overflow-hidden bg-muted">
          <Image
            src={exhibition.imageUrl || `/placeholder.svg?height=400&width=600&query=${encodeURIComponent(exhibition.name)}`}
            alt={exhibition.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {exhibition.isFeatured && (
            <Badge className="absolute top-3 left-3">Featured</Badge>
          )}
        </div>
        <CardContent className="p-6 space-y-3">
          <h3 className="font-medium text-xl line-clamp-2">{exhibition.name}</h3>
          
          {exhibition.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {exhibition.description}
            </p>
          )}

          <div className="space-y-2 pt-2">
            {exhibition.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {exhibition.location}
              </div>
            )}
            
            {(exhibition.startDate || exhibition.endDate) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {exhibition.startDate && new Date(exhibition.startDate).toLocaleDateString()}
                {exhibition.endDate && ` - ${new Date(exhibition.endDate).toLocaleDateString()}`}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i}>
          <Skeleton className="aspect-video w-full" />
          <CardContent className="p-6">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="font-serif text-4xl md:text-5xl mb-4">Art Exhibitions</h1>
          <p className="text-lg text-muted-foreground">
            Discover curated collections and immersive art experiences
          </p>
        </div>

        <Tabs defaultValue="active" className="space-y-8">
          <TabsList>
            <TabsTrigger value="active">
              Current ({activeExhibitions.length})
            </TabsTrigger>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingExhibitions.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastExhibitions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              <LoadingSkeleton />
            ) : activeExhibitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No active exhibitions</h3>
                <p className="text-muted-foreground">
                  Check back soon for new exhibitions
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming">
            {isLoading ? (
              <LoadingSkeleton />
            ) : upcomingExhibitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No upcoming exhibitions</h3>
                <p className="text-muted-foreground">
                  Stay tuned for future exhibitions
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="past">
            {isLoading ? (
              <LoadingSkeleton />
            ) : pastExhibitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastExhibitions.map((exhibition) => (
                  <ExhibitionCard key={exhibition.id} exhibition={exhibition} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">No past exhibitions</h3>
                <p className="text-muted-foreground">
                  Past exhibitions will be archived here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
