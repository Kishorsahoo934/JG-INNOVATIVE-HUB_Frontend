import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Product } from '../utils/products';
import { cartApi } from '../services/api';
import { useAuth } from './AuthContext';
import { clampCartQuantity } from '../utils/cartUtils';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_TO_CART'; payload: { product: Product; quantity?: number } }
  | { type: 'REMOVE_FROM_CART'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addToCart: (product: Product, quantity?: number) => Promise<boolean>;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  isInCart: (productId: string) => boolean;
  getQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);
const GUEST_CART_KEY = 'guestCart';

const calculateTotals = (items: CartItem[]) => ({
  totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
  totalPrice: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
});

const cartReducer = (state: CartState, action: CartAction): CartState => {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_TO_CART': {
      const { product, quantity: addQty = 1 } = action.payload;
      const add = Math.max(1, Math.floor(addQty));
      const stock = product.stock;
      const existingItem = state.items.find((item) => item.product._id === product._id);

      if (existingItem) {
        let merged = existingItem.quantity + add;
        if (stock > 0) {
          merged = Math.min(merged, stock);
        } else {
          merged = existingItem.quantity;
        }
        if (merged === existingItem.quantity) {
          return state;
        }
        if (merged < 1) {
          newItems = state.items.filter((item) => item.product._id !== product._id);
        } else {
          newItems = state.items.map((item) =>
            item.product._id === product._id ? { ...item, quantity: merged, product } : item
          );
        }
      } else {
        if (stock <= 0) return state;
        const initial = Math.min(add, stock);
        if (initial < 1) return state;
        newItems = [...state.items, { product, quantity: initial }];
      }
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_FROM_CART':
      newItems = state.items.filter(
        (item) => item.product._id !== action.payload && item.product.sku !== action.payload
      );
      return { items: newItems, ...calculateTotals(newItems) };

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const item = state.items.find(
        (i) => i.product._id === productId || i.product.sku === productId
      );
      if (!item) return state;
      const capped = clampCartQuantity(item.product, quantity);
      if (capped <= 0) {
        newItems = state.items.filter(
          (i) => i.product._id !== productId && i.product.sku !== productId
        );
      } else {
        newItems = state.items.map((i) =>
          i.product._id === productId || i.product.sku === productId ? { ...i, quantity: capped } : i
        );
      }
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'CLEAR_CART':
      return { items: [], totalItems: 0, totalPrice: 0 };

    case 'LOAD_CART':
      return { items: action.payload, ...calculateTotals(action.payload) };

    default:
      return state;
  }
};

const reloadServerCart = async (dispatch: React.Dispatch<CartAction>) => {
  try {
    const res = await cartApi.get();
    if (res.success) {
      dispatch({ type: 'LOAD_CART', payload: res.data });
    }
  } catch {
    /* keep optimistic state */
  }
};

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  // Skip cart/wishlist for admin users — they don't have user-collection carts
  const isRegularUser = isAuthenticated && user?.role !== 'admin';

  useEffect(() => {
    const loadCart = async () => {
      if (!isRegularUser) {
        localStorage.removeItem(GUEST_CART_KEY);
        dispatch({ type: 'LOAD_CART', payload: [] });
        return;
      }

      // Process any pending cart item stored before login redirect
      const pending = sessionStorage.getItem('pendingCartItem');
      if (pending) {
        sessionStorage.removeItem('pendingCartItem');
        try {
          const parsed: unknown = JSON.parse(pending);
          if (
            typeof parsed === 'object' &&
            parsed !== null &&
            'productId' in parsed &&
            typeof parsed.productId === 'string' &&
            parsed.productId.length > 0
          ) {
            const quantity =
              'quantity' in parsed && typeof parsed.quantity === 'number'
                ? parsed.quantity
                : 1;
            await cartApi.add(parsed.productId, quantity);
          }
        } catch (error) {
          console.error('Failed to restore pending cart item:', error);
        }
      }

      await reloadServerCart(dispatch);
    };

    void loadCart();
  }, [isRegularUser]);

  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.removeItem(GUEST_CART_KEY);
    }
  }, [isAuthenticated]);

  const addToCart = async (product: Product, quantity: number = 1): Promise<boolean> => {
    const q = Math.max(1, Math.floor(quantity));
    if (!isRegularUser) {
      return false;
    }
    // Optimistic local update
    dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: q } });
    try {
      const res = await cartApi.add(product._id, q);
      if (res.success && Array.isArray(res.data)) {
        dispatch({ type: 'LOAD_CART', payload: res.data });
      }
      return true;
    } catch (error) {
      console.error('Failed to sync add to cart with backend:', error);
      // Rollback: reload server state so UI reflects reality
      await reloadServerCart(dispatch);
      return false;
    }
  };

  const removeFromCart = (productId: string) => {
    // Optimistic local removal
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    if (!isRegularUser) return;

    cartApi
      .remove(productId)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((err) => {
        console.error('Failed to remove from cart:', err);
        // Rollback: reload server state
        reloadServerCart(dispatch);
      });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = state.items.find(
      (i) => i.product._id === productId || i.product.sku === productId
    );
    if (!item) return;

    const next = clampCartQuantity(item.product, quantity);
    if (next === item.quantity) return;

    if (!isRegularUser) {
      if (next <= 0) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      } else {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: next } });
      }
      return;
    }

    if (next <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      cartApi
        .remove(productId)
        .then((res) => {
          if (res.success && Array.isArray(res.data)) dispatch({ type: 'LOAD_CART', payload: res.data });
        })
        .catch((err) => {
          console.error('Failed to remove item:', err);
          reloadServerCart(dispatch);
        });
      return;
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: next } });
    cartApi
      .setQuantity(productId, next)
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((err) => {
        console.error('Failed to set quantity:', err);
        reloadServerCart(dispatch);
      });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    if (!isRegularUser) return;
    cartApi
      .clear()
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((error) => {
        console.error('Failed to clear cart:', error);
        reloadServerCart(dispatch);
      });
  };

  const isInCart = (productId: string) => {
    return state.items.some((item) => item.product._id === productId);
  };

  const getQuantity = (productId: string) => {
    return state.items.find((item) => item.product._id === productId)?.quantity ?? 0;
  };

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
