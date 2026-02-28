import { useState, useEffect } from 'react';
import { useKioskStore } from './lib/store';
import { ProductCard } from './components/ProductCard';
import { CartItemRow } from './components/CartItemRow';
import { CheckoutModal } from './components/CheckoutModal';
import { AdminView } from './components/AdminView';
import { formatCurrency } from './lib/utils';
import { LayoutGrid, Settings, ShoppingBag, Pencil, Trash2, Sun, Moon, Monitor } from 'lucide-react';

function App() {
    const { products, cart, addToCart, removeFromCart, updateCartQuantity, clearCart, appTitle, setAppTitle, theme, setTheme } = useKioskStore();
    const [activeTab, setActiveTab] = useState<'kiosk' | 'admin'>('kiosk');
    const [selectedCategory, setSelectedCategory] = useState<string>('전체');
    const [showCheckout, setShowCheckout] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [tempTitle, setTempTitle] = useState(appTitle);

    const handleTitleSave = () => {
        if (tempTitle.trim()) {
            setAppTitle(tempTitle.trim());
        }
        setIsEditingTitle(false);
    };

    // Apply theme class to HTML element
    useEffect(() => {
        const applyTheme = () => {
            const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
            document.documentElement.classList.toggle('dark', isDark);
        };

        applyTheme();

        // Listen for system theme changes if set to system
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => applyTheme();
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, [theme]);

    const handleThemeToggle = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('system');
        else setTheme('light');
    };

    const categories = ['전체', ...Array.from(new Set(products.map(p => p.category)))];
    const filteredProducts = selectedCategory === '전체'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <div className="app-container">
            {/* Navigation Rail */}
            <nav style={{ width: 80, background: 'var(--sidebar-bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '24px 0', gap: 32 }}>
                <button
                    onClick={() => setActiveTab('kiosk')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'kiosk' ? 'var(--sidebar-active)' : 'var(--sidebar-inactive)', cursor: 'pointer' }}
                >
                    <LayoutGrid size={32} />
                </button>
                <button
                    onClick={() => setActiveTab('admin')}
                    style={{ background: 'none', border: 'none', color: activeTab === 'admin' ? 'var(--sidebar-active)' : 'var(--sidebar-inactive)', cursor: 'pointer' }}
                >
                    <Settings size={32} />
                </button>
                <div style={{ flex: 1 }} />
                <button
                    onClick={handleThemeToggle}
                    style={{ background: 'none', border: 'none', color: 'var(--sidebar-inactive)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, paddingBottom: '24px' }}
                    title={`Current theme: ${theme}`}
                >
                    {theme === 'light' ? <Sun size={24} /> : theme === 'dark' ? <Moon size={24} /> : <Monitor size={24} />}
                </button>
            </nav>

            {/* Main Content Area */}
            <div className="main-content">
                {activeTab === 'kiosk' ? (
                    <>
                        <header style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            {isEditingTitle ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                    <input
                                        type="text"
                                        value={tempTitle}
                                        onChange={(e) => setTempTitle(e.target.value)}
                                        onBlur={handleTitleSave}
                                        onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
                                        autoFocus
                                        style={{ fontSize: 32, fontWeight: 900, border: 'none', borderBottom: '2px solid var(--primary)', outline: 'none', background: 'transparent', width: 'auto' }}
                                    />
                                </div>
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', flexShrink: 0 }} onClick={() => { setTempTitle(appTitle); setIsEditingTitle(true); }}>
                                    <h1 className="gradient-text" style={{ fontSize: 32, fontWeight: 900, margin: 0, whiteSpace: 'nowrap' }}>{appTitle}</h1>
                                    <Pencil size={24} color="var(--text-secondary)" style={{ opacity: 0.6 }} />
                                </div>
                            )}
                            <div className="category-tabs" style={{ marginLeft: 'auto', flex: 1, minWidth: 0 }}>
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        className={`category-tab ${selectedCategory === cat ? 'active' : ''}`}
                                        onClick={() => setSelectedCategory(cat)}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </header>

                        <div className="product-grid">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} onAdd={addToCart} />
                            ))}
                            {products.length === 0 && (
                                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 80, color: 'var(--text-secondary)' }}>
                                    <ShoppingBag size={64} style={{ marginBottom: 16, opacity: 0.2 }} />
                                    <p>등록된 상품이 없습니다. 관리자 탭에서 상품을 등록해 주세요.</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <AdminView />
                )}
            </div>

            {/* Cart Sidebar (Visible in Kiosk mode) */}
            {activeTab === 'kiosk' && (
                <aside className="sidebar">
                    <div className="cart-header">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <ShoppingBag /> 장바구니
                        </h2>
                    </div>

                    <div className="cart-items">
                        {cart.map(item => (
                            <CartItemRow
                                key={item.id}
                                item={item}
                                onUpdateQuantity={updateCartQuantity}
                                onRemove={removeFromCart}
                            />
                        ))}
                        {cart.length === 0 && (
                            <div style={{ textAlign: 'center', marginTop: 100, color: 'var(--text-secondary)' }}>
                                장바구니가 비어 있습니다
                            </div>
                        )}
                    </div>

                    <div className="cart-footer">
                        <div className="cart-total-row">
                            <span>총계</span>
                            <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <button
                            className="checkout-btn"
                            disabled={cart.length === 0}
                            onClick={() => setShowCheckout(true)}
                        >
                            결제하기
                        </button>
                        <button
                            onClick={clearCart}
                            style={{ width: '100%', marginTop: 20, padding: '12px 0', background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                            <Trash2 size={16} /> 장바구니 비우기
                        </button>
                    </div>
                </aside>
            )}

            {showCheckout && (
                <CheckoutModal onClose={() => setShowCheckout(false)} />
            )}
        </div>
    );
}

export default App;
