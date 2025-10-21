import React, { useMemo, useState } from 'react';
import { Package, ListChecks, BotMessageSquare, MessageSquare, IndianRupee } from 'lucide-react';

function TabButton({ label, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
        active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-slate-50 border'
      }`}
    >
      <Icon size={16} />
      <span>{label}</span>
    </button>
  );
}

function InventoryTab({ inventory, onAddInventory }) {
  const [selected, setSelected] = useState(inventory[0]?.name || '');
  const [qty, setQty] = useState('');
  const [cost, setCost] = useState('');

  const item = useMemo(() => inventory.find((i) => i.name === selected), [inventory, selected]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border bg-white p-4">
        <div className="flex flex-wrap items-center gap-3">
          <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border rounded-lg px-3 py-2">
            {inventory.map((i) => (
              <option key={i.id} value={i.name}>{i.name}</option>
            ))}
          </select>
          <input
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder={`Add qty (${item?.unit || ''})`}
            className="border rounded-lg px-3 py-2 w-32"
          />
          <input
            type="number"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="New cost/unit (optional)"
            className="border rounded-lg px-3 py-2 w-48"
          />
          <button
            onClick={() => {
              const addQty = parseFloat(qty || '0');
              if (!addQty) return;
              const c = cost === '' ? undefined : parseFloat(cost);
              onAddInventory(selected, addQty, c);
              setQty('');
              setCost('');
            }}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white"
          >
            Update Stock
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Item</th>
              <th className="text-left p-3">Qty</th>
              <th className="text-left p-3">Unit</th>
              <th className="text-left p-3">Cost/Unit</th>
              <th className="text-left p-3">Reorder Level</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{i.name}</td>
                <td className={`p-3 ${i.qty <= i.reorderLevel ? 'text-red-600 font-semibold' : ''}`}>{i.qty}</td>
                <td className="p-3">{i.unit}</td>
                <td className="p-3">₹{i.costPerUnit}</td>
                <td className="p-3">{i.reorderLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RecipeTab({ products, recipes, onUpdateRecipe, inr, sellingPriceForProduct }) {
  const [selected, setSelected] = useState(products[0]?.id || '');

  const recipe = useMemo(() => recipes.find((r) => r.productId === selected), [recipes, selected]);

  const updateIng = (idx, field, value) => {
    const updated = recipe.ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: field === 'qty' ? parseFloat(value) : value } : ing));
    onUpdateRecipe(selected, updated);
  };

  const cost = useMemo(() => {
    // cost estimation is handled in parent, but here show price summary
    return sellingPriceForProduct(selected);
  }, [selected, recipes]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border rounded-lg px-3 py-2">
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="text-sm text-slate-600">Selling Price: <span className="font-semibold">{inr.format(cost)}</span></div>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="text-left p-3">Ingredient</th>
              <th className="text-left p-3">Qty</th>
              <th className="text-left p-3">Unit</th>
            </tr>
          </thead>
          <tbody>
            {recipe?.ingredients.map((ing, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-3">{ing.inventoryName}</td>
                <td className="p-3">
                  <input
                    type="number"
                    value={ing.qty}
                    onChange={(e) => updateIng(idx, 'qty', e.target.value)}
                    className="w-24 border rounded-lg px-2 py-1"
                  />
                </td>
                <td className="p-3">{ing.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingTab({ products, recipes, inr, onChangeMarkup, sellingPriceForProduct }) {
  const [selected, setSelected] = useState(products[0]?.id || '');
  const product = useMemo(() => products.find((p) => p.id === selected), [products, selected]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <select value={selected} onChange={(e) => setSelected(e.target.value)} className="border rounded-lg px-3 py-2">
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <IndianRupee size={16} className="text-emerald-600" />
          <div className="text-sm text-slate-600">Current Price: <span className="font-semibold">{inr.format(sellingPriceForProduct(selected))}</span></div>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 flex items-center gap-3">
        <label className="text-sm text-slate-600">Markup</label>
        <input
          type="number"
          step="0.05"
          value={product?.markup ?? 0}
          onChange={(e) => onChangeMarkup(selected, parseFloat(e.target.value))}
          className="border rounded-lg px-3 py-2 w-28"
        />
        <div className="text-xs text-slate-500">Auto price = Cost × (1 + Markup)</div>
      </div>

      <div className="rounded-xl border bg-amber-50 p-3 text-amber-900 text-sm">
        Ingredient cost changes automatically reflect in selling price via markup.
      </div>
    </div>
  );
}

function WhatsAppTab({ logs }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left p-3">Time</th>
            <th className="text-left p-3">To</th>
            <th className="text-left p-3">Message</th>
            <th className="text-left p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((l) => (
            <tr key={l.id} className="border-t">
              <td className="p-3 whitespace-nowrap">{new Date(l.time).toLocaleString()}</td>
              <td className="p-3">{l.to || 'N/A'}</td>
              <td className="p-3 max-w-[260px] truncate" title={l.message}>{l.message}</td>
              <td className="p-3">
                <span className={`px-2 py-1 rounded-md text-xs border ${l.status === 'SENT' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                  {l.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AITab({ predictions }) {
  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <table className="min-w-full text-sm">
        <thead className="bg-slate-50 text-slate-600">
          <tr>
            <th className="text-left p-3">Juice</th>
            <th className="text-left p-3">Predicted Qty</th>
            <th className="text-left p-3">Confidence</th>
            <th className="text-left p-3">Comments</th>
          </tr>
        </thead>
        <tbody>
          {predictions.map((p) => (
            <tr key={`${p.productId}_${p.date}`} className="border-t">
              <td className="p-3">{p.productId}</td>
              <td className="p-3">{p.predictedQty}</td>
              <td className="p-3">{p.confidence}%</td>
              <td className="p-3">{p.comment}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ManagementTabs({ role, products, inventory, recipes, whatsAppLogs, aiPredictions, onAddInventory, onUpdateRecipe, onChangeMarkup, sellingPriceForProduct, inr }) {
  const [tab, setTab] = useState('Inventory');

  return (
    <section className="rounded-2xl bg-white/80 backdrop-blur-sm border p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <TabButton label="Inventory" icon={Package} active={tab === 'Inventory'} onClick={() => setTab('Inventory')} />
        <TabButton label="Recipes" icon={ListChecks} active={tab === 'Recipes'} onClick={() => setTab('Recipes')} />
        <TabButton label="Pricing" icon={BotMessageSquare} active={tab === 'Pricing'} onClick={() => setTab('Pricing')} />
        <TabButton label="AI" icon={BotMessageSquare} active={tab === 'AI'} onClick={() => setTab('AI')} />
        <TabButton label="WhatsApp" icon={MessageSquare} active={tab === 'WhatsApp'} onClick={() => setTab('WhatsApp')} />
      </div>

      <div className="mt-4">
        {tab === 'Inventory' && <InventoryTab inventory={inventory} onAddInventory={onAddInventory} />}
        {tab === 'Recipes' && role === 'Owner' && (
          <RecipeTab products={products} recipes={recipes} onUpdateRecipe={onUpdateRecipe} inr={inr} sellingPriceForProduct={sellingPriceForProduct} />
        )}
        {tab === 'Recipes' && role !== 'Owner' && (
          <div className="rounded-xl border bg-amber-50 p-4 text-amber-900 text-sm">Only Owner can edit recipes.</div>
        )}
        {tab === 'Pricing' && role === 'Owner' && (
          <PricingTab products={products} recipes={recipes} onChangeMarkup={onChangeMarkup} sellingPriceForProduct={sellingPriceForProduct} inr={inr} />
        )}
        {tab === 'Pricing' && role !== 'Owner' && (
          <div className="rounded-xl border bg-amber-50 p-4 text-amber-900 text-sm">Only Owner can adjust pricing.</div>
        )}
        {tab === 'AI' && <AITab predictions={aiPredictions} />}
        {tab === 'WhatsApp' && <WhatsAppTab logs={whatsAppLogs} />}
      </div>
    </section>
  );
}

export default ManagementTabs;
