import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Cpu, Zap, CircuitBoard, Layers, Battery, Wifi, Settings, Box, ToggleRight, Monitor, LayoutGrid, Activity, Volume2, Plane, Wrench, Package } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import ProductCard from '../components/ProductCard';
import SEO from '@/components/SEO';
import { ProductSkeletonGrid, CategorySkeletonGrid } from '../components/ProductSkeleton';
import { productsApi } from '../services/api';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../utils/products';
import { slugify } from '../utils/products';

const HOME_SEARCH_PREVIEW_LIMIT = 24;

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cpu, Zap, CircuitBoard, Layers, Battery, Wifi, Settings, Box, ToggleRight, Monitor, LayoutGrid, Activity, Volume2, Plane, Wrench, Package
};

interface EShopHomePageProps {
  /** When true, render inside main site Layout (no EShop header) so nav stays consistent */
  useMainLayout?: boolean;
}

const EShopHomePage = ({ useMainLayout = false }: EShopHomePageProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { categories } = useCategories();

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const res = await productsApi.getAll();
        if (res.success) {
          setProducts(res.data);
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return products;
    const name = (p: Product) => (p.name ?? '').toLowerCase();
    const desc = (p: Product) => (p.shortDescription ?? '').toLowerCase();
    const cat = (p: Product) => (p.category ?? '').toLowerCase();
    const matchesToken = (p: Product, token: string) =>
      name(p).includes(token) || desc(p).includes(token) || cat(p).includes(token);
    const words = q.split(/\s+/).filter((w) => w.length >= 2);
    if (words.length > 0) {
      const base = products.filter((p) => words.every((word) => matchesToken(p, word)));
      const scoreProduct = (product: Product) => {
        const productName = name(product);
        const productCategory = cat(product);
        const productDesc = desc(product);
        let score = 0;
        for (const w of words) {
          if (productName.startsWith(w)) score += 10;
          else if (productName.includes(w)) score += 7;
          if (productCategory.includes(w)) score += 3;
          if (productDesc.includes(w)) score += 2;
        }
        return score;
      };
      return base.sort((a, b) => scoreProduct(b) - scoreProduct(a));
    }
    const base = products.filter((p) => matchesToken(p, q));
    return base.sort((a, b) => {
      const nameA = name(a);
      const nameB = name(b);
      const scoreA = (nameA.startsWith(q) ? 10 : nameA.includes(q) ? 7 : 0) + (cat(a).includes(q) ? 3 : 0) + (desc(a).includes(q) ? 2 : 0);
      const scoreB = (nameB.startsWith(q) ? 10 : nameB.includes(q) ? 7 : 0) + (cat(b).includes(q) ? 3 : 0) + (desc(b).includes(q) ? 2 : 0);
      return scoreB - scoreA;
    });
  }, [products, searchQuery]);

  const homeSearchActive = searchQuery.trim().length > 0;

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, typeof products> = {};
    filteredProducts.forEach((product) => {
      const key = product.category ?? '';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const categoryNames = Object.keys(productsByCategory);

  const popularCategories = categories.filter((c) => c.slug !== 'all').slice(0, 10);

  const content = (
    <>
      <SEO
        title="Innovative Hub · E-Shop"
        description="Shop electronic components, robotics kits, microcontrollers, sensors, and DIY project materials at Innovative Hub. Quality parts, competitive prices, delivery across India."
        path="/eshop"
      />
      <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-12">
        {/* Popular Categories */}
        <section className="mb-8 sm:mb-12">
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4">Popular categories</h2>
          {isLoading ? (
            <CategorySkeletonGrid />
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-4 product-content-enter">
              {popularCategories.map((category) => {
                const IconComponent = iconMap[category.icon] || Box;
                return (
                  <Link
                    key={category._id}
                    to={`/eshop/products?category=${category.slug}`}
                    className="flex flex-col items-center gap-1 sm:gap-2 p-2 sm:p-3 bg-secondary/30 hover:bg-secondary/60 rounded-lg sm:rounded-xl transition-colors group"
                  >
                    <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-primary/10 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-primary" />
                    </div>
                    <span className="text-[10px] sm:text-xs text-center text-muted-foreground group-hover:text-foreground transition-colors line-clamp-2">
                      {category.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {!isLoading && homeSearchActive && filteredProducts.length > 0 && (
          <section className="mb-8 sm:mb-12 product-content-enter" aria-label="Search preview">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h2 className="text-base sm:text-lg font-semibold text-foreground">
                Matching components
                <span className="text-muted-foreground font-normal text-sm ml-2">
                  (showing {Math.min(HOME_SEARCH_PREVIEW_LIMIT, filteredProducts.length)} of {filteredProducts.length})
                </span>
              </h2>
              <Link
                to={`/eshop/products?search=${encodeURIComponent(searchQuery.trim())}`}
                className="text-sm text-primary hover:underline font-medium shrink-0 min-h-[44px] inline-flex items-center"
              >
                View all in catalog
                <ChevronRight className="w-4 h-4 ml-0.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
              {filteredProducts.slice(0, HOME_SEARCH_PREVIEW_LIMIT).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        )}

        {!homeSearchActive && (
          <>
            {/* Tabs */}
            <section className="mb-6 sm:mb-8">
              <div className="flex gap-3 sm:gap-6 border-b border-border overflow-x-auto pb-px">
                <button className="pb-2 sm:pb-3 text-xs sm:text-sm font-medium text-primary border-b-2 border-primary whitespace-nowrap">
                  Newly Added
                </button>
                <button className="pb-2 sm:pb-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Our Best Selling
                </button>
                <button className="pb-2 sm:pb-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap">
                  Recommended for you
                </button>
                <Link
                  to="/eshop/products?category=innovation-zone"
                  className="pb-2 sm:pb-3 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
                >
                  Innovation Zone
                </Link>
              </div>
            </section>

            {/* Featured Products Grid */}
            <section className="mb-8 sm:mb-12">
              {isLoading ? (
                <ProductSkeletonGrid count={8} />
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4 product-content-enter">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </section>

            {/* Products by Category - only show after loading */}
            {!isLoading &&
              categoryNames.map((categoryName) => (
                <section key={categoryName} className="mb-8 sm:mb-12 product-content-enter">
                  <div className="flex items-center justify-between mb-3 sm:mb-4">
                    <h2 className="text-base sm:text-lg font-semibold text-foreground">{categoryName}</h2>
                    <Link
                      to={`/eshop/products?category=${slugify(categoryName)}`}
                      className="flex items-center gap-1 text-xs sm:text-sm text-primary hover:underline"
                    >
                      View All
                      <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-4">
                    {productsByCategory[categoryName].slice(0, 5).map((product) => (
                      <ProductCard key={product._id} product={product} />
                    ))}
                  </div>
                </section>
              ))}
          </>
        )}

        {/* No Results - only after API has completed */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-12 product-content-enter">
            {homeSearchActive ? (
              <>
                <p className="text-muted-foreground text-lg">No quick matches on this page for &quot;{searchQuery}&quot;</p>
                <Link
                  to={`/eshop/products?search=${encodeURIComponent(searchQuery.trim())}`}
                  className="mt-4 inline-block text-primary hover:underline font-medium min-h-[44px]"
                >
                  Search the full catalog
                </Link>
                <button type="button" onClick={() => setSearchQuery('')} className="mt-3 block mx-auto text-sm text-muted-foreground hover:text-foreground underline">
                  Clear search
                </button>
              </>
            ) : (
              <p className="text-muted-foreground text-lg">No products available right now.</p>
            )}
          </div>
        )}
      </div>
    </>
  );

  if (useMainLayout) {
    return content;
  }
  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {content}
    </EShopLayout>
  );
};

export default EShopHomePage;
