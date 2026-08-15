import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '@/hooks/use-toast';
import { formatPrice } from '@/utils/price';
import { PLACEHOLDER_IMAGE } from '@/constants/media';

const WishlistPage = () => {
  const { items, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  if (items.length === 0) {
  return (
    <Layout>
      <SEO title="My Wishlist" description="Save your favorite Innovative Hub products for later." path="/wishlist" noIndex />
      <div className="network-bg py-10 sm:py-16 md:py-24">
        <div className="container mx-auto px-3 sm:px-4 max-w-full">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              My Wishlist
            </h1>
            <p className="text-muted-foreground mb-8">
              Save your favorite products here for easy access later.
            </p>

            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 sm:p-8">
              <p className="text-muted-foreground mb-6">
                Your wishlist is empty. Browse our products and add items you love!
              </p>
              <Link to="/eshop">
                <Button className="rounded-lg min-h-[48px] touch-manipulation w-full sm:w-auto">
                  Explore Products
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
  }

  const handleAddToCart = (e: React.MouseEvent, product: typeof items[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) {
      toast({ title: 'Out of stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    addToCart(product);
    toast({ title: 'Added to cart', description: `${product.name} has been added to your cart.` });
  };

  const handleRemove = (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist(productId);
    toast({ title: 'Removed', description: 'Item removed from wishlist.' });
  };

  return (
    <Layout>
      <SEO title="My Wishlist" description="Your saved products at Innovative Hub." path="/wishlist" noIndex />
      <div className="network-bg py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-full">
          <div className="flex items-center gap-3 mb-4 sm:mb-6">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">My Wishlist</h1>
            <Link to="/cart" className="ml-auto">
              <Button type="button" variant="outline" className="min-h-[44px]">
                Go to Cart
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {items.map((product) => {
              const shortDescriptionPreview = product.shortDescription
                .replace(/<[^>]*>/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
              return (
              <div key={product._id} className="bg-card border border-border rounded-xl p-3 sm:p-4 flex flex-col">
                <Link to={`/product/${product._id}`} className="flex gap-3 sm:gap-4 min-w-0">
                  <img
                    src={product.images[0] || PLACEHOLDER_IMAGE}
                    alt={product.name}
                    width={80}
                    height={80}
                    className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 object-contain bg-secondary/30 rounded-lg"
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm sm:text-base line-clamp-2">{product.name}</p>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{shortDescriptionPreview}</p>
                    <p className="text-primary font-semibold mt-1 text-sm sm:text-base">₹{formatPrice(product.price)}</p>
                  </div>
                </Link>

                <div className="mt-4 flex flex-col sm:flex-row gap-2">
                  <Button
                    type="button"
                    className="flex-1 gap-2 min-h-[48px] touch-manipulation w-full"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <ShoppingCart className="w-4 h-4 shrink-0" />
                    Add to Cart
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="gap-2 min-h-[48px] touch-manipulation w-full sm:w-auto"
                    onClick={(e) => handleRemove(e, product._id)}
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    Remove
                  </Button>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default WishlistPage;
