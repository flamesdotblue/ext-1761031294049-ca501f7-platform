import React, { useMemo, useState, useEffect } from 'react';
import HeroCover from './components/HeroCover';
import DashboardCards from './components/DashboardCards';
import POSPanel from './components/POSPanel';
import ManagementTabs from './components/ManagementTabs';

// Currency formatter for INR
const inr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });

// Initial mock data simulating the Excel backend tables
const initialProducts = [
  {
    id: 'P001',
    name: 'Mango Blast',
    image: 'https://images.unsplash.com/photo-1749408072288-f3c837b29911?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxNYW5nbyUyMEJsYXN0fGVufDB8MHx8fDE3NjEwMzE1NTB8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80',
    markup: 0.4,
    active: true,
  },
  {
    id: 'P002',
    name: 'Watermelon Refresher',
    image: 'https://images.unsplash.com/photo-1652031552021-50bcc01121a7?ixid=M3w3OTkxMTl8MHwxfHNlYXJjaHwxfHxXYXRlcm1lbG9uJTIwUmVmcmVzaGVyfGVufDB8MHx8fDE3NjEwMzE1NTB8MA&ixlib=rb-4.1.0&w=1600&auto=format&fit=crop&q=80',
    markup: 0.35,
    active: true,
  },
  {
    id: 'P003',
    name: 'Classic Lemonade',
    image: 'https://images.unsplash.com/photo-1497534446932-c925b458314e?q=80&w=1000&auto=format&fit=crop',
    markup: 0.3,
    active: true,
  },
];

const initialInventory = [
  { id: 'I001', name: 'Mango', unit: 'kg', qty: 20, reorderLevel: 5, costPerUnit: 120 },
  { id: 'I002', name: 'Watermelon', unit: 'kg', qty: 30, reorderLevel: 8, costPerUnit: 35 },
  { id: 'I003', name: 'Lemon', unit: 'kg', qty: 10, reorderLevel: 3, costPerUnit: 90 },
  { id: 'I004', name: 'Sugar', unit: 'kg', qty: 8, reorderLevel: 2, costPerUnit: 45 },
  { id: 'I005', name: 'Ice', unit: 'kg', qty: 15, reorderLevel: 4, costPerUnit: 10 },
  { id: 'I006', name: 'Cups', unit: 'pcs', qty: 200, reorderLevel: 50, costPerUnit: 2 },
  { id: 'I007', name: 'Mint', unit: 'g', qty: 500, reorderLevel: 100, costPerUnit: 0.3 },
  { id: 'I008', name: 'Salt', unit: 'g', qty: 400, reorderLevel: 100, costPerUnit: 0.2 },
];

// Recipe units relative to inventory units
// Define recipe per 1 serving
const initialRecipes = [
  {
    productId: 'P001',
    ingredients: [
      { inventoryName: 'Mango', qty: 0.35, unit: 'kg' },
      { inventoryName: 'Sugar', qty: 0.02, unit: 'kg' },
      { inventoryName: 'Ice', qty: 0.1, unit: 'kg' },
      { inventoryName: 'Cups', qty: 1, unit: 'pcs' },
    ],
  },
  {
    productId: 'P002',
    ingredients: [
      { inventoryName: 'Watermelon', qty: 0.5, unit: 'kg' },
      { inventoryName: 'Sugar', qty: 0.015, unit: 'kg' },
      { inventoryName: 'Ice', qty: 0.1, unit: 'kg' },
      { inventoryName: 'Mint', qty: 5, unit: 'g' },
      { inventoryName: 'Cups', qty: 1, unit: 'pcs' },
    ],
  },
  {
    productId: 'P003',
    ingredients: [
      { inventoryName: 'Lemon', qty: 0.08, unit: 'kg' },
      { inventoryName: 'Sugar', qty: 0.018, unit: 'kg' },
      { inventoryName: 'Salt', qty: 2, unit: 'g' },
      { inventoryName: 'Ice', qty: 0.08, unit: 'kg' },
      { inventoryName: 'Cups', qty: 1, unit: 'pcs' },
    ],
  },
];

const initialCustomers = [
  { id: 'C001', name: 'Walk-in', phone: '' },
  { id: 'C002', name: 'Aarav', phone: '+91 9876543210' },
  { id: 'C003', name: 'Neha', phone: '+91 9000000000' },
];

function App() {
  const [products, setProducts] = useState(initialProducts);
  const [inventory, setInventory] = useState(initialInventory);
  const [recipes, setRecipes] = useState(initialRecipes);
  const [sales, setSales] = useState([]); // {id, productId, qty, priceEach, total, paymentMode, customerId, date}
  const [customers, setCustomers] = useState(initialCustomers);
  const [whatsAppLogs, setWhatsAppLogs] = useState([]); // {id, to, template, message, time, status}
  const [role, setRole] = useState('Owner'); // Owner or Salesperson
  const [aiPredictions, setAiPredictions] = useState([]); // {productId, predictedQty, confidence, comment, date}

  // Helper: get recipe cost for a product
  const getRecipe = (productId) => recipes.find((r) => r.productId === productId);
  const getInventoryItem = (name) => inventory.find((i) => i.name === name);

  const costForProduct = (productId) => {
    const recipe = getRecipe(productId);
    if (!recipe) return 0;
    let cost = 0;
    for (const ing of recipe.ingredients) {
      const inv = getInventoryItem(ing.inventoryName);
      if (inv) {
        // cost = qty * costPerUnit considering units align
        cost += ing.qty * inv.costPerUnit;
      }
    }
    return cost;
  };

  const sellingPriceForProduct = (productId) => {
    const base = costForProduct(productId);
    const p = products.find((x) => x.id === productId);
    const markup = p?.markup ?? 0.3;
    return Math.ceil(base * (1 + markup));
  };

  // Low stock detection
  const lowStockItems = useMemo(() => inventory.filter((i) => i.qty <= i.reorderLevel), [inventory]);

  // Sales for today and total
  const today = new Date().toISOString().slice(0, 10);
  const todaySales = useMemo(() => sales.filter((s) => s.date.startsWith(today)), [sales, today]);
  const todayTotal = todaySales.reduce((acc, s) => acc + s.total, 0);

  // AI Predictions - simple heuristic based on last 7 days + a weather factor
  useEffect(() => {
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const salesByProduct = {};
    for (const s of sales) {
      const d = new Date(s.date);
      if (d >= last7) {
        salesByProduct[s.productId] = (salesByProduct[s.productId] || 0) + s.qty;
      }
    }
    // Mock weather factor: hotter day => more demand for cold juices
    const weather = { tempC: 33, condition: 'Sunny' };
    const factor = weather.tempC >= 32 ? 1.2 : weather.tempC >= 28 ? 1.1 : 1.0;
    const preds = products.map((p) => {
      const sevenDayQty = salesByProduct[p.id] || 10; // default baseline
      const avg = sevenDayQty / 7;
      const predictedQty = Math.max(0, Math.round(avg * factor));
      const confidence = Math.min(95, Math.round(60 + (avg * 5)));
      const comment = predictedQty > avg ? 'High demand expected due to weather.' : 'Normal demand expected.';
      return { productId: p.id, predictedQty, confidence, comment, date: today };
    });
    setAiPredictions(preds);
  }, [products, sales]);

  // WhatsApp helper
  const sendWhatsAppMessage = (to, template, variables) => {
    const filled = template
      .replace('{amount}', variables.amount ?? '')
      .replace('{juice}', variables.juice ?? '')
      .replace('{items}', variables.items ?? '')
      .replace('{date}', variables.date ?? '');
    const entry = {
      id: `WA_${Date.now()}`,
      to,
      template,
      message: filled,
      time: new Date().toISOString(),
      status: to ? 'SENT' : 'SKIPPED_NO_NUMBER',
    };
    setWhatsAppLogs((prev) => [entry, ...prev]);
  };

  // Auto daily 9 PM summary trigger (mock on load and at 21:00 local)
  useEffect(() => {
    const schedule = () => {
      const now = new Date();
      const ninePM = new Date();
      ninePM.setHours(21, 0, 0, 0);
      let delay = ninePM.getTime() - now.getTime();
      if (delay < 0) delay += 24 * 60 * 60 * 1000;
      return setTimeout(() => {
        const top = todaySales
          .reduce((acc, s) => {
            acc[s.productId] = (acc[s.productId] || 0) + s.qty;
            return acc;
          }, {});
        const topJuiceId = Object.entries(top).sort((a, b) => b[1] - a[1])[0]?.[0];
        const topName = products.find((p) => p.id === topJuiceId)?.name || 'N/A';
        sendWhatsAppMessage(
          '+91 9999999999',
          'Today’s Sales: ₹{amount}. Top Juice: {juice}.',
          { amount: inr.format(todayTotal).replace('₹', ''), juice: topName }
        );
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, [sales, products]);

  // Handle a sale from POSPanel
  const handleSale = ({ productId, qty, paymentMode, customerId }) => {
    const recipe = getRecipe(productId);
    if (!recipe) return;

    // Check stock
    for (const ing of recipe.ingredients) {
      const inv = getInventoryItem(ing.inventoryName);
      const required = ing.qty * qty;
      if (!inv || inv.qty < required) {
        alert(`Insufficient stock for ${ing.inventoryName}. Required: ${required} ${ing.unit}`);
        return;
      }
    }

    const priceEach = sellingPriceForProduct(productId);
    const total = priceEach * qty;

    // Deduct inventory
    const updatedInventory = inventory.map((inv) => {
      const use = recipe.ingredients.find((i) => i.inventoryName === inv.name);
      if (!use) return inv;
      return { ...inv, qty: Math.max(0, Number((inv.qty - use.qty * qty).toFixed(3))) };
    });
    setInventory(updatedInventory);

    const sale = {
      id: `S_${Date.now()}`,
      productId,
      qty,
      priceEach,
      total,
      paymentMode,
      customerId,
      date: new Date().toISOString(),
    };
    setSales((prev) => [sale, ...prev]);

    // WhatsApp bill to customer if phone exists
    const cust = customers.find((c) => c.id === customerId);
    const to = cust?.phone || '';
    const items = `${qty} x ${products.find((p) => p.id === productId)?.name}`;
    sendWhatsAppMessage(to, 'Thanks for visiting! Your total: ₹{amount}.', {
      amount: `${total}`,
      items,
      date: new Date().toLocaleString(),
    });
  };

  // Update recipe proportions
  const updateRecipe = (productId, newIngredients) => {
    setRecipes((prev) => prev.map((r) => (r.productId === productId ? { ...r, ingredients: newIngredients } : r)));
  };

  // Update inventory stock purchase
  const addInventoryStock = (name, addQty, newCostPerUnit) => {
    setInventory((prev) =>
      prev.map((i) =>
        i.name === name
          ? {
              ...i,
              qty: Number((i.qty + addQty).toFixed(3)),
              costPerUnit: newCostPerUnit != null && newCostPerUnit >= 0 ? newCostPerUnit : i.costPerUnit,
            }
          : i
      )
    );
  };

  const changeProductMarkup = (productId, markup) => {
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, markup } : p)));
  };

  // Owner feedback dashboard metrics
  const profitToday = todaySales.reduce((acc, s) => acc + (s.priceEach - costForProduct(s.productId)) * s.qty, 0);
  const topJuice = (() => {
    const map = {};
    for (const s of todaySales) map[s.productId] = (map[s.productId] || 0) + s.qty;
    const topId = Object.entries(map).sort((a, b) => b[1] - a[1])[0]?.[0];
    return products.find((p) => p.id === topId)?.name || 'N/A';
  })();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900">
      <HeroCover role={role} onRoleChange={setRole} />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <DashboardCards
          inr={inr}
          todayTotal={todayTotal}
          profitToday={profitToday}
          lowStockCount={lowStockItems.length}
          predictions={aiPredictions}
          topJuice={topJuice}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
          <div className="lg:col-span-3">
            <POSPanel
              role={role}
              products={products}
              inventory={inventory}
              recipes={recipes}
              customers={customers}
              sellingPriceForProduct={sellingPriceForProduct}
              handleSale={handleSale}
              inr={inr}
            />
          </div>
          <div className="lg:col-span-2">
            <ManagementTabs
              role={role}
              products={products}
              inventory={inventory}
              recipes={recipes}
              whatsAppLogs={whatsAppLogs}
              aiPredictions={aiPredictions}
              onAddInventory={addInventoryStock}
              onUpdateRecipe={updateRecipe}
              onChangeMarkup={changeProductMarkup}
              sellingPriceForProduct={sellingPriceForProduct}
              inr={inr}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
