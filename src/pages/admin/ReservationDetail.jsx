import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReservation, updateReservationStatus } from '../../lib/supabase';
import StatusBadge from '../../components/admin/StatusBadge';
import { Button } from '../../components/ui/button';
import { ArrowLeft, Loader2, User, MapPin, Calendar, Phone, Mail, FileText } from 'lucide-react';

export default function ReservationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchReservation(id);
        setReservation(data);
      } catch (err) {
        console.error('Error loading reservation:', err);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setActionLoading(true);
    try {
      await updateReservationStatus(id, newStatus);
      setReservation((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Error updating status:', err);
    }
    setActionLoading(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="text-center py-16">
        <p className="text-white/40 text-lg mb-4">Reservation not found</p>
        <Button onClick={() => navigate('/admin')} variant="outline" className="border-white/20 text-white">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const r = reservation;
  const cardClass = 'rounded-xl border border-white/10 bg-white/5 p-5';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/admin')}
          className="text-white/70 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">
            Reservation #{r.id.slice(0, 8)}
          </h1>
          <p className="text-white/50 text-sm">
            Created {new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        <StatusBadge status={r.status} />
      </div>

      {/* Actions for pending */}
      {r.status === 'pending' && (
        <div className="flex gap-3 mb-6">
          <Button
            onClick={() => handleStatusChange('confirmed')}
            disabled={actionLoading}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Approve Reservation
          </Button>
          <Button
            onClick={() => handleStatusChange('cancelled')}
            disabled={actionLoading}
            variant="outline"
            className="border-red-500/50 text-red-400 hover:bg-red-500/10"
          >
            Reject
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Client Info */}
        <div className={cardClass}>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Client Information
          </h2>
          <div className="space-y-3">
            <div>
              <span className="text-white/50 text-xs">Name</span>
              <p className="text-white">{r.client_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-white/40" />
              <a href={`tel:${r.client_phone}`} className="text-white hover:text-primary transition-colors">
                {r.client_phone}
              </a>
            </div>
            {r.client_email && (
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-white/40" />
                <a href={`mailto:${r.client_email}`} className="text-white hover:text-primary transition-colors">
                  {r.client_email}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Event Details */}
        <div className={cardClass}>
          <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Event Details
          </h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-white/50 text-xs">Event Date</span>
                <p className="text-white text-sm">{formatDate(r.event_date)}</p>
              </div>
              <div>
                <span className="text-white/50 text-xs">Return Date</span>
                <p className="text-white text-sm">{formatDate(r.return_date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-white/40 mt-1" />
              <p className="text-white text-sm">{r.event_address}</p>
            </div>
            {r.notes && (
              <div className="flex items-start gap-2">
                <FileText className="w-3.5 h-3.5 text-white/40 mt-1" />
                <p className="text-white/70 text-sm">{r.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className={cardClass}>
        <h2 className="text-white font-semibold mb-4">Order Items</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-2 text-white/50 text-sm font-medium">Product</th>
                <th className="text-center py-2 text-white/50 text-sm font-medium">Qty</th>
                <th className="text-right py-2 text-white/50 text-sm font-medium">Unit Price</th>
                <th className="text-right py-2 text-white/50 text-sm font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {r.reservation_items?.map((item, idx) => (
                <tr key={idx} className="border-b border-white/5">
                  <td className="py-3 text-white text-sm">
                    {item.products?.name || item.product_id}
                    {item.products?.category && (
                      <span className="text-white/40 text-xs ml-2">({item.products.category})</span>
                    )}
                  </td>
                  <td className="py-3 text-white/80 text-sm text-center">{item.quantity}</td>
                  <td className="py-3 text-white/80 text-sm text-right">${item.unit_price?.toFixed(2)}</td>
                  <td className="py-3 text-white text-sm text-right font-medium">
                    ${(item.subtotal || item.unit_price * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-white/10">
                <td colSpan={3} className="py-3 text-white font-bold text-right">Total</td>
                <td className="py-3 text-primary font-bold text-right text-lg">
                  ${r.total?.toFixed(2) || '0.00'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
