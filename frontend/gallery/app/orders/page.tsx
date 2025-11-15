'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { ShoppingBag, Package, CreditCard } from 'lucide-react';
import Image from 'next/image';

export default function OrdersPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'Buyer') {
      toast({
        title: 'Access Denied',
        description: 'This page is only for buyers',
        variant: 'destructive',
      });
      router.push('/artworks');
      return;
    }

    loadOrders();
  }, [user, router]);

  const loadOrders = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      const data = await apiClient.buyer.getOrders(token);
      setOrders(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load orders',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayNow = async (orderId: number) => {
    if (!token) return;

    try {
      const payment = await apiClient.buyer.initiatePayment(orderId, token);
      if (payment.paymentUrl) {
        window.location.href = payment.paymentUrl;
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to initiate payment',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (!user || user.role !== 'Buyer') {
    return null;
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h1 className="font-serif text-4xl">My Orders</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Track and manage your artwork purchases
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {order.artworkImageUrl && (
                      <div className="relative w-full md:w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={order.artworkImageUrl || "/placeholder.svg"}
                          alt={order.artworkTitle || 'Artwork'}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-lg">{order.artworkTitle}</h3>
                          <p className="text-sm text-muted-foreground">
                            Order #{order.id}
                          </p>
                        </div>
                        <Badge variant={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <p className="text-2xl font-medium">
                            ${order.totalAmount?.toLocaleString()}
                          </p>
                          {order.orderDate && (
                            <p className="text-xs text-muted-foreground">
                              Ordered on {new Date(order.orderDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {order.status === 'Pending' && (
                          <Button onClick={() => handlePayNow(order.id)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">
              Start shopping to see your orders here
            </p>
            <Button onClick={() => router.push('/artworks')}>
              Browse Artworks
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
