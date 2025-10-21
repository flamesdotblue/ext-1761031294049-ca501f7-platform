import React from 'react';
import { Wallet, TrendingUp, Package, Bot } from 'lucide-react';

function Card({ title, value, subtitle, icon: Icon, color = 'emerald' }) {
  return (
    <div className={`rounded-2xl border bg-white/80 backdrop-blur-sm p-5 shadow-sm flex items-start gap-4`}> 
      <div className={`p-2.5 rounded-xl bg-${color}-50 text-${color}-600 border border-${color}-100`}>
        <Icon size={20} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-slate-500">{title}</div>
        <div className="text-xl font-semibold text-slate-900">{value}</div>
        {subtitle && <div className="text-xs text-slate-500 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );
}

function DashboardCards({ inr, todayTotal, profitToday, lowStockCount, predictions, topJuice }) {
  const predSummary = predictions?.length
    ? `${predictions.reduce((a, p) => a + p.predictedQty, 0)} cups predicted`
    : 'No data';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Today’s Sales" value={inr.format(todayTotal)} subtitle="Gross revenue" icon={Wallet} color="emerald" />
      <Card title="Profit (Est.)" value={inr.format(profitToday)} subtitle="After ingredient cost" icon={TrendingUp} color="violet" />
      <Card title="Low Stock Items" value={lowStockCount} subtitle="Below reorder level" icon={Package} color="amber" />
      <Card title="AI Prediction" value={predSummary} subtitle={`Top Today: ${topJuice}`} icon={Bot} color="sky" />
    </div>
  );
}

export default DashboardCards;
