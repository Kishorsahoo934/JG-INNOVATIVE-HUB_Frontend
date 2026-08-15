import { useEffect, useState } from 'react';
import type { Category } from '../utils/products';
import { STATIC_CATEGORIES } from '../utils/products';

const ALL_CATEGORY: Category = {
  _id: 'all',
  name: 'All Categories',
  slug: 'all',
  icon: 'Grid3X3',
  image: '',
};

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([ALL_CATEGORY]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setCategories([ALL_CATEGORY, ...STATIC_CATEGORIES]);
    setIsLoading(false);
  }, []);

  return { categories, isLoading };
};
