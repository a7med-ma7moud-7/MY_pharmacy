import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle2, ShoppingBag, X } from 'lucide-react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('pharmacy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartToast, setCartToast] = useState(null);

  useEffect(() => {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const showCartToast = useCallback((medicineName, qty = 1) => {
    setCartToast({ name: medicineName, qty, id: Date.now() });
  }, []);

  useEffect(() => {
    if (!cartToast) return;
    const timer = setTimeout(() => setCartToast(null), 3500);
    return () => clearTimeout(timer);
  }, [cartToast]);

  const addToCart = (medicine, quantity = 1, openDrawer = false) => {
    const maxStock = Number(medicine.count) > 0 ? Number(medicine.count) : 99;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === medicine.id);
      if (existing) {
        return prev.map((item) =>
          item.id === medicine.id
            ? { ...item, quantity: Math.min(maxStock, item.quantity + quantity) }
            : item
        );
      }
      return [
        ...prev,
        {
          id: medicine.id,
          name: medicine.name,
          price: parseFloat(medicine.price) || 0,
          image_url: medicine.image_url,
          type: medicine.type,
          maxStock,
          quantity: Math.min(maxStock, quantity),
        },
      ];
    });

    if (openDrawer) {
      setIsCartOpen(true);
    } else {
      showCartToast(medicine.name, quantity);
    }
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const limit = item.maxStock || 99;
        return { ...item, quantity: Math.min(limit, newQuantity) };
      })
    );
  };

  const removeFromCart = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = Math.round(
    cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
  ) / 100;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalCount,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}

      {/* Floating Cart Toast Notification */}
      {cartToast && !isCartOpen && (
        <div
          key={cartToast.id}
          className="fixed bottom-6 left-1/2 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex items-center gap-3 animate-toast max-w-md w-[92%]"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <p className="font-bold text-white truncate m-0">
              تمت إضافة {cartToast.name} للسلة
            </p>
            <span className="text-gray-400 text-[11px]">
              إجمالي السلة: {totalCount} عبوة ({totalPrice} ج.م)
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setCartToast(null);
              setIsCartOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer border-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>عرض السلة</span>
          </button>
          <button
            type="button"
            onClick={() => setCartToast(null)}
            className="text-gray-400 hover:text-white p-1 border-0 bg-transparent cursor-pointer"
            aria-label="إغلاق التنبيه"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
