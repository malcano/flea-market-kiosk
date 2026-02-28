import { useState } from 'react';
import { useKioskStore } from '../lib/store';
import { downloadTemplate, parseProductExcel, exportSalesToExcel } from '../lib/excel';
import { FileDown, FileUp, Download, Plus, Trash2, Edit, RefreshCcw, PackagePlus, ShoppingBag, TrendingUp, Coins, LayoutDashboard, Lock } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { ProductModal } from './ProductModal';
import { SalesReport } from './SalesReport';
import { Product } from '../types';

export const AdminView = () => {
    const { products, sales, setProducts, addProduct, removeProduct, clearSales, initialCash, setInitialCash, adminPin, setAdminPin } = useKioskStore();
    const [showProductModal, setShowProductModal] = useState(false);
    const [showSalesReport, setShowSalesReport] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [cashInput, setCashInput] = useState(initialCash.toString());
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [newPinInput, setNewPinInput] = useState('');

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const importedProducts = await parseProductExcel(file);
                setProducts(importedProducts);
                alert(`${importedProducts.length}개의 제품이 성공적으로 등록되었습니다!`);
            } catch (err) {
                alert('엑셀 파일 분석에 실패했습니다.');
            }
        }
    };

    const handleSaveProduct = (product: Product) => {
        if (editingProduct) {
            setProducts(products.map(p => p.id === product.id ? product : p));
        } else {
            addProduct(product);
        }
    };

    const handleResetSales = () => {
        if (window.confirm('모든 판매 실적을 초기화하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
            clearSales();
        }
    };

    const handleSaveInitialCash = () => {
        const amount = Number(cashInput) || 0;
        setInitialCash(amount);
        alert('시작 현금이 설정되었습니다.');
    };

    const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
    const avgSale = sales.length > 0 ? totalRevenue / sales.length : 0;
    const cashSales = sales.filter(s => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.total, 0);

    const handlePinSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (pinInput === adminPin) {
            setIsAuthenticated(true);
            setPinInput('');
        } else {
            alert('비밀번호가 일치하지 않습니다.');
            setPinInput('');
        }
    };

    const handleForgotPin = () => {
        const response = window.prompt("비밀번호 강제 초기화를 위해 '초기화' 라고 정확히 입력해주세요.\n초기화 시 비밀번호는 '0000'으로 변경됩니다.");
        if (response === '초기화') {
            setAdminPin('0000');
            alert("비밀번호가 '0000'으로 초기화되었습니다.");
        } else if (response !== null) {
            alert("입력값이 일치하지 않아 초기화가 취소되었습니다.");
        }
    };

    const handleChangePin = () => {
        if (!newPinInput || newPinInput.length < 4) {
            alert("새비밀번호를 4자리 이상 입력해주세요.");
            return;
        }
        setAdminPin(newPinInput);
        setNewPinInput('');
        alert("비밀번호가 성공적으로 변경되었습니다.");
    };

    if (!isAuthenticated) {
        return (
            <div className="admin-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px' }}>
                <div style={{ background: 'var(--surface-color)', padding: '48px', borderRadius: '24px', boxShadow: '0 12px 32px rgba(0,0,0,0.05)', textAlign: 'center', width: '100%', maxWidth: '400px', border: '1px solid var(--border-color)' }}>
                    <div style={{ width: '64px', height: '64px', background: 'var(--primary-light)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
                        <Lock size={32} />
                    </div>
                    <h2 style={{ marginBottom: '8px' }}>관리자 인증</h2>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>관리자 PIN 번호를 입력해주세요.</p>

                    <form onSubmit={handlePinSubmit}>
                        <input
                            type="password"
                            value={pinInput}
                            onChange={(e) => setPinInput(e.target.value)}
                            placeholder="PIN 번호 4자리"
                            style={{ width: '100%', padding: '16px', fontSize: '20px', textAlign: 'center', borderRadius: '12px', border: '2px solid var(--border-color)', marginBottom: '24px', letterSpacing: '8px' }}
                            autoFocus
                        />
                        <button type="submit" className="checkout-btn" style={{ width: '100%', padding: '16px', fontSize: '18px', marginBottom: 16 }}>
                            접속하기
                        </button>
                    </form>

                    <button onClick={handleForgotPin} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 13, textDecoration: 'underline', cursor: 'pointer' }}>
                        비밀번호를 잊으셨나요?
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <h2 className="modal-title" style={{ textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12 }}>
                <LayoutDashboard size={28} /> 대시보드 및 관리
            </h2>

            <div className="stats-grid">
                <div className="admin-card stat-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <ShoppingBag size={20} color="var(--text-secondary)" />
                        <div className="stat-label" style={{ margin: 0 }}>총 결제 횟수</div>
                    </div>
                    <div className="stat-value">{sales.length}</div>
                </div>
                <div
                    className="admin-card stat-item"
                    onClick={() => setShowSalesReport(true)}
                    style={{ cursor: 'pointer', transition: 'transform 0.2s', border: '1px solid var(--primary-light)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <TrendingUp size={20} color="var(--primary)" />
                        <div className="stat-label" style={{ margin: 0, color: 'var(--primary)' }}>총 매출액</div>
                    </div>
                    <div className="stat-value" style={{ color: 'var(--primary)' }}>{formatCurrency(totalRevenue)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>(클릭하여 상세 정보)</div>
                </div>
                <div className="admin-card stat-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <Coins size={20} color="var(--success-icon)" />
                        <div className="stat-label" style={{ margin: 0 }}>보유 현금</div>
                    </div>
                    <div className="stat-value">{formatCurrency(initialCash + cashSales)}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>(시작+현금매출)</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="admin-card">
                    <h3 style={{ marginBottom: 16 }}>시작 현금 설정</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
                        플리마켓 시작 시 금고에 있던 현금을 입력해주세요.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="number"
                            className="cash-input"
                            style={{ flex: 1, fontSize: 18, padding: '10px' }}
                            value={cashInput}
                            onChange={e => setCashInput(e.target.value)}
                            placeholder="0"
                        />
                        <button
                            className="category-tab active"
                            onClick={handleSaveInitialCash}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            설정 저장
                        </button>
                    </div>
                </div>

                <div className="admin-card">
                    <h3 style={{ marginBottom: 16 }}>실적 내보내기</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
                        판매 내역과 시작 현금을 포함한 엑셀 파일을 다운로드합니다.
                    </p>
                    <button
                        className="category-tab active"
                        onClick={() => exportSalesToExcel(sales, initialCash)}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', justifyContent: 'center' }}
                        disabled={sales.length === 0 && initialCash === 0}
                    >
                        <Download size={20} /> 실적 파일 다운로드
                    </button>
                </div>
            </div>

            <div className="admin-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 style={{ margin: 0 }}>제품 관리 ({products.length})</h3>
                    <button
                        className="checkout-btn"
                        onClick={() => { setEditingProduct(undefined); setShowProductModal(true); }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'auto', padding: '12px 24px' }}
                    >
                        <Plus size={20} /> 제품 직접 추가
                    </button>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                    제품을 수동으로 추가하거나 엑셀을 통해 일괄 등록할 수 있습니다.
                </p>

                <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                    <button className="category-tab" onClick={downloadTemplate} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileDown size={20} /> 템플릿 다운로드
                    </button>
                    <label className="category-tab" style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                        <FileUp size={20} /> 엑셀 일괄 업로드
                        <input type="file" accept=".xlsx, .xls" hidden onChange={handleFileUpload} />
                    </label>
                </div>

                <div className="product-list-admin" style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--bg-light)', position: 'sticky', top: 0, zIndex: 1 }}>
                            <tr>
                                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>제품명</th>
                                <th style={{ textAlign: 'left', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>카테고리</th>
                                <th style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>가격</th>
                                <th style={{ textAlign: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>관리</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>{p.name}</td>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>{p.category}</td>
                                    <td style={{ textAlign: 'right', padding: '12px 16px', borderBottom: '1px solid var(--border-color)' }}>{formatCurrency(p.price)}</td>
                                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <button onClick={() => { setEditingProduct(p); setShowProductModal(true); }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}><Edit size={18} /></button>
                                            <button onClick={() => removeProduct(p.id)} style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {products.length === 0 && (
                                <tr>
                                    <td colSpan={4} style={{ padding: '60px 40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <PackagePlus size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                                        <p style={{ marginBottom: 16 }}>등록된 제품이 없습니다.</p>
                                        <button
                                            className="category-tab active"
                                            onClick={() => { setEditingProduct(undefined); setShowProductModal(true); }}
                                            style={{ margin: '0 auto' }}
                                        >
                                            첫 제품 추가하기
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <div className="admin-card">
                    <h3 style={{ marginBottom: 20 }}>초기화 옵션</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 20 }}>
                        현재 기기에 저장된 모든 판매 실적 및 시작 현금을 초기화합니다.
                    </p>
                    <button
                        className="category-tab"
                        onClick={() => {
                            if (window.confirm('모든 데이터를 초기화하시겠습니까?')) {
                                clearSales();
                                setInitialCash(0);
                                setCashInput('0');
                            }
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, borderColor: 'var(--danger)', color: 'var(--danger)' }}
                        disabled={sales.length === 0 && initialCash === 0}
                    >
                        <RefreshCcw size={20} /> 전체 데이터 초기화
                    </button>
                </div>

                <div className="admin-card">
                    <h3 style={{ marginBottom: 16 }}>비밀번호 변경</h3>
                    <p style={{ color: 'var(--text-secondary)', marginBottom: 16, fontSize: 14 }}>
                        관리자 대시보드 접속에 사용할 새 PIN 번호를 설정합니다.
                    </p>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="password"
                            className="cash-input"
                            style={{ flex: 1, fontSize: 18, padding: '10px', letterSpacing: '4px' }}
                            value={newPinInput}
                            onChange={e => setNewPinInput(e.target.value)}
                            placeholder="새 PIN 번호 입력"
                        />
                        <button
                            className="category-tab active"
                            onClick={handleChangePin}
                            style={{ whiteSpace: 'nowrap' }}
                        >
                            비밀번호 변경
                        </button>
                    </div>
                </div>
            </div>

            {showProductModal && (
                <ProductModal
                    product={editingProduct}
                    onClose={() => setShowProductModal(false)}
                    onSave={handleSaveProduct}
                />
            )}

            {showSalesReport && (
                <SalesReport
                    sales={sales}
                    onClose={() => setShowSalesReport(false)}
                />
            )}
        </div>
    );
};
