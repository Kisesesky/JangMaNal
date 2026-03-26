import { create } from 'zustand';

export type CompareProduct = {
  id: string;
  mart: string;
  name: string;
  price: number;
  imageUrl?: string;
};

type CompareState = {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => void;
  removeProduct: (id: string) => void;
  clear: () => void;
};

export const useCompareStore = create<CompareState>((set, get) => ({
  products: [],
  addProduct: (product) => {
    const exists = get().products.some((item) => item.id === product.id);
    if (exists) return;
    set({ products: [...get().products, product] });
  },
  removeProduct: (id) => set({ products: get().products.filter((item) => item.id !== id) }),
  clear: () => set({ products: [] }),
}));
