import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '../utils/products';
import { wishlistApi } from '../services/api';
import { useAuth } from './AuthContext';

interface WishlistState {
  items: Product[];
}

type WishlistAction =
  | { type: 'ADD_TO_WISHLIST'; payload: Product }
  | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
  | { type: 'CLEAR_WISHLIST' }
  | { type: 'LOAD_WISHLIST'; payload: Product[] };

interface WishlistContextType extends WishlistState {
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);
const GUEST_WISHLIST_KEY = 'guestWishlist';

const wishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
  switch (action.type) {
    case 'ADD_TO_WISHLIST':
      if (state.items.find(item => item._id === action.payload._id)) {
        return state;
      }
      return { items: [...state.items, action.payload] };

    case 'REMOVE_FROM_WISHLIST':
      return { items: state.items.filter(item => item._id !== action.payload) };

    case 'CLEAR_WISHLIST':
      return { items: [] };

    case 'LOAD_WISHLIST':
      return { items: action.payload };

    default:
      return state;
  }
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  // Load wishlist from backend on auth
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isAuthenticated) {
        const raw = localStorage.getItem(GUEST_WISHLIST_KEY);
        if (!raw) {
          dispatch({ type: 'LOAD_WISHLIST', payload: [] });
          return;
        }
        try {
          const items = JSON.parse(raw) as Product[];
          dispatch({ type: 'LOAD_WISHLIST', payload: Array.isArray(items) ? items : [] });
        } catch {
          localStorage.removeItem(GUEST_WISHLIST_KEY);
          dispatch({ type: 'LOAD_WISHLIST', payload: [] });
        }
        return;
      }
      try {
        const res = await wishlistApi.get();
        if (res.success) {
          dispatch({ type: 'LOAD_WISHLIST', payload: res.data });
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };
    loadWishlist();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(state.items));
  }, [state.items, isAuthenticated]);

  const addToWishlist = (product: Product) => {
    if (!isAuthenticated) {
      dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
      return;
    }
    wishlistApi
      .add(product._id)
      .then(() => dispatch({ type: 'ADD_TO_WISHLIST', payload: product }))
      .catch((error) => console.error('Failed to add to wishlist:', error));
  };

  const removeFromWishlist = (productId: string) => {
    if (!isAuthenticated) {
      dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
      return;
    }
    wishlistApi
      .remove(productId)
      .then(() => dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId }))
      .catch((error) => console.error('Failed to remove from wishlist:', error));
  };

  const clearWishlist = () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_WISHLIST' });
      return;
    }
    dispatch({ type: 'CLEAR_WISHLIST' });
  };

  const isInWishlist = (productId: string) => {
    return state.items.some(item => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        ...state,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isInWishlist,
        totalItems: state.items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
