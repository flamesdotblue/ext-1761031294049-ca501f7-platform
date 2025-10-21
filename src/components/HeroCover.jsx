import React from 'react';
import Spline from '@splinetool/react-spline';

function HeroCover({ role, onRoleChange }) {
  return (
    <section className="relative h-[52vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/MscgRj2doJR2RRa2/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/30 to-white pointer-events-none" />
      <div className="relative z-10 h-full flex items-end max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="backdrop-blur-sm bg-white/70 border border-white/60 rounded-2xl p-4 sm:p-6 shadow-lg w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Juice Shop AI POS & Inventory</h1>
            <p className="text-slate-600">INR pricing • AI demand forecasts • WhatsApp billing • Recipes & stock control</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-slate-700 text-sm">Role</label>
            <select
              value={role}
              onChange={(e) => onRoleChange(e.target.value)}
              className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option>Owner</option>
              <option>Salesperson</option>
            </select>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroCover;
