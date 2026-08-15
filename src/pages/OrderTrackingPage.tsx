import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Search } from 'lucide-react';
import { ordersApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { ORDER_TRACK_STORAGE_KEY } from '@/lib/orderTrackStorage';

const OrderTrackingPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderId, setOrderId] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = orderId.trim();
    const em = email.trim();
    if (!id || !em) {
      toast({ title: 'Missing details', description: 'Enter both order ID and email.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await ordersApi.trackOrder(id, em);
      if (!res.success || !res.data?._id) {
        toast({
          title: 'Could not find order',
          description:
            res.message ||
            'Check that the order ID matches your confirmation email or account orders, and use the same email as your Innovative Hub login.',
          variant: 'destructive',
        });
        return;
      }
      try {
        sessionStorage.setItem(
          ORDER_TRACK_STORAGE_KEY,
          JSON.stringify({ orderId: res.data._id, email: em.toLowerCase() })
        );
      } catch {
        /* ignore quota / private mode */
      }
      navigate(`/order/${res.data._id}`);
    } catch (err) {
      toast({
        title: 'Something went wrong',
        description: err instanceof Error ? err.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <SEO
        title="Order Tracking"
        description="Track your Innovative Hub order. Enter your order ID and email to see shipment status."
        path="/order-tracking"
      />
      <div className="network-bg py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 max-w-full">
          <div className="max-w-lg mx-auto">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Package className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-3 sm:mb-4">
                Order Tracking
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Enter the order ID and the email on your Innovative Hub account. No login required.
              </p>
            </div>

            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-4 sm:p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="orderId">Order ID</Label>
                  <Input
                    id="orderId"
                    name="orderId"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="e.g. 507f1f77bcf86cd799439011"
                    className="bg-background/50 font-mono text-sm"
                    autoComplete="off"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Same email as your account that placed the order"
                    className="bg-background/50"
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </div>
                <Button type="submit" className="w-full min-h-[48px] rounded-lg gap-2 touch-manipulation" disabled={isSubmitting}>
                  <Search className="w-4 h-4" />
                  {isSubmitting ? 'Looking up…' : 'Track order'}
                </Button>
              </form>

              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground text-center">
                  Need help? <a href="/contact" className="text-primary hover:underline">Contact our support team</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderTrackingPage;
