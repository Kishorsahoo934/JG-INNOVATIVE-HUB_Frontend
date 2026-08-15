import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import SEO from '@/components/SEO';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { calculateGstBreakdown, formatPrice } from '@/utils/price';
import { PLACEHOLDER_IMAGE } from '@/constants/media';

const CartPage = () => {
  const { items, totalItems, totalPrice, removeFromCart, updateQuantity } = useCart();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    sessionStorage.removeItem('buyNowItem');
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter(({ product }) => {
      const name = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const desc = (product.shortDescription || '').replace(/<[^>]*>/g, ' ').toLowerCase();
      return name.includes(q) || category.includes(q) || desc.includes(q);
    });
  }, [items, searchQuery]);

  if (items.length === 0) {
    return (
      <EShopLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
        <SEO title="Cart" description="Your shopping cart at Innovative Hub." path="/cart" noIndex />
        <div className="container mx-auto px-4 py-12 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Link to="/eshop">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </EShopLayout>
    );
  }

  const breakdown = calculateGstBreakdown(totalPrice);

  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <SEO title="Shopping Cart" description="Review and manage your cart at Innovative Hub." path="/cart" noIndex />
      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 max-w-full">
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-8">Shopping Cart ({totalItems} items)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          <div className="lg:col-span-2 space-y-3 sm:space-y-4">
            {filteredItems.length === 0 ? (
              <div className="bg-card border border-border rounded-xl p-6 text-center">
                <p className="text-muted-foreground">
                  No cart items match "{searchQuery.trim()}".
                </p>
              </div>
            ) : filteredItems.map(({ product, quantity }) => {
              const plusDisabled =
                product.stock <= 0 || (product.stock > 0 && quantity >= product.stock);
              const minusDisabled = quantity <= 1;
              return (
              <div key={product._id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 bg-card border border-border rounded-xl p-3 sm:p-4 min-h-[132px] sm:min-h-[112px]">
                <img src={product.images[0] || PLACEHOLDER_IMAGE} alt={product.name} width={96} height={96} className="w-full sm:w-24 h-32 sm:h-24 shrink-0 object-contain bg-secondary/30 rounded-lg" loading="lazy" decoding="async" />
                <div className="flex-1 min-w-0 flex flex-col">
                  <Link to={`/product/${product._id}`} className="font-medium text-sm sm:text-base text-foreground hover:text-primary line-clamp-2">{product.name}</Link>
                  <p className="text-xs sm:text-sm text-muted-foreground">{product.category}</p>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <span className="font-bold text-primary text-sm sm:text-base tabular-nums">₹{formatPrice(product.price)}</span>
                    {product.mrp > product.price && <span className="text-xs sm:text-sm text-muted-foreground line-through tabular-nums">₹{formatPrice(product.mrp)}</span>}
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border sm:min-w-[140px]">
                  <div className="flex items-center border border-border rounded-lg shrink-0">
                    <button
                      type="button"
                      disabled={minusDisabled}
                      onClick={() => {
                        if (quantity > 1) updateQuantity(product._id, quantity - 1);
                      }}
                      className="p-3 sm:p-2 hover:bg-secondary active:bg-secondary/80 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-3 sm:px-3 text-sm min-w-[2.75rem] text-center tabular-nums font-medium">{quantity}</span>
                    <button
                      type="button"
                      disabled={plusDisabled}
                      onClick={() => updateQuantity(product._id, quantity + 1)}
                      className="p-3 sm:p-2 hover:bg-secondary active:bg-secondary/80 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center disabled:opacity-40 disabled:pointer-events-none"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="font-bold text-sm sm:text-base tabular-nums min-h-[44px] flex items-center sm:justify-end w-full sm:w-auto">₹{formatPrice(product.price * quantity)}</span>
                  <button type="button" onClick={() => removeFromCart(product._id)} className="text-muted-foreground hover:text-destructive p-3 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation rounded-lg shrink-0" aria-label="Remove from cart"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            );})}
          </div>
          
          <div className="bg-card border border-border rounded-xl p-4 sm:p-6 h-fit lg:sticky lg:top-32">
            <h2 className="text-base sm:text-lg font-bold text-foreground mb-3 sm:mb-4">Order Summary</h2>
            <div className="space-y-2 mb-3 sm:mb-4">
              <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal (Excluding GST)</span><span>₹{formatPrice(breakdown.subtotal)}</span></div>
              <div className="flex justify-between text-sm text-muted-foreground"><span>GST @18%</span><span>₹{formatPrice(breakdown.gstAmount)}</span></div>
            </div>
            <div className="border-t border-border pt-3 sm:pt-4 mb-4 sm:mb-6">
              <div className="flex justify-between text-base sm:text-lg font-bold"><span>Total Payable</span><span className="text-primary">₹{formatPrice(breakdown.total)}</span></div>
            </div>
            <Link to="/checkout"><Button className="w-full" size="lg">Proceed to Checkout</Button></Link>
          </div>
        </div>
      </div>
    </EShopLayout>
  );
};

export default CartPage;
