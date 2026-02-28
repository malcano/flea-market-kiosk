import { Product } from '../types';
import { formatCurrency } from '../lib/utils';
import { Plus } from 'lucide-react';

interface ProductCardProps {
    product: Product;
    onAdd: (product: Product) => void;
}

export const ProductCard = ({ product, onAdd }: ProductCardProps) => {
    return (
        <button
            onClick={() => onAdd(product)}
            className="product-card"
        >
            <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-price">{formatCurrency(product.price)}</p>
            </div>
            <div className="add-icon">
                <Plus size={24} />
            </div>
        </button>
    );
};
