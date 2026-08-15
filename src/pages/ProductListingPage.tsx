import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronDown, Grid3X3, List, Loader2 } from 'lucide-react';
import EShopLayout from '../components/EShopLayout';
import ProductCard from '../components/ProductCard';
import SEO from '@/components/SEO';
import { SITE_NAME } from '@/lib/seo';
import { ProductSkeletonGrid } from '../components/ProductSkeleton';
import { productsApi } from '../services/api';
import { useCategories } from '../hooks/useCategories';
import type { Product } from '../utils/products';
import { getListingSeoBlocks } from '@/lib/listingSeoContent';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const PAGE_SIZE = productsApi.pageSize;

type SortOption = 'newest' | 'price-low' | 'price-high' | 'name';

interface ProductListingPageProps {
  /** When true, render inside main site Layout (no EShop header) */
  useMainLayout?: boolean;
}

const ProductListingPage = ({ useMainLayout = false }: ProductListingPageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const fetchingRef = useRef(false);
  const productsLengthRef = useRef(0);
  const { categories } = useCategories();

  productsLengthRef.current = products.length;
  const hasMore = products.length < total;

  const fetchPage = useCallback(
    async (skip: number, append: boolean) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      if (!append) setIsLoading(true);
      else setIsLoadingMore(true);
      try {
        const activeSearch = searchQuery.trim();
        const res = await productsApi.getAll({
          skip,
          limit: PAGE_SIZE,
          // When searching, query full catalog so results don't disappear under a category filter.
          category: activeSearch ? undefined : (categoryParam && categoryParam !== 'all' ? categoryParam : undefined),
          search: activeSearch || undefined,
          sort: sortBy,
        });
        if (res.success) {
          const list = res.data || [];
          const totalCount = typeof (res as { total?: number }).total === 'number' ? (res as { total: number }).total : list.length;
          setTotal(totalCount);
          if (append) {
            setProducts((prev) => {
              const seen = new Set(prev.map((p) => p._id));
              const newItems = list.filter((p) => !seen.has(p._id));
              return prev.concat(newItems);
            });
          } else {
            setProducts(list);
          }
        }
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        fetchingRef.current = false;
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [categoryParam, searchQuery, sortBy]
  );

  useEffect(() => {
    setProducts([]);
    setTotal(0);
    fetchPage(0, false);
  }, [fetchPage]);

  useEffect(() => {
    const fromUrl = searchParam;
    setSearchQuery((q) => (q.trim() === fromUrl ? q : fromUrl));
  }, [searchParam]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        const cur = next.get('search') || '';
        if (trimmed === cur) return prev;
        if (trimmed) next.set('search', trimmed);
        else next.delete('search');
        return next;
      },
      { replace: true }
    );
  }, [searchQuery, setSearchParams]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;
    if (!sentinel || !hasMore || isLoadingMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && !fetchingRef.current) {
          const nextSkip = productsLengthRef.current;
          if (nextSkip < total) fetchPage(nextSkip, true);
        }
      },
      { rootMargin: '200px', threshold: 0.1 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isLoading, total, fetchPage]);

  const filteredAndSortedProducts = useMemo(() => {
    const q = searchParam.trim().toLowerCase();
    if (!q) return products;
    const words = q.split(/\s+/).filter(Boolean);
    const scoreProduct = (product: Product) => {
      const name = (product.name ?? '').toLowerCase();
      const category = (product.category ?? '').toLowerCase();
      const desc = (product.shortDescription ?? '').replace(/<[^>]*>/g, ' ').toLowerCase();
      let score = 0;
      for (const w of words) {
        if (name.startsWith(w)) score += 10;
        else if (name.includes(w)) score += 7;
        if (category.includes(w)) score += 3;
        if (desc.includes(w)) score += 2;
      }
      return score;
    };
    return [...products].sort((a, b) => {
      const diff = scoreProduct(b) - scoreProduct(a);
      if (diff !== 0) return diff;
      return (a.name || '').localeCompare(b.name || '');
    });
  }, [products, searchParam]);

  const sortLabels: Record<SortOption, string> = {
    newest: 'Newest First',
    'price-low': 'Price: Low to High',
    'price-high': 'Price: High to Low',
    name: 'Name: A to Z'
  };

  const currentCategory = categories.find(c => c.slug === categoryParam)?.name || 'All Products';
  const hasSearch = Boolean(searchParam.trim());
  const listPath = useMemo(() => {
    if (categoryParam && categoryParam !== 'all') {
      return `/eshop/products?category=${encodeURIComponent(categoryParam)}`;
    }
    return '/eshop/products';
  }, [categoryParam]);

  const listingTitle = useMemo(() => {
    if (hasSearch) {
      const q = searchParam.trim().slice(0, 60);
      return q ? `Search: ${q}` : 'Search results';
    }
    return currentCategory === 'All Products' ? 'Shop all products' : currentCategory;
  }, [hasSearch, searchParam, currentCategory]);

  const listingDescription = useMemo(() => {
    if (hasSearch) {
      return `Search results for electronic components and robotics parts at Innovative Hub. Refine your search or browse categories.`;
    }
    return `Browse ${currentCategory.toLowerCase()} at Innovative Hub — quality electronic components, microcontrollers, sensors, and robotics parts with fast delivery across India.`;
  }, [hasSearch, currentCategory]);

  const listingKeywords = useMemo(() => {
    if (hasSearch) {
      const q = searchParam.trim().slice(0, 80);
      return q
        ? `${q}, search, electronics, robotics, ${SITE_NAME}, India`
        : `electronics, robotics, IoT, ${SITE_NAME}`;
    }
    return `${currentCategory}, electronic components, buy online India, robotics parts, IoT modules, ${SITE_NAME}, Odisha`;
  }, [hasSearch, searchParam, currentCategory]);

  const listingSeoBlocks = useMemo(
    () => getListingSeoBlocks(categoryParam, currentCategory, searchParam),
    [categoryParam, currentCategory, searchParam]
  );

  const content = (
    <>
      <SEO
        title={listingTitle}
        description={listingDescription}
        keywords={listingKeywords}
        path={listPath}
        noIndex={hasSearch}
      />
      <div className="container mx-auto px-2 sm:px-4 pb-8 sm:pb-12">
        {/* Breadcrumb — touch-friendly links on mobile */}
        <nav
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm sm:text-sm text-muted-foreground mb-4 sm:mb-6"
          aria-label="Breadcrumb"
        >
          <Link
            to="/"
            className="hover:text-foreground whitespace-nowrap min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md touch-manipulation"
          >
            Home
          </Link>
          <span className="text-muted-foreground/80" aria-hidden>
            /
          </span>
          <Link
            to="/eshop"
            className="hover:text-foreground whitespace-nowrap min-h-[44px] inline-flex items-center px-1 -mx-1 rounded-md touch-manipulation"
          >
            E-Shop
          </Link>
          <span className="text-muted-foreground/80" aria-hidden>
            /
          </span>
          <span className="text-foreground font-medium min-h-[44px] inline-flex items-center">{currentCategory}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{currentCategory}</h1>
            <p className="text-sm text-muted-foreground">
              {isLoading && products.length === 0
                ? 'Loading…'
                : total > 0
                  ? `${total} product${total === 1 ? '' : 's'} found`
                  : `${filteredAndSortedProducts.length} products found`}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Sort Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-4">
                  <span className="hidden sm:inline">{sortLabels[sortBy]}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {(Object.keys(sortLabels) as SortOption[]).map((option) => (
                  <DropdownMenuItem 
                    key={option}
                    onClick={() => setSortBy(option)}
                    className={sortBy === option ? 'bg-secondary' : ''}
                  >
                    {sortLabels[option]}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* View Toggle - touch-friendly */}
            <div className="flex border border-border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-3 sm:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
              >
                <Grid3X3 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-3 sm:p-2 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-muted-foreground hover:bg-secondary'}`}
              >
                <List className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={category.slug === 'all' ? '/eshop/products' : `/eshop/products?category=${category.slug}`}
              className={`px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-full transition-colors ${
                categoryParam === category.slug || (!categoryParam && category.slug === 'all')
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary/50 text-foreground hover:bg-secondary'
              }`}
            >
              {category.name}
            </Link>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading && products.length === 0 ? (
          <ProductSkeletonGrid
            count={PAGE_SIZE}
            gridClass={
              viewMode === 'grid'
                ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                : 'grid-cols-1'
            }
          />
        ) : filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12 max-w-lg mx-auto px-2">
            <h2 className="text-lg font-semibold text-foreground mb-3">No products match this view</h2>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4">
              Try another category, clear filters, or use a shorter search term. Innovative Hub lists microcontrollers, sensors,
              motors and power modules updated regularly — the full catalog is available from the E-Shop home.
            </p>
            <Link to="/eshop/products" className="text-primary hover:underline inline-block font-medium min-h-[44px]">
              View all products
            </Link>
          </div>
        ) : (
          <>
            <div
              className={`grid gap-2 sm:gap-4 product-content-enter ${
                viewMode === 'grid'
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
                  : 'grid-cols-1'
              }`}
            >
              {filteredAndSortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
            <div ref={loadMoreRef} className="min-h-[24px] flex justify-center items-center py-4" aria-hidden="true">
              {isLoadingMore && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground" role="status" aria-live="polite">
                  <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                  Loading more…
                </span>
              )}
            </div>
          </>
        )}

        <section
          className="mt-12 sm:mt-16 rounded-xl border border-border/60 bg-card/30 px-4 py-6 sm:px-6 sm:py-8"
          aria-labelledby="listing-seo-heading"
        >
          <h2 id="listing-seo-heading" className="text-lg sm:text-xl font-bold text-foreground mb-4">
            {listingSeoBlocks.h2}
          </h2>
          <div className="space-y-5 text-sm sm:text-base text-muted-foreground leading-relaxed">
            {listingSeoBlocks.sections.map((sec) => (
              <div key={sec.title}>
                <h3 className="text-base font-semibold text-foreground mb-2">{sec.title}</h3>
                <p>{sec.body}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );

  if (useMainLayout) return content;
  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      {content}
    </EShopLayout>
  );
};

export default ProductListingPage;
