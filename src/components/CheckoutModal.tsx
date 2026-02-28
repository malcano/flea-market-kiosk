import { useState, useEffect } from 'react';
import { formatCurrency } from '../lib/utils';
import { useKioskStore } from '../lib/store';
import { CreditCard, Banknote, X, CheckCircle2, Receipt, RotateCcw } from 'lucide-react';

interface CheckoutModalProps {
    onClose: () => void;
}

export const CheckoutModal = ({ onClose }: CheckoutModalProps) => {
    const { cart, completeSale } = useKioskStore();
    const [method, setMethod] = useState<'card' | 'cash' | null>(null);
    const [amountReceived, setAmountReceived] = useState<string>('');
    const [isSuccess, setIsSuccess] = useState(false);

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const change = Math.max(0, (Number(amountReceived) || 0) - total);

    const handleComplete = () => {
        if (method === 'card') {
            completeSale('card');
            setIsSuccess(true);
        } else if (method === 'cash' && Number(amountReceived) >= total) {
            completeSale('cash', Number(amountReceived));
            setIsSuccess(true);
        }
    };

    useEffect(() => {
        if (isSuccess) {
            const timer = setTimeout(() => {
                onClose();
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isSuccess, onClose]);

    if (isSuccess) {
        return (
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-content" style={{ textAlign: 'center' }}>
                    <CheckCircle2 size={80} color="var(--success)" style={{ marginBottom: 24 }} />
                    <h2 className="modal-title">결제 완료</h2>
                    <p>구매해주셔서 감사합니다!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ width: '90%', maxWidth: method === 'cash' ? '900px' : '500px', transition: 'max-width 0.3s' }} onClick={e => e.stopPropagation()}>
                <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>결제하기</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        <X size={24} />
                    </button>
                </header>

                <div className="cart-total-row" style={{ marginBottom: 24, padding: '16px', background: 'var(--bg-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Receipt size={24} color="var(--primary)" />
                        <span style={{ fontSize: '18px' }}>총 결제 금액</span>
                    </div>
                    <span style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)' }}>{formatCurrency(total)}</span>
                </div>

                <div className="payment-options" style={{ marginBottom: method === 'cash' ? 32 : 24 }}>
                    <button
                        className={`payment-btn ${method === 'card' ? 'active' : ''}`}
                        onClick={() => setMethod('card')}
                    >
                        <CreditCard size={32} />
                        <span style={{ fontWeight: 600 }}>신용카드</span>
                    </button>
                    <button
                        className={`payment-btn ${method === 'cash' ? 'active' : ''}`}
                        onClick={() => setMethod('cash')}
                    >
                        <Banknote size={32} />
                        <span style={{ fontWeight: 600 }}>현금</span>
                    </button>
                </div>

                {method === 'cash' && (
                    <div className="cash-payment-section" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, alignItems: 'start' }}>
                        <div className="cash-left-col">
                            <div className="cash-input-group" style={{ marginBottom: 24 }}>
                                <label style={{ fontSize: '16px', marginBottom: 8, display: 'block' }}>받은 금액</label>
                                <input
                                    type="number"
                                    className="cash-input"
                                    placeholder="0"
                                    value={amountReceived}
                                    onChange={e => setAmountReceived(e.target.value)}
                                    autoFocus
                                    style={{ fontSize: '32px', height: '70px' }}
                                />
                            </div>

                            <div className="change-display" style={{ background: 'var(--success-light)', border: '1px solid var(--success-border)', padding: '20px', borderRadius: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                    <RotateCcw size={18} color="var(--success-dark)" />
                                    <div className="change-label" style={{ color: 'var(--success-dark)', fontSize: '16px', margin: 0 }}>거스름돈</div>
                                </div>
                                <div className="change-amount" style={{ color: 'var(--success-text)', fontSize: '36px', fontWeight: 900 }}>{formatCurrency(change)}</div>
                            </div>
                        </div>

                        <div className="cash-right-col">
                            <div className="num-pad" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                                {[100, 500, 1000, 5000, 10000, 50000].map(val => (
                                    <button
                                        key={val}
                                        className="num-btn"
                                        onClick={() => setAmountReceived(String((Number(amountReceived) || 0) + val))}
                                        style={{ padding: '14px', fontSize: '16px' }}
                                    >
                                        +{val.toLocaleString()}
                                    </button>
                                ))}
                                <button
                                    className="num-btn"
                                    style={{ gridColumn: 'span 2', padding: '14px', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 700 }}
                                    onClick={() => setAmountReceived(String(total))}
                                >
                                    금액에 맞게 받음
                                </button>
                                <button
                                    className="num-btn"
                                    style={{ gridColumn: 'span 2', color: 'var(--danger)', borderColor: 'var(--danger)', padding: '10px' }}
                                    onClick={() => setAmountReceived('')}
                                >
                                    초기화
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{ marginTop: 32 }}>
                    <button
                        className="checkout-btn"
                        disabled={!method || (method === 'cash' && Number(amountReceived) < total)}
                        onClick={handleComplete}
                        style={{ height: '60px', fontSize: '20px' }}
                    >
                        {method === 'cash' ? '결제 완료' : '카드 결제 진행'}
                    </button>
                </div>
            </div>
        </div>
    );
};
