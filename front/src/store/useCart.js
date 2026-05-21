import { create } from 'zustand';

// Simple localStorage persistence (no SSR issues with this approach)
const getInitialCart = () => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('vectorstore-cart');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const useCart = create((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isHydrated: false,

  // Hydrate from localStorage (call once on client)
  hydrate: () => {
    const items = getInitialCart();
    set({ items, isHydrated: true });
  },

  // Open/close the cart drawer
  openDrawer: () => set({ isDrawerOpen: true }),
  closeDrawer: () => set({ isDrawerOpen: false }),
  toggleDrawer: () => set((s) => ({ isDrawerOpen: !s.isDrawerOpen })),

  // Add a design to the cart (no duplicates — these are unique designs)
  addItem: (design) => {
    const { items } = get();
    if (items.find((i) => i.id === design.id)) return; // Already in cart

    const newItems = [...items, {
      id: design.id,
      name: design.name,
      slug: design.slug,
      image: design.image,
      pricePEN: design.pricePEN,
      priceUSD: design.priceUSD,
      fileFormat: design.fileFormat,
      isFree: design.isFree,
    }];

    localStorage.setItem('vectorstore-cart', JSON.stringify(newItems));
    set({ items: newItems, isDrawerOpen: true });
  },

  // Remove a design from the cart
  removeItem: (designId) => {
    const newItems = get().items.filter((i) => i.id !== designId);
    localStorage.setItem('vectorstore-cart', JSON.stringify(newItems));
    set({ items: newItems });
  },

  // Check if a design is in the cart
  isInCart: (designId) => {
    return get().items.some((i) => i.id === designId);
  },

  // Clear the entire cart
  clearCart: () => {
    localStorage.setItem('vectorstore-cart', JSON.stringify([]));
    set({ items: [] });
  },

  // Total in PEN
  getTotal: () => {
    return get().items.reduce((sum, i) => sum + (i.isFree ? 0 : i.pricePEN), 0);
  },
}));

export default useCart;
