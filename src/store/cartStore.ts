import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  material: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  customization?: {
    design: Record<string, unknown>;
    preview: string;
    text?: string;
    images?: string[];
    colors?: string[];
  };
  options: {
    width: number;
    height: number;
    finish?: string;
    technique?: string;
  };
}

interface CartStore {
  items: CartItem[];
  total: number;
  itemCount: number;
  
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  calculateTotal: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,

      addItem: (item) => {
        set((state) => {
          const existingItem = state.items.find(i => i.id === item.id);
          
          if (existingItem) {
            return {
              items: state.items.map(i =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          
          return { items: [...state.items, item] };
        });
        get().calculateTotal();
      },

      removeItem: (itemId) => {
        set((state) => ({
          items: state.items.filter(item => item.id !== itemId),
        }));
        get().calculateTotal();
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set((state) => ({
          items: state.items.map(item =>
            item.id === itemId
              ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
              : item
          ),
        }));
        get().calculateTotal();
      },

      clearCart: () => {
        set({ items: [], total: 0, itemCount: 0 });
      },

      calculateTotal: () => {
        const { items } = get();
        const total = items.reduce((sum, item) => sum + item.totalPrice, 0);
        const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
        set({ total, itemCount });
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);