import { ShoppingCart, Heart, ChevronLeft, ChevronRight, Minus, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Product } from '../utils/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/price';
import { isCustom3dProduct, CONTACT_US_3D_SKU } from '@/utils/productHelpers';
import { productsApi } from '../services/api';
import { PLACEHOLDER_IMAGE } from '@/constants/media';

interface QuickViewModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal = ({ product, isOpen, onClose }: QuickViewModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isAddingContactUs, setIsAddingContactUs] = useState(false);
  const autoSlideRef = useRef<number | null>(null);
  const navigate = useNavigate();
  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const stockStatus = (() => {
    if (product.stock <= 0) return { label: 'Out of stock', color: 'bg-destructive' };
    if (product.stock < 5) return { label: `Low stock (${product.stock})`, color: 'bg-destructive' };
    if (product.stock <= 10) return { label: `Limited stock (${product.stock})`, color: 'bg-yellow-500' };
    return { label: `In stock (${product.stock})`, color: 'bg-green-500' };
  })();
  const isCustom3d = isCustom3dProduct(product);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast({ title: 'Out of stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    addToCart(product, 1);
    toast({ title: 'Added to cart', description: product.name });
  };

  const qvQty = getQuantity(product._id);

  const handleContactUs3d = async () => {
    setIsAddingContactUs(true);
    try {
      const res = await productsApi.getById(CONTACT_US_3D_SKU);
      if (res.success && res.data) {
        onClose();
        sessionStorage.setItem('buyNowItem', JSON.stringify({ product: res.data, quantity: 1 }));
        navigate('/checkout');
      } else {
        toast({ title: 'Error', description: 'Could not open checkout. Try again.', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not open checkout. Try again.', variant: 'destructive' });
    } finally {
      setIsAddingContactUs(false);
    }
  };

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    setCurrentImageIndex(0);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || product.images.length < 2 || isPaused) return;
    autoSlideRef.current = window.setInterval(() => {
      nextImage();
    }, 3000);
    return () => {
      if (autoSlideRef.current) window.clearInterval(autoSlideRef.current);
    };
  }, [isOpen, product.images.length, isPaused]);

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

  const rawShort = product.shortDescription?.trim() || '';
  const shortHasHtml = /<\/?[a-z][\s\S]*>/i.test(rawShort);
  const formattedShortHtml = (() => {
    if (!rawShort) return '';
    if (shortHasHtml) return rawShort;
    return rawShort
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => `<p>${escapeHtml(line)}</p>`)
      .join('');
  })();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl p-0 overflow-hidden max-h-[85vh]">
        <DialogTitle className="sr-only">{product.name} - Quick View</DialogTitle>
        <div className="flex flex-col md:flex-row max-h-[85vh] overflow-y-auto">
          {/* Image Section */}
          <div
            className="relative w-full md:w-1/2 aspect-square bg-secondary/30"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
          >
            <img
              src={product.images[currentImageIndex] || PLACEHOLDER_IMAGE}
              alt={product.name}
              width={400}
              height={400}
              className="w-full h-full object-contain p-6"
              loading="lazy"
              decoding="async"
            />
            
            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full transition-colors"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            
            {/* Image Dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 inset-x-0 flex justify-center gap-2">
                {product.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      currentImageIndex === idx ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                    }`}
                  />
                ))}
              </div>
            )}
            
            {/* Discount Badge */}
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-sm font-semibold px-3 py-1 rounded">
                {discount}% OFF
              </div>
            )}
          </div>
          
          {/* Content Section */}
          <div className="w-full md:w-1/2 p-6 flex flex-col">
            <h2 className="text-xl font-bold text-foreground mb-2">
              {product.name}
            </h2>
            
            {/* Quick Notes */}
            <div className="text-sm text-muted-foreground mb-4">
              <p className="font-medium text-foreground mb-2">Quick Notes</p>
              <div
                className="prose prose-sm max-w-none text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: formattedShortHtml }}
              />
            </div>
            
            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl font-bold text-primary">₹{formatPrice(product.price)}</span>
              {product.mrp > product.price && (
                <>
                  <span className="text-lg text-muted-foreground line-through">₹{formatPrice(product.mrp)}</span>
                  <span className="text-sm text-green-500 font-medium">{discount}% off</span>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">Price (Excluding GST)</p>

            {/* Stock Status */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
              <span className={`inline-block w-2 h-2 rounded-full ${stockStatus.color}`} />
              <span>{stockStatus.label}</span>
            </div>
            
            {/* SKU */}
            <p className="text-xs text-muted-foreground mb-6 text-right">
              SKU: <span className="font-medium">{product.sku}</span>
            </p>
            
            {/* Action Buttons */}
            {isCustom3d ? (
              <div className="space-y-3 mt-auto">
                <p className="text-xs text-muted-foreground">
                  Pay for order to open Contact Us
                </p>
                <Button className="w-full" onClick={handleContactUs3d} disabled={isAddingContactUs}>
                  {isAddingContactUs ? 'Opening…' : 'Pay for order — Contact us for Custom 3D Printing'}
                </Button>
              </div>
            ) : inCart && qvQty > 0 ? (
              <div className="flex flex-col gap-3 mt-auto">
                <div className="flex items-center border border-border rounded-lg justify-center">
                  <button
                    type="button"
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-l-lg touch-manipulation"
                    onClick={() => updateQuantity(product._id, qvQty - 1)}
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 font-medium tabular-nums min-w-[2.5rem] text-center">{qvQty}</span>
                  <button
                    type="button"
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-r-lg touch-manipulation disabled:opacity-50"
                    disabled={product.stock > 0 && qvQty >= product.stock}
                    onClick={() => {
                      if (product.stock > 0 && qvQty >= product.stock) return;
                      updateQuantity(product._id, qvQty + 1);
                    }}
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" asChild>
                    <Link to="/cart">View cart</Link>
                  </Button>
                  <Button
                    variant="outline"
                    className={`gap-2 shrink-0 ${inWishlist ? 'text-destructive border-destructive' : ''}`}
                    onClick={handleWishlistToggle}
                  >
                    <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3 mt-auto">
                <Button className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingCart className="w-4 h-4" />
                  Add to cart
                </Button>
                <Button
                  variant="outline"
                  className={`gap-2 ${inWishlist ? 'text-destructive border-destructive' : ''}`}
                  onClick={handleWishlistToggle}
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
                  {inWishlist ? 'Wishlisted' : 'Wishlist'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickViewModal;
