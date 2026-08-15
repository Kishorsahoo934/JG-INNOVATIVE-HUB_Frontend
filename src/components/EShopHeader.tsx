import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, User, Heart, ShoppingCart, Search } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useCategories } from '../hooks/useCategories';
import CategorySidebar from './CategorySidebar';
import LogoMark from '@/components/LogoMark';

interface EShopHeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  hideSearch?: boolean;
}

const EShopHeader = ({ searchQuery = '', onSearchChange, hideSearch = false }: EShopHeaderProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems: cartItems } = useCart();
  const { totalItems: wishlistItems } = useWishlist();
  const { categories } = useCategories();

  const isProjectPage = location.pathname.startsWith('/project-kits') || location.pathname.startsWith('/project/');

  const submitSearchToListing = () => {
    const q = searchQuery.trim();
    if (!q) return;
    if (location.pathname.startsWith('/project-kits') || location.pathname.startsWith('/project/')) {
      navigate(`/project-kits?search=${encodeURIComponent(q)}`);
    } else {
      navigate(`/eshop/products?search=${encodeURIComponent(q)}`);
    }
  };

  return (
    <>
      <CategorySidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border">
        <div className="container mx-auto px-4">
          {/* Top Bar: left = menu+logo (tight); md+ = grid with search centered in middle column */}
          <div className={`flex items-center justify-between h-16 md:h-20 gap-2 ${hideSearch ? 'md:flex md:justify-between' : 'md:grid md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center md:gap-3'}`}>
            <div className="flex items-center gap-1 sm:gap-1.5 min-w-0 flex-1 md:flex-initial md:shrink-0">
              {/* Menu Button - Opens Category Sidebar (touch-friendly) */}
              <button
                type="button"
                className="p-2 sm:p-2.5 -ml-1 text-foreground hover:bg-secondary active:bg-secondary/80 rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open categories"
              >
                <Menu className="w-6 h-6" />
              </button>

              {/* Logo + brand text (text always to the right of logo; truncates on narrow phones) */}
              <Link
                to="/"
                className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-hidden"
              >
                <span className="shrink-0 flex items-center">
                  <LogoMark variant="navLight" priority />
                </span>
                <span className="text-sm sm:text-lg md:text-xl font-bold text-foreground truncate min-w-0 text-left leading-tight">
                  JG Innovative <span className="text-foreground">Hub</span>
                </span>
              </Link>
            </div>

            {/* Search Bar — centered in the header row on md+ */}
            <div className={`hidden md:flex justify-center min-w-0 w-full px-2 ${hideSearch ? 'md:hidden' : ''}`}>
              <div className="relative w-full max-w-xl">
                {!hideSearch && (
                  <>
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <Input
                      type="text"
                      placeholder="Search for products..."
                      value={searchQuery}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          submitSearchToListing();
                        }
                      }}
                      className="pl-10 bg-secondary/50 w-full"
                    />
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 md:gap-4 shrink-0">
              <Link to="/account">
                <Button variant="default" size="sm" className="gap-2 rounded-full px-5 hidden md:flex">
                  <User className="w-4 h-4" />
                  My Account
                </Button>
              </Link>
              
              <Link to="/wishlist" className="relative p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors touch-manipulation rounded-lg">
                <Heart className="w-5 h-5" />
                {wishlistItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {wishlistItems}
                  </span>
                )}
              </Link>
              
              <Link to="/cart" className="relative p-3 min-h-[44px] min-w-[44px] flex items-center justify-center text-muted-foreground hover:text-primary transition-colors touch-manipulation rounded-lg">
                <ShoppingCart className="w-5 h-5" />
                {cartItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                    {cartItems}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          {!hideSearch && (
            <div className="md:hidden pb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search for products..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      submitSearchToListing();
                    }
                  }}
                  className="pl-10 bg-secondary/50"
                />
              </div>
            </div>
          )}

          {/* Category Navigation - Desktop */}
          {!isProjectPage && (
            <nav className="hidden lg:flex items-center gap-2 py-3 overflow-x-auto">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={category.slug === 'all' ? '/eshop' : `/eshop/products?category=${category.slug}`}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${
                    location.search.includes(category.slug) || (category.slug === 'all' && location.pathname === '/eshop')
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
              <Link 
                to="/wishlist"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-secondary/50 text-foreground hover:bg-secondary whitespace-nowrap transition-colors"
              >
                <Heart className="w-4 h-4" />
                Wish List
              </Link>
              <Link 
                to="/cart"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground whitespace-nowrap transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                Add To Cart
              </Link>
            </nav>
          )}
        </div>
      </header>
    </>
  );
};

export default EShopHeader;
