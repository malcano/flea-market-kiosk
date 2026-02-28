import { useState } from 'react';
import { Product } from '../types';
import { X } from 'lucide-react';

interface ProductModalProps {
    product?: Product;
    onClose: () => void;
    onSave: (product: Product) => void;
}

export const ProductModal = ({ product, onClose, onSave }: ProductModalProps) => {
    const [name, setName] = useState(product?.name || '');
    const [category, setCategory] = useState(product?.category || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !price) return;

        onSave({
            id: product?.id || crypto.randomUUID(),
            name,
            category: category || '일반',
            price: Number(price),
        });
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>
                        {product ? '제품 정보 수정' : '새 제품 추가'}
                    </h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </header>

                <form onSubmit={handleSave}>
                    <div className="cash-input-group" style={{ marginBottom: 20 }}>
                        <label>제품명</label>
                        <input
                            type="text"
                            className="cash-input"
                            style={{ textAlign: 'left', fontSize: 18 }}
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            autoFocus
                        />
                    </div>

                    <div className="cash-input-group" style={{ marginBottom: 20 }}>
                        <label>카테고리</label>
                        <input
                            type="text"
                            className="cash-input"
                            style={{ textAlign: 'left', fontSize: 18 }}
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            placeholder="예: 음료, 스낵, 굿즈 등"
                        />
                    </div>

                    <div className="cash-input-group" style={{ marginBottom: 32 }}>
                        <label>가격 (원)</label>
                        <input
                            type="number"
                            className="cash-input"
                            style={{ fontSize: 24 }}
                            value={price}
                            onChange={e => setPrice(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="checkout-btn">
                        {product ? '수정 완료' : '제품 등록'}
                    </button>
                </form>
            </div>
        </div>
    );
};
