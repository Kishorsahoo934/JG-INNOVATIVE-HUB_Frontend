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

const reloadServerWishlist = async (dispatch: React.Dispatch<WishlistAction>) => {
  try {
    const res = await wishlistApi.get();
    if (res.success) {
      dispatch({ type: 'LOAD_WISHLIST', payload: res.data });
    }
  } catch {
    /* keep optimistic state */
  }
};

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(wishlistReducer, { items: [] });

  // Skip wishlist for admin users
  const isRegularUser = isAuthenticated && user?.role !== 'admin';

  // Load wishlist from backend on auth
  useEffect(() => {
    const loadWishlist = async () => {
      if (!isRegularUser) {
        localStorage.removeItem(GUEST_WISHLIST_KEY);
        dispatch({ type: 'LOAD_WISHLIST', payload: [] });
        return;
      }
      try {
        // Process any pending wishlist item stored before login redirect
        const pendingRaw = sessionStorage.getItem('pendingWishlistItem');
        if (pendingRaw) {
          sessionStorage.removeItem('pendingWishlistItem');
          try {
            const { productId } = JSON.parse(pendingRaw);
            if (productId) {
              await wishlistApi.add(productId);
            }
          } catch {
            /* ignore parse error */
          }
        }
        const res = await wishlistApi.get();
        if (res.success) {
          dispatch({ type: 'LOAD_WISHLIST', payload: res.data });
        }
      } catch (error) {
        console.error('Failed to load wishlist:', error);
      }
    };
    loadWishlist();
  }, [isRegularUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(GUEST_WISHLIST_KEY);
    }
  }, [isAuthenticated]);

  const addToWishlist = (product: Product) => {
    if (!isRegularUser) {
      return;
    }
    // Optimistic update
    dispatch({ type: 'ADD_TO_WISHLIST', payload: product });
    wishlistApi
      .add(product._id)
      .then((res) => {
        // Reload from server to stay in sync
        if (res.success) {
          reloadServerWishlist(dispatch);
        }
      })
      .catch((error) => {
        console.error('Failed to add to wishlist:', error);
        // Rollback: reload server state
        reloadServerWishlist(dispatch);
      });
  };

  const removeFromWishlist = (productId: string) => {
    // Optimistic removal
    dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: productId });
    if (!isRegularUser) return;

    wishlistApi
      .remove(productId)
      .then((res) => {
        if (res.success) {
          reloadServerWishlist(dispatch);
        }
      })
      .catch((error) => {
        console.error('Failed to remove from wishlist:', error);
        // Rollback: reload server state
        reloadServerWishlist(dispatch);
      });
  };

  const clearWishlist = () => {
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
