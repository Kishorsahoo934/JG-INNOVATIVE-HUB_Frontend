import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Heart, Share2, Play } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import ProductCard from '../components/ProductCard';
import SEO from '@/components/SEO';
import { productsApi, reviewsApi, type Review } from '../services/api';
import type { Product } from '../utils/products';
import { slugify } from '../utils/products';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ProductReviews from '@/components/ProductReviews';
import { formatPrice } from '@/utils/price';
import { isCustom3dProduct, CONTACT_US_3D_SKU } from '@/utils/productHelpers';
import { BRAND_LOGO, PLACEHOLDER_IMAGE } from '@/constants/media';
import {
  buildProductDetailJsonLdGraphString,
  filterApprovedReviews,
  mapReviewsForProductJsonLd,
} from '@/lib/productJsonLd';
import {
  buildProductMetaDescription,
  buildProductKeywords,
  buildProductSeoTitle,
} from '@/lib/seo';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [publicReviews, setPublicReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImagePaused, setIsImagePaused] = useState(false);
  const [isAddingContactUs, setIsAddingContactUs] = useState(false);
  const [longDescExpanded, setLongDescExpanded] = useState(false);
  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      setProduct(null);
      setPublicReviews([]);
      return;
    }
    let cancelled = false;
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setIsLoading(true);
    setProduct(null);
    setPublicReviews([]);

    const load = async () => {
      try {
        const [prodRes, revRes] = await Promise.all([
          productsApi.getById(id),
          reviewsApi.getByProduct(id).catch(() => null),
        ]);
        if (cancelled) return;
        if (prodRes.success && prodRes.data) {
          setProduct(prodRes.data);
        } else {
          setProduct(null);
        }
        const rawList = revRes && typeof revRes === 'object' && 'data' in revRes ? (revRes as { data?: Review[] }).data : undefined;
        const list = Array.isArray(rawList) ? rawList : [];
        setPublicReviews(filterApprovedReviews(list));
      } catch (error) {
        console.error('Failed to load product:', error);
        if (!cancelled) setProduct(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!product) return;
      try {
        const res = await productsApi.getAll();
        if (res.success) {
          const list = res.data;
          setRelatedProducts(
            list.filter((p) => p.category === product.category && p._id !== product._id).slice(0, 5)
          );
          setRecentProducts(list.slice(0, 5));
        }
      } catch (error) {
        console.error('Failed to load related products:', error);
      }
    };
    loadRelated();
  }, [product]);

  const mediaItems = useMemo(() => {
    if (!product) return [];
    const imgs = (product.images || []).map((url: string) => ({ type: 'image' as const, url }));
    const vids = (product.videos || []).map((url: string) => ({ type: 'video' as const, url }));
    return [...imgs, ...vids];
  }, [product]);

  useEffect(() => {
    if (currentImageIndex >= mediaItems.length && mediaItems.length > 0) {
      setCurrentImageIndex(0);
    }
  }, [mediaItems.length, currentImageIndex]);

  useEffect(() => {
    const current = mediaItems[currentImageIndex];
    const isVideo = current?.type === 'video';
    if (!product || mediaItems.length < 2 || isImagePaused || isVideo) return;
    const interval = window.setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length);
    }, 3000);
    return () => window.clearInterval(interval);
  }, [product, mediaItems, mediaItems.length, currentImageIndex, isImagePaused]);

  const productJsonLdGraph = useMemo(() => {
    if (!product) return null;
    const desc =
      product.shortDescription?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ||
      product.longDescription?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() ||
      '';
    const fromReviews = mapReviewsForProductJsonLd(publicReviews);
    return buildProductDetailJsonLdGraphString(
      {
        name: product.name,
        description: desc || product.name,
        image: product.images?.length ? product.images : [BRAND_LOGO],
        price: product.price,
        stock: product.stock,
        path: `/product/${product._id}`,
        sku: product.sku,
        productId: product._id,
        category: product.category,
        ...fromReviews,
      },
      [
        { name: 'Home', path: '/' },
        { name: 'E-Shop', path: '/eshop' },
        {
          name: product.category,
          path: `/eshop/products?category=${slugify(product.category)}`,
        },
        { name: product.name, path: `/product/${product._id}` },
      ]
    );
  }, [product, publicReviews]);

  if (!product && !isLoading) {
    return (
      <EShopLayout>
        <SEO title="Product not found" description="This product is unavailable or may have been removed." path="/eshop/products" noIndex />
        <div className="container mx-auto px-4 py-12 text-center max-w-xl">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product Not Found</h1>
          <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
            The item may have been removed or the link is outdated. Browse our E-Shop for microcontrollers, sensors, motors,
            power supplies and IoT boards — we ship across India from Bhubaneswar, Odisha.
          </p>
          <Link to="/eshop/products" className="text-primary hover:underline font-medium inline-block min-h-[44px]">
            View all products
          </Link>
        </div>
      </EShopLayout>
    );
  }

  if (!product && isLoading && id) {
    return (
      <EShopLayout>
        <SEO
          title="Product details"
          description="Browse specifications and buy electronics, robotics and IoT parts online at Innovative Hub — trusted by students and makers in Odisha and across India."
          path={`/product/${id}`}
        />
        <div className="container mx-auto px-3 sm:px-4 pb-8 max-w-full">
          <nav
            className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground mb-6"
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-foreground min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md">
              Home
            </Link>
            <span className="text-muted-foreground/80" aria-hidden>
              /
            </span>
            <Link to="/eshop" className="hover:text-foreground min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md">
              E-Shop
            </Link>
            <span className="text-muted-foreground/80" aria-hidden>
              /
            </span>
            <span className="text-foreground font-medium min-h-[44px] inline-flex items-center">Product</span>
          </nav>
          <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-3">Product details</h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mb-8 leading-relaxed">
            Loading this product from Innovative Hub. You will see images, price, stock, technical description and verified
            buyer reviews. We stock Arduino-compatible boards, Raspberry Pi accessories, sensors, motor drivers, batteries and
            wireless modules for robotics and embedded projects.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-busy="true">
            <div className="aspect-square rounded-xl bg-muted/50 animate-pulse min-h-[200px]" />
            <div className="space-y-4">
              <div className="h-8 bg-muted/60 rounded animate-pulse w-3/4 max-w-md" />
              <div className="h-4 bg-muted/50 rounded animate-pulse max-w-sm" />
              <div className="h-10 bg-muted/50 rounded animate-pulse w-1/2 max-w-xs" />
            </div>
          </div>
        </div>
      </EShopLayout>
    );
  }

  if (!product) {
    return null;
  }

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/eshop/products?search=${encodeURIComponent(value.trim())}`);
    }
  };

  const discount = product.mrp > 0 ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const inWishlist = isInWishlist(product._id);
  const inCart = isInCart(product._id);
  const cartQty = getQuantity(product._id);
  const stockStatus = (() => {
    if (product.stock <= 0) return { label: 'Out of stock', color: 'bg-destructive' };
    if (product.stock < 5) return { label: `Low stock (${product.stock})`, color: 'bg-destructive' };
    if (product.stock <= 10) return { label: `Limited stock (${product.stock})`, color: 'bg-yellow-500' };
    return { label: `In stock (${product.stock})`, color: 'bg-green-500' };
  })();
  const isCustom3d = isCustom3dProduct(product);

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

  const rawLong = product.longDescription?.trim() || '';
  const hasHtml = /<\/?[a-z][\s\S]*>/i.test(rawLong);
  const formattedLongHtml = (() => {
    if (hasHtml) return rawLong;
    const lines = rawLong
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    if (lines.length === 0) return '';
    const listLines = lines.filter((line) => /^(?:[-*•]|\d+\.)\s+/.test(line));
    const looksLikeList = listLines.length >= 2 && listLines.length / lines.length >= 0.6;
    if (looksLikeList) {
      const items = lines.map((line) => line.replace(/^(?:[-*•]|\d+\.)\s+/, ''));
      return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    }
    const singleLine = lines.length === 1 ? lines[0] : '';
    if (singleLine) {
      const cleaned = singleLine.replace(/^Applications:\s*/i, '').trim();
      const toSplits = cleaned.split(/(?=To\s)/i).map((part) => part.trim()).filter(Boolean);
      const bulletSplits =
        toSplits.length > 1
          ? toSplits
          : cleaned
              .split(/[•;]+/)
              .map((part) => part.trim())
              .filter(Boolean);
      if (bulletSplits.length >= 3) {
        return `<ul>${bulletSplits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      }
    }
    return lines.map((line) => `<p>${escapeHtml(line)}</p>`).join('');
  })();

  const handleAddToCart = () => {
    if (product.stock > 0 && quantity > product.stock) {
      toast({ title: 'Not enough stock', description: 'Please reduce the quantity.', variant: 'destructive' });
      return;
    }
    addToCart(product, quantity);
    toast({ title: 'Added to cart', description: `${quantity} × ${product.name}` });
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) {
      toast({ title: 'Out of stock', description: 'This product is currently unavailable.', variant: 'destructive' });
      return;
    }
    if (product.stock > 0 && quantity > product.stock) {
      toast({ title: 'Not enough stock', description: 'Please reduce the quantity.', variant: 'destructive' });
      return;
    }
    sessionStorage.setItem('buyNowItem', JSON.stringify({ product, quantity }));
    navigate('/checkout');
  };

  const handleContactUs3d = async () => {
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

  const handleWishlistToggle = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const productImage = product.images[0] || BRAND_LOGO;

  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={handleSearchChange}>
      <SEO
        title={buildProductSeoTitle(product.name, product.category)}
        description={buildProductMetaDescription({
          name: product.name,
          shortDescription: product.shortDescription,
          longDescription: product.longDescription,
          category: product.category,
        })}
        keywords={buildProductKeywords({
          name: product.name,
          category: product.category,
          subcategory: product.subcategory,
          sku: product.sku,
        })}
        image={productImage.startsWith('http') ? productImage : productImage}
        path={`/product/${product._id}`}
        ogType="product"
        jsonLd={productJsonLdGraph ? [productJsonLdGraph] : undefined}
      />
      <div className="container mx-auto px-3 sm:px-4 pb-8 sm:pb-12 max-w-full">
        {/* Breadcrumb — touch-friendly on mobile */}
        <nav
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground mb-4 sm:mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-foreground min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md touch-manipulation shrink-0"
          >
            Home
          </Link>
          <span className="text-muted-foreground/80 shrink-0" aria-hidden>
            /
          </span>
          <Link
            to="/eshop"
            className="hover:text-foreground min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md touch-manipulation shrink-0"
          >
            E-Shop
          </Link>
          <span className="text-muted-foreground/80 shrink-0" aria-hidden>
            /
          </span>
          <Link
            to={`/eshop/products?category=${slugify(product.category)}`}
            className="hover:text-foreground min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md touch-manipulation max-w-[min(100%,12rem)] truncate"
          >
            {product.category}
          </Link>
          <span className="text-muted-foreground/80 shrink-0" aria-hidden>
            /
          </span>
          <span className="text-foreground font-medium min-h-[44px] inline-flex items-center max-w-[min(100%,10rem)] sm:max-w-[14rem] truncate">
            {product.name}
          </span>
        </nav>

        {/* Product Section */}
        <div className="bg-secondary/20 rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-6 lg:p-8 mb-8 sm:mb-12 max-w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Image + Video Gallery (same scrolling, side by side) */}
            <div className="relative">
              <div
                className="aspect-square bg-background rounded-xl overflow-hidden flex items-center justify-center"
                onMouseEnter={() => setIsImagePaused(true)}
                onMouseLeave={() => setIsImagePaused(false)}
                onTouchStart={() => setIsImagePaused(true)}
                onTouchEnd={() => setIsImagePaused(false)}
              >
                {mediaItems.length === 0 && (
                  <img src={PLACEHOLDER_IMAGE} alt={product.name} className="w-full h-full object-contain p-4 sm:p-8" />
                )}
                {mediaItems.length > 0 && (() => {
                  const current = mediaItems[currentImageIndex];
                  if (!current) return <img src={PLACEHOLDER_IMAGE} alt={product.name} className="w-full h-full object-contain p-4 sm:p-8" />;
                  if (current.type === 'image') {
                    return (
                      <img
                        src={current.url || PLACEHOLDER_IMAGE}
                        alt={product.name}
                        width={600}
                        height={600}
                        className="w-full h-full object-contain p-4 sm:p-8"
                        loading={currentImageIndex === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                        fetchPriority={currentImageIndex === 0 ? 'high' : undefined}
                      />
                    );
                  }
                  const isDirectVideo = /\.(mp4|webm|mov|ogg|m4v)(\?|$)/i.test(current.url) || /video\/|\.googlevideo\.com/i.test(current.url);
                  if (isDirectVideo) {
                    return (
                      <video
                        src={current.url}
                        controls
                        playsInline
                        className="w-full h-full object-contain p-4 sm:p-8 max-h-full"
                        style={{ aspectRatio: 'auto' }}
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    );
                  }
                  return (
                    <button
                      type="button"
                      onClick={() => window.open(current.url, '_blank', 'noopener')}
                      className="w-full h-full flex flex-col items-center justify-center gap-2 bg-muted/50 hover:bg-muted transition-colors p-4 sm:p-8"
                    >
                      <Play className="w-12 h-12 sm:w-16 sm:h-16 text-primary shrink-0" />
                      <span className="text-sm font-medium text-foreground">Click to play video</span>
                    </button>
                  );
                })()}
              </div>

              {/* Navigation Arrows */}
              {mediaItems.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full shadow-lg transition-colors"
                    aria-label="Previous"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-background/80 hover:bg-background rounded-full shadow-lg transition-colors"
                    aria-label="Next"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Thumbnails (images + videos) */}
              {mediaItems.length > 1 && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-colors flex items-center justify-center ${
                        currentImageIndex === idx ? 'border-primary' : 'border-transparent'
                      }`}
                    >
                      {item.type === 'image' ? (
                        <img src={item.url || PLACEHOLDER_IMAGE} alt={`${product.name} ${idx + 1}`} width={64} height={64} className="w-full h-full object-contain" loading="lazy" decoding="async" />
                      ) : (
                        <span className="bg-muted flex items-center justify-center w-full h-full">
                          <Play className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground break-words">
                  {product.name}
                </h1>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 min-h-[44px] min-w-[44px] touch-manipulation"
                  onClick={async () => {
                    const url = window.location.href;
                    try {
                      if (navigator.share) {
                        await navigator.share({ title: product.name, url });
                      } else if (navigator.clipboard) {
                        await navigator.clipboard.writeText(url);
                        toast({ title: 'Link copied', description: 'Share link copied to clipboard.' });
                      }
                    } catch (err) {
                      console.error('Share failed', err);
                    }
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Notes */}
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-2">QUICK NOTES:</p>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground"
                  dangerouslySetInnerHTML={{ __html: formattedShortHtml }}
                />
              </div>

              {/* Price */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-foreground">₹{formatPrice(product.price)}</span>
                  {product.mrp > product.price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">₹{formatPrice(product.mrp)}</span>
                      <span className="text-lg text-green-500 font-medium">{discount}% off</span>
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">Price (Excluding GST)</p>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className={`inline-block w-2 h-2 rounded-full ${stockStatus.color}`} />
                  <span>{stockStatus.label}</span>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center border border-border rounded-lg">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation rounded-l-lg"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-3 sm:px-4 text-base sm:text-lg font-medium min-w-[2.5rem] text-center">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const maxQty = product.stock > 0 ? product.stock : quantity + 1;
                      setQuantity(Math.min(maxQty, quantity + 1));
                    }}
                    className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary active:bg-secondary/80 transition-colors touch-manipulation rounded-r-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {isCustom3d ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Pay for order to open Contact Us — then we&apos;ll share instructions and contact number.
                  </p>
                  <Button size="lg" className="w-full min-h-[48px] touch-manipulation" onClick={handleContactUs3d} disabled={isAddingContactUs}>
                    {isAddingContactUs ? 'Opening checkout…' : 'Pay for order — Contact us for Custom 3D Printing'}
                  </Button>
                </div>
              ) : inCart && cartQty > 0 ? (
                <div className="flex flex-col gap-3">
                  <p className="text-sm text-muted-foreground">
                    In your cart: <span className="font-semibold text-foreground">{cartQty}</span> in cart
                  </p>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center border border-border rounded-lg w-full sm:w-auto justify-center">
                      <button
                        type="button"
                        onClick={() => updateQuantity(product._id, cartQty - 1)}
                        className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center hover:bg-secondary rounded-l-lg touch-manipulation"
                        aria-label="Decrease quantity in cart"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 text-lg font-medium min-w-[3rem] text-center tabular-nums">{cartQty}</span>
                      <button
                        type="button"
                        onClick={() => {
                          const maxQty = product.stock > 0 ? product.stock : cartQty + 1;
                          if (cartQty >= maxQty) {
                            toast({ title: 'Stock limit', description: 'Cannot add more of this item.', variant: 'destructive' });
                            return;
                          }
                          updateQuantity(product._id, cartQty + 1);
                        }}
                        className="p-3 min-h-[48px] min-w-[48px] flex items-center justify-center hover:bg-secondary rounded-r-lg touch-manipulation"
                        aria-label="Increase quantity in cart"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <Button type="button" size="lg" variant="secondary" className="min-h-[48px] w-full sm:w-auto" asChild>
                      <Link to="/cart">View cart</Link>
                    </Button>
                    <Button type="button" size="lg" className="flex-1 min-h-[48px] touch-manipulation w-full sm:flex-1" onClick={handleBuyNow}>
                      Buy now
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    size="lg"
                    className="flex-1 gap-2 min-h-[48px] touch-manipulation w-full"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-5 h-5 shrink-0" />
                    Add to cart
                  </Button>
                  <Button type="button" size="lg" className="flex-1 min-h-[48px] touch-manipulation w-full" onClick={handleBuyNow}>
                    Buy now
                  </Button>
                </div>
              )}

              {/* Secondary Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                <button
                  type="button"
                  onClick={handleWishlistToggle}
                  className={`flex items-center gap-2 text-sm min-h-[44px] touch-manipulation py-2 ${inWishlist ? 'text-destructive' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  <Heart className={`w-4 h-4 shrink-0 ${inWishlist ? 'fill-current' : ''}`} />
                  {inWishlist ? 'Wishlisted' : 'Add to wishlist'}
                </button>
                <span className="text-sm text-muted-foreground">
                  SKU: <span className="font-medium">{product.sku}</span>
                </span>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Payment Methods:</span>
                <span className="font-medium text-foreground">Razorpay</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description Section */}
        <section className="mb-12">
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Description</h2>
          <div className="prose prose-invert max-w-none prose-p:leading-relaxed prose-li:my-1 prose-strong:text-foreground prose-a:text-primary">
            <h3 className="text-base sm:text-lg font-semibold text-foreground mb-4">{product.name.split('|')[0]}</h3>
            <div className="relative">
              <div
                className={`text-muted-foreground whitespace-pre-line transition-[max-height] duration-200 ${
                  longDescExpanded ? 'max-h-none' : 'max-h-40 sm:max-h-48 overflow-hidden'
                }`}
                dangerouslySetInnerHTML={{ __html: formattedLongHtml }}
              />
              {!longDescExpanded && formattedLongHtml.length > 320 && (
                <div
                  className="pointer-events-none absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent rounded-b-lg"
                  aria-hidden
                />
              )}
            </div>
          </div>
          {formattedLongHtml.length > 320 && (
            <button
              type="button"
              className="mt-3 text-sm font-medium text-primary hover:underline touch-manipulation min-h-[44px] px-1 -ml-1"
              onClick={() => setLongDescExpanded((e) => !e)}
            >
              {longDescExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </section>

        {/* Specifications */}
        {product.specifications && Object.keys(product.specifications).length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Specifications</h2>
            <div className="bg-secondary/20 rounded-xl p-6 overflow-x-auto">
              <table className="w-full min-w-[360px]">
                <tbody>
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <tr key={key} className="border-b border-border last:border-0">
                      <td className="py-3 text-muted-foreground font-medium w-1/3">{key}</td>
                      <td className="py-3 text-foreground">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Reviews & Comments */}
        <ProductReviews productId={product._id} />

        {/* Datasheet */}
        {product.datasheet && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Datasheet of {product.name.split(' ')[0]}</h2>
            <div className="bg-secondary/20 rounded-xl p-6">
              <p className="text-muted-foreground">
                {product.datasheet} - This is the filler text to be filled in the line inf for need it and it may need.
              </p>
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Related Products</h2>
              <Link
                to={`/eshop/products?category=${encodeURIComponent(slugify(product.category))}`}
                className="text-sm text-primary hover:underline"
              >
                VIEW SIMILAR
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </section>
        )}

        {/* Recently Viewed */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">Recently Viewed</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {recentProducts.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      </div>
    </EShopLayout>
  );
};

export default ProductDetailPage;
