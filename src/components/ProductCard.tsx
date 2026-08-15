import { useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Heart, Eye, Minus, Plus } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '../utils/products';
import { formatPrice } from '@/utils/price';
import { isCustom3dProduct, CONTACT_US_3D_SKU } from '@/utils/productHelpers';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import QuickViewModal from './QuickViewModal';
import { useToast } from '@/hooks/use-toast';
import { productsApi } from '../services/api';
import { PLACEHOLDER_IMAGE } from '@/constants/media';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAddingContactUs, setIsAddingContactUs] = useState(false);
  const navigate = useNavigate();
  
  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inWishlist = isInWishlist(product._id);
  const stockStatus = (() => {
    if (product.stock <= 0) return { label: 'Out of stock', color: 'bg-destructive' };
    if (product.stock < 5) return { label: `Low stock (${product.stock})`, color: 'bg-destructive' };
    if (product.stock <= 10) return { label: `Limited stock (${product.stock})`, color: 'bg-yellow-500' };
    return { label: `In stock (${product.stock})`, color: 'bg-green-500' };
  })();
  const isCustom3d = isCustom3dProduct(product);
  const shortDescriptionPreview = (product.shortDescription ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast({ title: 'Out of stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    addToCart(product, 1);
    toast({ title: 'Added to cart', description: product.name });
  };

  const cardCartQty = getQuantity(product._id);

  const handleContactUs3d = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAddingContactUs(true);
    try {
      const res = await productsApi.getById(CONTACT_US_3D_SKU);
      if (res.success && res.data) {
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

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleNavigate = () => {
    if (product._id) {
      navigate(`/product/${product._id}`);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast({ title: 'Out of stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    sessionStorage.setItem('buyNowItem', JSON.stringify({ product, quantity: 1 }));
    navigate('/checkout');
  };

  return (
    <>
      <div 
        className="group bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/30 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setCurrentImageIndex(0); }}
        onClick={handleNavigate}
      >
        {/* Image Container */}
        <div className="relative aspect-square bg-secondary/30 overflow-hidden">
          <img
            src={product.images[currentImageIndex] || PLACEHOLDER_IMAGE}
            alt={product.name}
            width={400}
            height={400}
            className="w-full h-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
            
          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-xs font-semibold px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}
            
          {/* Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
              inWishlist 
                ? 'bg-destructive text-destructive-foreground' 
                : 'bg-background/80 hover:bg-background text-muted-foreground hover:text-destructive'
            }`}
          >
            <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
          </button>
            
          {/* Quick View Button - shows on hover */}
          <div className={`absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-background/90 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full gap-2"
              onClick={handleQuickView}
            >
              <Eye className="w-4 h-4" />
              Quick View
            </Button>
          </div>
            
          {/* Image Dots - shows on hover if multiple images */}
          {product.images.length > 1 && isHovered && (
            <div className="absolute bottom-16 inset-x-0 flex justify-center gap-1">
              {product.images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentImageIndex(idx); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    currentImageIndex === idx ? 'bg-primary w-4' : 'bg-muted-foreground/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
          
        {/* Product Info */}
        <div className="p-2 sm:p-4 space-y-1 sm:space-y-2">
          <h3 className="text-xs sm:text-sm font-medium text-foreground line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem]">
            {product.name}
          </h3>
          <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">
            {shortDescriptionPreview}
          </p>
            
          {/* Price */}
          <div className="flex items-center gap-1 sm:gap-2 pt-0.5 sm:pt-1">
            <span className="text-sm sm:text-base font-bold text-primary">₹{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <span className="text-[10px] sm:text-sm text-muted-foreground line-through">₹{formatPrice(product.mrp)}</span>
            )}
          </div>

          {/* Stock Status */}
          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
            <span className={`inline-block w-2 h-2 rounded-full ${stockStatus.color}`} />
            <span>{stockStatus.label}</span>
          </div>
            
          {/* Add to Cart Button */}
          {isCustom3d ? (
            <>
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                Custom pricing depends on design & material
              </p>
              <Button
                size="sm"
                className="w-full mt-2 text-xs sm:text-sm h-8 sm:h-9"
                onClick={handleContactUs3d}
                disabled={isAddingContactUs}
              >
                {isAddingContactUs ? 'Opening…' : 'Pay for order — Contact us'}
              </Button>
            </>
          ) : isInCart(product._id) && cardCartQty > 0 ? (
            <div className="mt-1 sm:mt-2 space-y-2" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center border border-border rounded-lg justify-center h-8 sm:h-9">
                <button
                  type="button"
                  className="px-2 py-1 min-w-[36px] flex items-center justify-center hover:bg-secondary rounded-l-md touch-manipulation"
                  onClick={(e) => {
                    e.stopPropagation();
                    updateQuantity(product._id, cardCartQty - 1);
                  }}
                  aria-label="Decrease quantity"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-2 text-xs sm:text-sm font-medium tabular-nums min-w-[1.5rem] text-center">{cardCartQty}</span>
                <button
                  type="button"
                  className="px-2 py-1 min-w-[36px] flex items-center justify-center hover:bg-secondary rounded-r-md touch-manipulation disabled:opacity-50"
                  disabled={product.stock > 0 && cardCartQty >= product.stock}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (product.stock > 0 && cardCartQty >= product.stock) return;
                    updateQuantity(product._id, cardCartQty + 1);
                  }}
                  aria-label="Increase quantity"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
              <Button size="sm" variant="outline" className="w-full h-8 sm:h-9 text-xs" asChild>
                <Link to="/cart" onClick={(e) => e.stopPropagation()}>
                  View cart
                </Link>
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="w-full gap-1 text-xs sm:text-sm h-8 sm:h-9"
                onClick={handleBuyNow}
              >
                Buy now
              </Button>
            </div>
          ) : (
            <>
              <Button
                size="sm"
                className="w-full mt-1 sm:mt-2 gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                Add to cart
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="w-full mt-2 gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9"
                onClick={handleBuyNow}
              >
                Buy now
              </Button>
            </>
          )}
        </div>
      </div>
      
      <QuickViewModal 
        product={product}
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
      />
    </>
  );
};

export default ProductCard;
