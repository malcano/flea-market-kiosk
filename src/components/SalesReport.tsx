import { X, Clock, CreditCard, Banknote, Package, Trash2 } from 'lucide-react';
import { Sale } from '../types';
import { formatCurrency } from '../lib/utils';
import { useKioskStore } from '../lib/store';

interface SalesReportProps {
    sales: Sale[];
    onClose: () => void;
}

export const SalesReport = ({ sales, onClose }: SalesReportProps) => {
    const deleteSale = useKioskStore(state => state.deleteSale);

    // Sort sales by timestamp descending (newest first)
    const sortedSales = [...sales].sort((a, b) => b.timestamp - a.timestamp);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("정말로 이 판매 기록을 삭제하시겠습니까?\n이 작업은 취소할 수 없습니다.")) {
            deleteSale(id);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" style={{ width: '90%', maxWidth: '1100px', height: '85vh', display: 'flex', flexDirection: 'column', padding: '32px' }} onClick={e => e.stopPropagation()}>
                <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexShrink: 0 }}>
                    <h2 className="modal-title" style={{ margin: 0 }}>전체 판매 실적 ({sales.length}건)</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
                        <X size={24} />
                    </button>
                </header>

                <div style={{ flex: 1, overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-light)', position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border-color)', width: '150px' }}>시간</th>
                                <th style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)', width: '100px' }}>결제 방식</th>
                                <th style={{ textAlign: 'left', padding: '16px', borderBottom: '1px solid var(--border-color)' }}>판매 항목</th>
                                <th style={{ textAlign: 'right', padding: '16px', borderBottom: '1px solid var(--border-color)', width: '150px' }}>금액 (거스름돈)</th>
                                <th style={{ textAlign: 'center', padding: '16px', borderBottom: '1px solid var(--border-color)', width: '60px' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedSales.map((sale) => (
                                <tr key={sale.id} style={{ borderBottom: '1px solid var(--bg-color)' }}>
                                    <td style={{ padding: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Clock size={14} />
                                            {new Date(sale.timestamp).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        {sale.paymentMethod === 'card' ? (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: '6px', background: 'var(--primary-light)', color: 'var(--primary-hover)', fontSize: '12px', fontWeight: 600 }}>
                                                <CreditCard size={14} /> 카드
                                            </span>
                                        ) : (
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 8px', borderRadius: '6px', background: 'var(--success-light)', color: 'var(--success-icon)', fontSize: '12px', fontWeight: 600 }}>
                                                <Banknote size={14} /> 현금
                                            </span>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                            {sale.items.map((item, idx) => (
                                                <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', background: 'var(--bg-color)', borderRadius: '4px', fontSize: '12px' }}>
                                                    <Package size={12} /> {item.name} x{item.quantity}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'right' }}>
                                        <div style={{ fontWeight: 600 }}>{formatCurrency(sale.total)}</div>
                                        {sale.paymentMethod === 'cash' && (sale.change ?? 0) > 0 && (
                                            <div style={{ fontSize: '11px', color: 'var(--danger)' }}>
                                                받음: {formatCurrency(sale.amountReceived ?? 0)} / 거스름: {formatCurrency(sale.change ?? 0)}
                                            </div>
                                        )}
                                    </td>
                                    <td style={{ padding: '16px', textAlign: 'center' }}>
                                        <button
                                            onClick={(e) => handleDelete(sale.id, e)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '8px', transition: 'all 0.2s', margin: '0 auto' }}
                                            onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
                                            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                                            title="판매 기록 삭제"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {sales.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ padding: '80px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        판매 내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <footer style={{ marginTop: 24, textAlign: 'right', flexShrink: 0 }}>
                    <button className="checkout-btn" style={{ width: 'auto', padding: '12px 32px' }} onClick={onClose}>
                        닫기
                    </button>
                </footer>
            </div>
        </div>
    );
};
