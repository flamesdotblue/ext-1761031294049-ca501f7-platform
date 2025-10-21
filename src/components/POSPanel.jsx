import React, { useMemo, useState } from 'react';
import { Search, Send, CreditCard, Wallet, Smartphone } from 'lucide-react';

function POSPanel({ role, products, inventory, recipes, customers, sellingPriceForProduct, handleSale, inr }) {
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState([]); // {productId, qty}
  const [customerId, setCustomerId] = useState(customers[0]?.id || 'C001');
  const [paymentMode, setPaymentMode] = useState('Cash');

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => p.active && p.name.toLowerCase().includes(q));
  }, [products, query]);

  const availableStockForProduct = (productId) => {
    const recipe = recipes.find((r) => r.productId === productId);
    if (!recipe) return 0;
    // Compute max servings based on limiting ingredient
    let maxServings = Infinity;
    for (const ing of recipe.ingredients) {
      const inv = inventory.find((i) => i.name === ing.inventoryName);
      if (!inv) return 0;
      const possible = Math.floor(inv.qty / ing.qty);
      if (possible < maxServings) maxServings = possible;
    }
    return maxServings === Infinity ? 0 : maxServings;
  };

  const addToCart = (productId) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.productId === productId);
      if (existing) {
        const stock = availableStockForProduct(productId);
        if (existing.qty + 1 > stock) return prev;
        return prev.map((c) => (c.productId === productId ? { ...c, qty: c.qty + 1 } : c));
      }
      if (availableStockForProduct(productId) <= 0) return prev;
      return [...prev, { productId, qty: 1 }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) return setCart((prev) => prev.filter((c) => c.productId !== productId));
    const stock = availableStockForProduct(productId);
    if (qty > stock) qty = stock;
    setCart((prev) => prev.map((c) => (c.productId === productId ? { ...c, qty } : c)));
  };

  const cartTotal = cart.reduce((acc, c) => acc + sellingPriceForProduct(c.productId) * c.qty, 0);

  const clearCart = () => setCart([]);

  const checkout = () => {
    if (role !== 'Owner' && role !== 'Salesperson') return;
    if (!cart.length) return;
    for (const item of cart) {
      handleSale({ productId: item.productId, qty: item.qty, paymentMode, customerId });
    }
    clearCart();
  };

  return (
    <section className="rounded-2xl bg-white/80 backdrop-blur-sm border p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search juice..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            className="bg-white border rounded-lg px-3 py-2 text-sm"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select
            value={paymentMode}
            onChange={(e) => setPaymentMode(e.target.value)}
            className="bg-white border rounded-lg px-3 py-2 text-sm"
          >
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
          </select>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const stock = availableStockForProduct(p.id);
          const price = sellingPriceForProduct(p.id);
          return (
            <button
              key={p.id}
              onClick={() => addToCart(p.id)}
              className="group text-left rounded-xl border overflow-hidden bg-white hover:shadow-md transition-shadow"
            >
              <div className="h-28 w-full overflow-hidden">
                <img src={p.image} alt={p.name} className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform" />
              </div>
              <div className="p-3">
                <div className="font-medium text-slate-800">{p.name}</div>
                <div className="text-xs text-slate-500">{stock} in stock</div>
                <div className="text-emerald-600 font-semibold mt-1">{inr.format(price)}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl border bg-slate-50 p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Cart</h3>
          <div className="text-slate-600 text-sm">Total: <span className="font-semibold">{inr.format(cartTotal)}</span></div>
        </div>
        {!cart.length && <div className="text-slate-500 text-sm">No items added.</div>}
        <div className="space-y-3">
          {cart.map((c) => {
            const product = products.find((p) => p.id === c.productId);
            const price = sellingPriceForProduct(c.productId);
            return (
              <div key={c.productId} className="flex items-center justify-between bg-white rounded-lg border p-3">
                <div>
                  <div className="font-medium">{product?.name}</div>
                  <div className="text-xs text-slate-500">{inr.format(price)} each</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    value={c.qty}
                    onChange={(e) => updateQty(c.productId, parseInt(e.target.value || '1', 10))}
                    className="w-20 bg-white border rounded-lg px-2 py-1"
                  />
                  <div className="w-20 text-right font-semibold">{inr.format(price * c.qty)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-600 text-sm">
            <Wallet size={16} />
            <span>Payment: {paymentMode}</span>
            {paymentMode === 'UPI' && <Smartphone size={16} className="text-emerald-500" />}
            {paymentMode === 'Card' && <CreditCard size={16} className="text-blue-500" />}
          </div>
          <div className="flex gap-3">
            <button
              onClick={clearCart}
              className="px-4 py-2 rounded-lg border bg-white hover:bg-slate-50 text-slate-700"
            >
              Clear
            </button>
            <button
              disabled={!cart.length}
              onClick={checkout}
              className="px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2 disabled:opacity-50"
            >
              <Send size={16} />
              WhatsApp Bill & Checkout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default POSPanel;
