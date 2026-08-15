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
  addToCart: (product: Product, quantity?: number) => void;
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
      newItems = state.items.filter((item) => item.product._id !== action.payload);
      return { items: newItems, ...calculateTotals(newItems) };

    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (!item) return state;
      const capped = clampCartQuantity(item.product, quantity);
      if (capped <= 0) {
        newItems = state.items.filter((i) => i.product._id !== productId);
      } else {
        newItems = state.items.map((i) =>
          i.product._id === productId ? { ...i, quantity: capped } : i
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
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  useEffect(() => {
    const loadCart = async () => {
      if (!isAuthenticated) {
        const raw = localStorage.getItem(GUEST_CART_KEY);
        if (!raw) {
          dispatch({ type: 'LOAD_CART', payload: [] });
          return;
        }
        try {
          const items = JSON.parse(raw) as CartItem[];
          dispatch({ type: 'LOAD_CART', payload: Array.isArray(items) ? items : [] });
        } catch {
          localStorage.removeItem(GUEST_CART_KEY);
          dispatch({ type: 'LOAD_CART', payload: [] });
        }
        return;
      }
      try {
        const res = await cartApi.get();
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    };
    loadCart();
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(state.items));
  }, [state.items, isAuthenticated]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const q = Math.max(1, Math.floor(quantity));
    if (!isAuthenticated) {
      dispatch({ type: 'ADD_TO_CART', payload: { product, quantity: q } });
      return;
    }
    cartApi
      .add(product._id, q)
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((error) => console.error('Failed to add to cart:', error));
  };

  const removeFromCart = (productId: string) => {
    if (!isAuthenticated) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      return;
    }
    const snapshot = state.items;
    dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
    cartApi
      .remove(productId)
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch(() => {
        dispatch({ type: 'LOAD_CART', payload: snapshot });
      });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = state.items.find((i) => i.product._id === productId);
    if (!item) return;

    const next = clampCartQuantity(item.product, quantity);
    if (next === item.quantity) return;

    if (!isAuthenticated) {
      if (next <= 0) {
        dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      } else {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: next } });
      }
      return;
    }

    const snapshot = state.items;
    if (next <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: productId });
      cartApi
        .remove(productId)
        .then((res) => {
          if (res.success) dispatch({ type: 'LOAD_CART', payload: res.data });
        })
        .catch(() => dispatch({ type: 'LOAD_CART', payload: snapshot }));
      return;
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity: next } });
    cartApi
      .setQuantity(productId, next)
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch(() => {
        void reloadServerCart(dispatch);
      });
  };

  const clearCart = () => {
    if (!isAuthenticated) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    cartApi
      .clear()
      .then((res) => {
        if (res.success) {
          dispatch({ type: 'LOAD_CART', payload: res.data });
        }
      })
      .catch((error) => console.error('Failed to clear cart:', error));
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
