import { CartItem } from '../types';
import { formatCurrency } from '../lib/utils';
import { Minus, Plus, Trash2 } from 'lucide-react';

interface CartItemRowProps {
    item: CartItem;
    onUpdateQuantity: (id: string, q: number) => void;
    onRemove: (id: string) => void;
}

export const CartItemRow = ({ item, onUpdateQuantity, onRemove }: CartItemRowProps) => {
    return (
        <div className="cart-item">
            <div className="cart-item-info">
                <p className="cart-item-name">{item.name}</p>
                <p className="cart-item-price">{formatCurrency(item.price)}</p>
            </div>
            <div className="cart-item-actions">
                <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}>
                    <Minus size={18} />
                </button>
                <span className="cart-item-qty">{item.quantity}</span>
                <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}>
                    <Plus size={18} />
                </button>
                <button className="remove-btn" onClick={() => onRemove(item.id)}>
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};
