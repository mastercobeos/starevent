'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchInventorySummary } from '../../lib/supabase';
import { fetchAdminReservation } from '../../lib/admin-api';
import StatusBadge from './StatusBadge';
import { Loader2, RefreshCw, ChevronLeft, ChevronRight, CalendarDays, ExternalLink, ChevronDown, ChevronUp, Clock } from 'lucide-react';

export default function InventorySummary() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [reservationCache, setReservationCache] = useState({});
  const [loadingHolds, setLoadingHolds] = useState(false);

  const loadInventory = async (date = selectedDate) => {
    setLoading(true);
    try {
      const data = await fetchInventorySummary(date);
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleDateChange = (newDate) => {
    setSelectedDate(newDate);
    setExpandedProduct(null);
    loadInventory(newDate);
  };

  const shiftDate = (days) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    handleDateChange(d.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    handleDateChange(new Date().toISOString().split('T')[0]);
  };

  const handleExpandProduct = async (product) => {
    if (expandedProduct === product.id) {
      setExpandedProduct(null);
      return;
    }
    setExpandedProduct(product.id);

    // Fetch reservation details for holds we haven't cached yet
    const uncachedIds = product.holds
      .map((h) => h.reservation_id)
      .filter((id) => id && !reservationCache[id]);

    if (uncachedIds.length > 0) {
      setLoadingHolds(true);
      try {
        const results = await Promise.all(
          uncachedIds.map((id) => fetchAdminReservation(id).catch(() => null))
        );
        const newCache = { ...reservationCache };
        results.forEach((res, i) => {
          if (res) newCache[uncachedIds[i]] = res;
        });
        setReservationCache(newCache);
      } catch (err) {
        console.error('Error fetching reservation details:', err);
      }
      setLoadingHolds(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getClientName = (r) => {
    if (r.first_name && r.last_name) return `${r.first_name} ${r.last_name}`;
    return r.client_name || 'Unknown';
  };

  const formatTime12 = (time24) => {
    if (!time24) return null;
    const [h, m] = time24.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const getAvailableAgain = (res) => {
    if (!res) return null;
    const returnDate = res.return_date;
    const endTime = res.event_end_time;
    if (!returnDate) return null;
    if (endTime) {
      const [h, m] = endTime.split(':').map(Number);
      const availH = h + 3;
      const availDate = new Date(returnDate + 'T00:00:00');
      if (availH >= 24) {
        availDate.setDate(availDate.getDate() + 1);
        const finalH = availH - 24;
        return {
          date: availDate.toISOString().split('T')[0],
          time: `${finalH % 12 || 12}:${String(m).padStart(2, '0')} ${finalH >= 12 ? 'PM' : 'AM'}`,
        };
      }
      return {
        date: returnDate,
        time: `${availH % 12 || 12}:${String(m).padStart(2, '0')} ${availH >= 12 ? 'PM' : 'AM'}`,
      };
    }
    // No end time — assume next day
    const nextDay = new Date(returnDate + 'T00:00:00');
    nextDay.setDate(nextDay.getDate() + 1);
    return { date: nextDay.toISOString().split('T')[0], time: null };
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  const categories = [...new Set(products.map((p) => p.category))];

  const renderHoldsList = (product) => {
    if (expandedProduct !== product.id || !product.holds?.length) return null;

    return (
      <div className="bg-white/[0.03] border-l-2 border-primary/30 rounded-r-lg">
        {loadingHolds ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          </div>
        ) : (
          product.holds.map((hold, idx) => {
            const res = reservationCache[hold.reservation_id];
            const availAgain = getAvailableAgain(res);
            return (
              <div
                key={hold.reservation_id + '-' + idx}
                className="py-2.5 px-4 border-b border-white/5 last:border-0"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-white/40 text-xs font-mono shrink-0">
                      #{hold.reservation_id?.slice(0, 8)}
                    </span>
                    {res ? (
                      <>
                        <span className="text-white text-sm truncate">{getClientName(res)}</span>
                        <StatusBadge status={res.status} />
                      </>
                    ) : (
                      <span className="text-white/30 text-xs">Loading...</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-yellow-300 text-sm font-medium">x{hold.quantity}</span>
                    <Link
                      href={`/admin/reservations/${hold.reservation_id}`}
                      className="text-primary/70 hover:text-primary text-xs flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" /> View
                    </Link>
                  </div>
                </div>
                {/* Time details row */}
                {res && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 ml-0 sm:ml-[calc(0.75rem+theme(spacing.3))]">
                    <span className="text-white/40 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(res.event_date)}
                      {res.event_start_time && `, ${formatTime12(res.event_start_time)}`}
                      {res.event_end_time && ` — ${formatTime12(res.event_end_time)}`}
                    </span>
                    {res.return_date && res.return_date !== res.event_date && (
                      <span className="text-white/30 text-xs">
                        Return: {formatDate(res.return_date)}
                      </span>
                    )}
                    {availAgain && (
                      <span className="text-green-400/70 text-xs">
                        Available again: {formatDate(availAgain.date)}{availAgain.time && ` ${availAgain.time}`}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <div className="flex items-center gap-2">
          {/* Date Navigation */}
          <div className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 p-1">
            <button
              onClick={() => shiftDate(-1)}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Previous day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="relative flex items-center">
              <CalendarDays className="w-3.5 h-3.5 text-white/40 absolute left-2 pointer-events-none" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="pl-7 pr-2 py-1 bg-transparent text-white text-sm focus:outline-none [color-scheme:dark] cursor-pointer"
              />
            </div>
            <button
              onClick={() => shiftDate(1)}
              className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
              title="Next day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {!isToday && (
            <button
              onClick={goToToday}
              className="px-3 py-2 text-xs text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Today
            </button>
          )}
          <button
            onClick={() => loadInventory()}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Date indicator */}
      {!isToday && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm">
          Showing availability for {formatDate(selectedDate)}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category}>
              <h2 className="text-white/80 font-semibold text-lg mb-3 capitalize">{category}</h2>

              {/* Desktop Table */}
              <div className="hidden sm:block rounded-xl border border-white/10 overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Product</th>
                      <th className="text-center px-4 py-3 text-white/60 text-sm font-medium">Total Stock</th>
                      <th className="text-center px-4 py-3 text-white/60 text-sm font-medium">Reserved</th>
                      <th className="text-center px-4 py-3 text-white/60 text-sm font-medium">Available</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => p.category === category)
                      .map((product) => (
                        <React.Fragment key={product.id}>
                          <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-white text-sm">{product.name}</td>
                            <td className="px-4 py-3 text-white/70 text-sm text-center">{product.total_stock}</td>
                            <td className="px-4 py-3 text-center">
                              {product.reserved > 0 ? (
                                <button
                                  onClick={() => handleExpandProduct(product)}
                                  className="inline-flex items-center gap-1 text-sm font-medium text-yellow-300 hover:text-yellow-200 transition-colors"
                                >
                                  {product.reserved}
                                  {expandedProduct === product.id ? (
                                    <ChevronUp className="w-3 h-3" />
                                  ) : (
                                    <ChevronDown className="w-3 h-3" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-sm font-medium text-white/40">0</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`text-sm font-bold ${
                                  product.available <= 0
                                    ? 'text-red-400'
                                    : product.available < product.total_stock * 0.2
                                    ? 'text-yellow-300'
                                    : 'text-green-400'
                                }`}
                              >
                                {product.available}
                              </span>
                            </td>
                          </tr>
                          {/* Expanded holds row */}
                          {expandedProduct === product.id && product.holds?.length > 0 && (
                            <tr>
                              <td colSpan={4} className="px-4 pb-3">
                                {renderHoldsList(product)}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden space-y-2">
                {products
                  .filter((p) => p.category === category)
                  .map((product) => (
                    <div key={product.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <h3 className="text-white font-medium text-sm mb-2">{product.name}</h3>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <span className="text-white/50 text-xs block">Stock</span>
                          <span className="text-white text-sm font-medium">{product.total_stock}</span>
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">Reserved</span>
                          {product.reserved > 0 ? (
                            <button
                              onClick={() => handleExpandProduct(product)}
                              className="inline-flex items-center gap-1 text-sm font-medium text-yellow-300"
                            >
                              {product.reserved}
                              {expandedProduct === product.id ? (
                                <ChevronUp className="w-3 h-3" />
                              ) : (
                                <ChevronDown className="w-3 h-3" />
                              )}
                            </button>
                          ) : (
                            <span className="text-sm font-medium text-white/40">0</span>
                          )}
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">Available</span>
                          <span
                            className={`text-sm font-bold ${
                              product.available <= 0
                                ? 'text-red-400'
                                : product.available < product.total_stock * 0.2
                                ? 'text-yellow-300'
                                : 'text-green-400'
                            }`}
                          >
                            {product.available}
                          </span>
                        </div>
                      </div>
                      {/* Mobile expanded holds */}
                      {expandedProduct === product.id && product.holds?.length > 0 && (
                        <div className="mt-3">{renderHoldsList(product)}</div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
