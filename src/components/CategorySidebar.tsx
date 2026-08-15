import { Link, useLocation } from 'react-router-dom';
import { X } from 'lucide-react';
import { useCategories } from '../hooks/useCategories';

interface CategorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const CategorySidebar = ({ isOpen, onClose }: CategorySidebarProps) => {
  const location = useLocation();
  const { categories } = useCategories();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 touch-none"
        onClick={onClose}
        aria-hidden
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-full sm:w-80 max-w-[85vw] bg-background border-r border-border z-50 overflow-y-auto overflow-x-hidden animate-slide-in-right">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Categories</h2>
          <button 
            type="button"
            onClick={onClose}
            className="p-3 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg transition-colors touch-manipulation"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <nav className="p-2 space-y-1">
          {categories.filter(cat => cat.slug !== 'all').map((category) => {
            const isActive = location.search.includes(category.slug);
              
            return (
              <Link
                key={category._id}
                to={`/eshop/products?category=${category.slug}`}
                onClick={onClose}
                className={`block px-4 py-3.5 min-h-[44px] flex items-center rounded-lg border-l-4 transition-colors touch-manipulation ${
                  isActive 
                    ? 'bg-primary/10 text-primary border-primary' 
                    : 'text-foreground hover:bg-secondary border-transparent hover:border-muted-foreground'
                }`}
              >
                <span className="text-sm font-medium">{category.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
};

export default CategorySidebar;
