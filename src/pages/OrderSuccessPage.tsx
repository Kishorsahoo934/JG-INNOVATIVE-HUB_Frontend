import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, Copy, Check } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/price';
import { useEffect, useState } from 'react';

const OrderSuccessPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [summary, setSummary] = useState<{
    subtotal: number;
    gstAmount: number;
    total: number;
    orderId?: string;
  } | null>(null);
  const [idCopied, setIdCopied] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('orderForContactUs') === '1') {
      sessionStorage.removeItem('orderForContactUs');
      navigate('/contact?fromOrder=1', { replace: true });
      return;
    }
    const raw = sessionStorage.getItem('lastOrderSummary');
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as {
        subtotal: number;
        gstAmount: number;
        total: number;
        orderId?: string;
      };
      setSummary(parsed);
    } catch {
      setSummary(null);
    }
  }, [navigate]);

  const copyOrderId = async () => {
    if (!summary?.orderId) return;
    try {
      await navigator.clipboard.writeText(summary.orderId);
      setIdCopied(true);
      toast({ title: 'Copied', description: 'Order ID copied to clipboard.' });
      window.setTimeout(() => setIdCopied(false), 2000);
    } catch {
      toast({ title: 'Could not copy', variant: 'destructive' });
    }
  };

  return (
    <EShopLayout>
      <SEO title="Order Confirmed" description="Thank you for your order at Innovative Hub." path="/order-success" noIndex />
      <div className="container mx-auto px-3 sm:px-4 py-10 sm:py-16 text-center max-w-full">
        <CheckCircle className="w-16 h-16 sm:w-20 sm:h-20 text-green-500 mx-auto mb-4 sm:mb-6" />
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-3 sm:mb-4">Order Placed Successfully!</h1>
        <p className="text-sm sm:text-base text-muted-foreground mb-2">Thank you for your order.</p>
        <p className="text-sm sm:text-base text-muted-foreground mb-4">Order confirmation has been sent to your email.</p>
        {summary?.orderId && (
          <div className="max-w-md mx-auto mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 justify-center px-2">
            <p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
              <span className="block font-medium text-foreground mb-1">Your order ID</span>
              <span className="font-mono text-foreground break-all text-sm">{summary.orderId}</span>
            </p>
            <Button type="button" variant="outline" size="sm" className="gap-1.5 shrink-0 min-h-[44px] touch-manipulation" onClick={copyOrderId}>
              {idCopied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {idCopied ? 'Copied' : 'Copy ID'}
            </Button>
          </div>
        )}
        {summary && (
          <div className="max-w-md mx-auto mb-6 sm:mb-8 text-left bg-card border border-border rounded-xl p-3 sm:p-4">
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>Product Total (Excl. GST)</span>
              <span>₹{formatPrice(summary.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground mb-2">
              <span>GST @18%</span>
              <span>₹{formatPrice(summary.gstAmount)}</span>
            </div>
            <div className="flex justify-between text-base font-semibold">
              <span>Final Amount Paid</span>
              <span className="text-primary">₹{formatPrice(summary.total)}</span>
            </div>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
          <Link to="/account" className="inline-block"><Button variant="outline" className="w-full sm:w-auto min-h-[48px] touch-manipulation">View Orders</Button></Link>
          <Link to="/eshop" className="inline-block"><Button className="w-full sm:w-auto min-h-[48px] touch-manipulation">Continue Shopping</Button></Link>
        </div>
      </div>
    </EShopLayout>
  );
};

export default OrderSuccessPage;
