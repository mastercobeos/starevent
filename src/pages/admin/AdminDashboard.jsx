import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchAllReservations, updateReservationStatus } from '../../lib/supabase';
import StatusBadge from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/button';
import { Loader2, Eye, Check, X, RefreshCw } from 'lucide-react';

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

export default function AdminDashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  const loadReservations = async () => {
    setLoading(true);
    try {
      const data = await fetchAllReservations();
      setReservations(data || []);
    } catch (err) {
      console.error('Error loading reservations:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    setActionLoading(id);
    try {
      await updateReservationStatus(id, newStatus);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    }
    setActionLoading(null);
  };

  const filtered =
    activeTab === 'all'
      ? reservations
      : reservations.filter((r) => r.status === activeTab);

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Reservations</h1>
        <button
          onClick={loadReservations}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {TABS.map((tab) => {
          const count =
            tab === 'all'
              ? reservations.length
              : reservations.filter((r) => r.status === tab).length;
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-1.5 text-xs opacity-70">({count})</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-white/40 text-lg">No reservations found</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-white/5">
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Client</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Event Date</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Return</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Total</th>
                  <th className="text-left px-4 py-3 text-white/60 text-sm font-medium">Items</th>
                  <th className="text-right px-4 py-3 text-white/60 text-sm font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((res) => (
                  <tr key={res.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-white text-sm font-medium">{res.client_name}</div>
                      <div className="text-white/50 text-xs">{res.client_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-white/80 text-sm">{formatDate(res.event_date)}</td>
                    <td className="px-4 py-3 text-white/80 text-sm">{formatDate(res.return_date)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={res.status} />
                    </td>
                    <td className="px-4 py-3 text-primary font-semibold text-sm">
                      ${res.total?.toFixed(2) || '0.00'}
                    </td>
                    <td className="px-4 py-3 text-white/60 text-sm">
                      {res.reservation_items?.length || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to={`/admin/reservations/${res.id}`}
                          className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        {res.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusChange(res.id, 'confirmed')}
                              disabled={actionLoading === res.id}
                              className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
                              title="Approve"
                            >
                              {actionLoading === res.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              onClick={() => handleStatusChange(res.id, 'cancelled')}
                              disabled={actionLoading === res.id}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((res) => (
              <div
                key={res.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-white font-semibold text-sm">{res.client_name}</h3>
                    <p className="text-white/50 text-xs">{res.client_phone}</p>
                  </div>
                  <StatusBadge status={res.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="text-white/50 text-xs">Event</span>
                    <p className="text-white/80">{formatDate(res.event_date)}</p>
                  </div>
                  <div>
                    <span className="text-white/50 text-xs">Return</span>
                    <p className="text-white/80">{formatDate(res.return_date)}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">${res.total?.toFixed(2) || '0.00'}</span>
                  <div className="flex items-center gap-1">
                    <Link
                      to={`/admin/reservations/${res.id}`}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                    {res.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusChange(res.id, 'confirmed')}
                          disabled={actionLoading === res.id}
                          className="p-2 text-green-400 hover:bg-green-500/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStatusChange(res.id, 'cancelled')}
                          disabled={actionLoading === res.id}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
