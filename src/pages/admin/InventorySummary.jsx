import React, { useState, useEffect } from 'react';
import { fetchInventorySummary } from '../../lib/supabase';
import { Loader2, RefreshCw } from 'lucide-react';

export default function InventorySummary() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const data = await fetchInventorySummary();
      setProducts(data || []);
    } catch (err) {
      console.error('Error loading inventory:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = [...new Set(products.map((p) => p.category))];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Inventory</h1>
        <button
          onClick={loadInventory}
          className="flex items-center gap-2 text-white/60 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/10 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

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
                        <tr key={product.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3 text-white text-sm">{product.name}</td>
                          <td className="px-4 py-3 text-white/70 text-sm text-center">{product.total_stock}</td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-medium ${product.reserved > 0 ? 'text-yellow-300' : 'text-white/40'}`}>
                              {product.reserved}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`text-sm font-bold ${
                              product.available <= 0
                                ? 'text-red-400'
                                : product.available < product.total_stock * 0.2
                                ? 'text-yellow-300'
                                : 'text-green-400'
                            }`}>
                              {product.available}
                            </span>
                          </td>
                        </tr>
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
                          <span className={`text-sm font-medium ${product.reserved > 0 ? 'text-yellow-300' : 'text-white/40'}`}>
                            {product.reserved}
                          </span>
                        </div>
                        <div>
                          <span className="text-white/50 text-xs block">Available</span>
                          <span className={`text-sm font-bold ${
                            product.available <= 0
                              ? 'text-red-400'
                              : product.available < product.total_stock * 0.2
                              ? 'text-yellow-300'
                              : 'text-green-400'
                          }`}>
                            {product.available}
                          </span>
                        </div>
                      </div>
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
