'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Loader2, Download, Calendar, ExternalLink } from 'lucide-react';
import { fetchTaxReport } from '../../lib/admin-api';
import { formatDate as formatDateUtil } from '../../lib/format';
import StatusBadge from './StatusBadge';

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function quarterStart(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3, 1).toISOString().split('T')[0];
}

function quarterEnd(d = new Date()) {
  const q = Math.floor(d.getMonth() / 3);
  return new Date(d.getFullYear(), q * 3 + 3, 0).toISOString().split('T')[0];
}

function yearStart(d = new Date()) {
  return new Date(d.getFullYear(), 0, 1).toISOString().split('T')[0];
}

function fmt(n) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function formatMonth(yyyymm) {
  if (!yyyymm) return '—';
  const [y, m] = yyyymm.split('-');
  const date = new Date(Number(y), Number(m) - 1, 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function TaxReportPage() {
  const [from, setFrom] = useState(quarterStart());
  const [to, setTo] = useState(quarterEnd());
  const [groupBy, setGroupBy] = useState('event_date');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await fetchTaxReport({ from, to, groupBy });
      setData(result);
    } catch (err) {
      setError(err.message || 'Failed to load report');
    }
    setLoading(false);
  }, [from, to, groupBy]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const setQuarter = () => {
    setFrom(quarterStart());
    setTo(quarterEnd());
  };

  const setYear = () => {
    setFrom(yearStart());
    setTo(todayISO());
  };

  const setMonth = () => {
    const d = new Date();
    setFrom(new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]);
    setTo(new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]);
  };

  const exportCsv = () => {
    if (!data) return;
    const rows = [
      ['Reservation ID', 'Client', 'Event Date', 'Created At', 'Status', 'Subtotal', 'Delivery', 'Pickup', 'Tax', 'Total'],
      ...data.reservations.map((r) => [
        r.id,
        r.client_name || '',
        r.event_date || '',
        r.created_at || '',
        r.status || '',
        Number(r.subtotal || 0).toFixed(2),
        Number(r.delivery_fee || 0).toFixed(2),
        Number(r.same_day_pickup_fee || 0).toFixed(2),
        Number(r.tax_amount || 0).toFixed(2),
        Number(r.total || 0).toFixed(2),
      ]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-report_${from}_to_${to}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-white text-2xl font-bold">Tax Report</h1>
          <p className="text-white/50 text-sm">Sales tax collected for Texas Comptroller filing</p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data || loading}
          className="flex items-center gap-2 bg-primary/80 hover:bg-primary text-primary-foreground font-semibold px-4 py-2 rounded-lg disabled:opacity-50 text-sm"
        >
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-lg p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-white/60 text-xs">From</label>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded px-3 py-1.5"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-white/60 text-xs">To</label>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded px-3 py-1.5"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-white/60 text-xs">Group by</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-sm rounded px-3 py-1.5"
            >
              <option value="event_date">Event Date</option>
              <option value="created_at">Reservation Date</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2 ml-auto">
            <button onClick={setMonth} className="text-xs bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 px-3 py-1.5 rounded">
              <Calendar className="w-3 h-3 inline mr-1" /> This Month
            </button>
            <button onClick={setQuarter} className="text-xs bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 px-3 py-1.5 rounded">
              <Calendar className="w-3 h-3 inline mr-1" /> This Quarter
            </button>
            <button onClick={setYear} className="text-xs bg-white/5 hover:bg-white/10 text-white/80 border border-white/10 px-3 py-1.5 rounded">
              <Calendar className="w-3 h-3 inline mr-1" /> YTD
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-sm rounded-lg p-3">{error}</div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-white/60" />
        </div>
      )}

      {!loading && data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <SummaryCard label="Reservations" value={data.totals.count} />
            <SummaryCard label="Subtotal" value={fmt(data.totals.subtotal)} />
            <SummaryCard label="Delivery + Pickup" value={fmt(data.totals.delivery + data.totals.pickup)} />
            <SummaryCard label="Sales Tax" value={fmt(data.totals.tax)} highlight />
            <SummaryCard label="Total Revenue" value={fmt(data.totals.revenue)} />
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10">
              <h2 className="text-white font-semibold text-sm">Breakdown by Month</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-2 text-white/60 font-medium">Month</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Reservations</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Subtotal</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Delivery</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Pickup</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Tax</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.byMonth.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-6 text-white/40">No paid reservations in this range</td></tr>
                  )}
                  {data.byMonth.map((row) => (
                    <tr key={row.month} className="border-t border-white/5">
                      <td className="px-4 py-2 text-white">{formatMonth(row.month)}</td>
                      <td className="px-4 py-2 text-right text-white/80">{row.count}</td>
                      <td className="px-4 py-2 text-right text-white/80">{fmt(row.subtotal)}</td>
                      <td className="px-4 py-2 text-right text-white/80">{fmt(row.delivery)}</td>
                      <td className="px-4 py-2 text-right text-white/80">{fmt(row.pickup)}</td>
                      <td className="px-4 py-2 text-right text-primary font-semibold">{fmt(row.tax)}</td>
                      <td className="px-4 py-2 text-right text-white">{fmt(row.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <h2 className="text-white font-semibold text-sm">Reservations ({data.reservations.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left px-4 py-2 text-white/60 font-medium">Event Date</th>
                    <th className="text-left px-4 py-2 text-white/60 font-medium">Client</th>
                    <th className="text-left px-4 py-2 text-white/60 font-medium">Status</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Subtotal</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Tax</th>
                    <th className="text-right px-4 py-2 text-white/60 font-medium">Total</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {data.reservations.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-6 text-white/40">No reservations</td></tr>
                  )}
                  {data.reservations.map((r) => (
                    <tr key={r.id} className="border-t border-white/5">
                      <td className="px-4 py-2 text-white/80">{formatDateUtil(r.event_date)}</td>
                      <td className="px-4 py-2 text-white">{r.client_name}</td>
                      <td className="px-4 py-2"><StatusBadge status={r.status} /></td>
                      <td className="px-4 py-2 text-right text-white/80">{fmt(r.subtotal)}</td>
                      <td className="px-4 py-2 text-right text-primary font-semibold">{fmt(r.tax_amount)}</td>
                      <td className="px-4 py-2 text-right text-white">{fmt(r.total)}</td>
                      <td className="px-4 py-2">
                        <Link href={`/admin/reservations/${r.id}`} className="text-white/50 hover:text-white">
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ label, value, highlight }) {
  return (
    <div className={`rounded-lg border p-4 ${highlight ? 'bg-primary/10 border-primary/30' : 'bg-white/5 border-white/10'}`}>
      <div className="text-white/60 text-xs uppercase tracking-wider">{label}</div>
      <div className={`text-lg font-bold mt-1 ${highlight ? 'text-primary' : 'text-white'}`}>{value}</div>
    </div>
  );
}
