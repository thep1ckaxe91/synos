'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { ArtworkCard } from '@/components/artwork-card';
import { apiClient } from '@/lib/api-client';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadFavorites();
  }, [user, router]);

  const loadFavorites = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await apiClient.members.getMyFavorites(token);
      setFavorites(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load favorites',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-4xl">My Favorites</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Your curated collection of artworks
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((favorite) => (
              <ArtworkCard
                key={favorite.artworkId}
                artwork={{
                  id: favorite.artworkId,
                  title: favorite.artworkTitle,
                  artistName: favorite.artistName,
                  price: favorite.price,
                  imageUrl: favorite.imageUrl,
                  categoryName: favorite.categoryName,
                  saleType: favorite.saleType,
                }}
                onFavoriteChange={loadFavorites}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No favorites yet</h3>
            <p className="text-muted-foreground mb-6">
              Start adding artworks to your favorites to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
