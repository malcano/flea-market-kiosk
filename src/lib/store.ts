import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { Product, CartItem, Sale, PaymentMethod } from '../types';

// Custom IDB storage for zustand persist
const storage = {
    getItem: async (name: string): Promise<string | null> => {
        return (await get(name)) || null;
    },
    setItem: async (name: string, value: string): Promise<void> => {
        await set(name, value);
    },
    removeItem: async (name: string): Promise<void> => {
        await del(name);
    },
};

interface KioskState {
    products: Product[];
    cart: CartItem[];
    sales: Sale[];
    initialCash: number;
    appTitle: string;
    adminPin: string;
    isLoading: boolean;
    theme: 'light' | 'dark' | 'system';

    // Actions
    setProducts: (products: Product[]) => void;
    addProduct: (product: Product) => void;
    removeProduct: (productId: string) => void;

    addToCart: (product: Product) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;

    completeSale: (paymentMethod: PaymentMethod, amountReceived?: number) => void;
    importSales: (sales: Sale[]) => void;
    clearSales: () => void;
    deleteSale: (saleId: string) => void;
    setInitialCash: (amount: number) => void;
    setAppTitle: (title: string) => void;
    setAdminPin: (pin: string) => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useKioskStore = create<KioskState>()(
    persist(
        (set, get) => ({
            products: [],
            cart: [],
            sales: [],
            initialCash: 0,
            appTitle: '플리마켓 키오스크',
            adminPin: '0000',
            isLoading: false,
            theme: 'system',

            setProducts: (products) => set({ products }),

            addProduct: (product) => set((state) => ({
                products: [...state.products, product]
            })),

            removeProduct: (productId) => set((state) => ({
                products: state.products.filter(p => p.id !== productId)
            })),

            setInitialCash: (initialCash) => set({ initialCash }),

            addToCart: (product) => set((state) => {
                const existing = state.cart.find(item => item.id === product.id);
                if (existing) {
                    return {
                        cart: state.cart.map(item =>
                            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                        )
                    };
                }
                return { cart: [...state.cart, { ...product, quantity: 1 }] };
            }),

            removeFromCart: (productId) => set((state) => ({
                cart: state.cart.filter(item => item.id !== productId)
            })),

            updateCartQuantity: (productId, quantity) => set((state) => ({
                cart: quantity <= 0
                    ? state.cart.filter(item => item.id !== productId)
                    : state.cart.map(item => item.id === productId ? { ...item, quantity } : item)
            })),

            clearCart: () => set({ cart: [] }),

            completeSale: (paymentMethod, amountReceived) => set((state) => {
                const total = state.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
                const newSale: Sale = {
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    items: [...state.cart],
                    total,
                    paymentMethod,
                    amountReceived,
                    change: amountReceived ? amountReceived - total : 0
                };
                return {
                    sales: [...state.sales, newSale],
                    cart: []
                };
            }),

            importSales: (sales) => set((state) => ({
                sales: [...state.sales, ...sales]
            })),

            deleteSale: (saleId) => set((state) => ({
                sales: state.sales.filter(s => s.id !== saleId)
            })),

            setAppTitle: (appTitle) => set({ appTitle }),
            setAdminPin: (adminPin) => set({ adminPin }),
            clearSales: () => set({ sales: [] }),
            setTheme: (theme) => set({ theme })
        }),
        {
            name: 'kiosk-storage',
            storage: createJSONStorage(() => storage as any),
        }
    )
);
