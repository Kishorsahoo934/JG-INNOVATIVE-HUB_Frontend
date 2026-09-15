import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, Phone, Clock, FileText, Share2, Tag, Server, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import SEO from '@/components/SEO';
import EShopLayout from '../components/EShopLayout';
import { developedProductsApi, DevelopedProduct } from '../services/api';
import { PLACEHOLDER_IMAGE } from '@/constants/media';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const DevelopedProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<DevelopedProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await developedProductsApi.getById(id);
        if (res.success && res.data) {
          setProduct(res.data);
        }
      } catch (err) {
        console.error('Failed to load developed product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Link Copied',
          description: 'Product link has been copied to your clipboard.',
        });
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  if (isLoading) {
    return (
      <EShopLayout hideSearch>
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <Skeleton className="h-8 w-48 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            <Skeleton className="aspect-square rounded-2xl w-full" />
            <div className="space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full max-w-xs" />
            </div>
          </div>
        </div>
      </EShopLayout>
    );
  }

  if (!product) {
    return (
      <EShopLayout hideSearch>
        <div className="container mx-auto px-4 py-32 text-center max-w-lg">
          <Server className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h2>
          <p className="text-muted-foreground mb-8">The product development case study you are looking for does not exist or has been removed.</p>
          <Button asChild>
            <Link to="/product-development">Back to Product Development</Link>
          </Button>
        </div>
      </EShopLayout>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [{ url: PLACEHOLDER_IMAGE, publicId: '' }];

  return (
    <EShopLayout hideSearch>
      <SEO
        title={`${product.name} | Product Development`}
        description={product.description}
        path={`/product-development/${product._id}`}
        image={images[0].url}
      />
      
      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-6xl">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground inline-flex items-center">Home</Link>
          <span className="text-muted-foreground/80">/</span>
          <Link to="/product-development" className="hover:text-foreground inline-flex items-center">Product Development</Link>
          <span className="text-muted-foreground/80">/</span>
          <span className="text-foreground font-medium truncate max-w-[200px] sm:max-w-xs">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-video sm:aspect-[4/3] bg-secondary/20 rounded-2xl overflow-hidden border border-border flex items-center justify-center p-4 relative group">
              <img
                src={images[activeImage].url}
                alt={product.name}
                className="w-full h-full object-cover sm:object-contain rounded-xl"
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge className="bg-primary/95 text-black border-none text-[10px] uppercase tracking-wider font-semibold">
                  {product.tag}
                </Badge>
                {product.status !== 'Available' && (
                  <Badge variant="secondary" className="bg-orange-500/90 text-white border-none text-[10px] uppercase font-semibold">
                    {product.status}
                  </Badge>
                )}
              </div>
              <Button
                variant="secondary"
                size="icon"
                className="absolute top-4 right-4 rounded-full bg-background/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity text-foreground hover:bg-background"
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
            
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${
                      activeImage === idx ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Key Details & Inquiry */}
          <div className="lg:col-span-5 flex flex-col">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground mb-4 leading-tight">
              {product.name}
            </h1>
            
            <p className="text-base text-muted-foreground mb-6 leading-relaxed">
              {product.description}
            </p>

            {product.features && product.features.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" /> Key Features
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.features.map((feat) => (
                    <Badge key={feat} variant="outline" className="px-3 py-1.5 bg-secondary/20 text-foreground border-border/50 text-xs font-medium">
                      {feat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card/40 border border-border/60 rounded-2xl p-6 sm:p-8 mt-auto shadow-sm">
              <h3 className="text-lg font-bold text-foreground mb-2">Build Something Similar</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Need a custom hardware solution tailored to your specific requirements? Our engineering team is ready to help.
              </p>
              
              <div className="space-y-3">
                <Button className="w-full h-12 text-base font-bold gap-2" asChild>
                  <a href={`mailto:supportinnovativehub@gmail.com?subject=Inquiry about ${product.name}`}>
                    <Mail className="w-5 h-5" />
                    Request a Consultation
                  </a>
                </Button>
                <Button variant="outline" className="w-full h-12 text-base font-bold gap-2" asChild>
                  <a href="tel:+917008596498">
                    <Phone className="w-5 h-5" />
                    Talk to an Engineer
                  </a>
                </Button>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Research / Long Description Section */}
        {product.longDescription && (
          <div className="mt-12 lg:mt-20 max-w-4xl">
            <div className="flex items-center gap-3 mb-6 border-b border-border pb-4">
              <FileText className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-bold text-foreground">Detailed Research & Specifications</h2>
            </div>
            
            <div 
              className="prose prose-sm sm:prose-base dark:prose-invert prose-p:text-muted-foreground prose-headings:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-strong:text-foreground max-w-none"
              dangerouslySetInnerHTML={{ __html: product.longDescription }}
            />
          </div>
        )}
        
      </div>
    </EShopLayout>
  );
};

export default DevelopedProductDetailPage;

