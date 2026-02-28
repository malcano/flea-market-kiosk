export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    image?: string;
}

export interface CartItem extends Product {
    quantity: number;
}

export type PaymentMethod = 'card' | 'cash';

export interface Sale {
    id: string;
    timestamp: number;
    items: CartItem[];
    total: number;
    paymentMethod: PaymentMethod;
    amountReceived?: number;
    change?: number;
}

export interface DashboardStats {
    totalSales: number;
    totalRevenue: number;
    salesByMethod: {
        card: number;
        cash: number;
    };
    salesByCategory: Record<string, number>;
}
