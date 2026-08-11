import { useEffect, useState } from 'react';
import { Star, Eye, Trash2 } from 'lucide-react';
import type { Product } from '../types';

interface WatchlistProps {
  setCurrentPage: (page: string) => void;
  setSelectedProductId: (id: string) => void;
  t: any;
}

export default function Watchlist({ setCurrentPage, setSelectedProductId, t }: WatchlistProps) {
  const isRo = t.navDashboard === 'Panou Control';
  const [watchlist, setWatchlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
  }, []);

  const loadWatchlist = () => {
    setLoading(true);
    if (window.api && window.api.getWatchlist) {
      window.api.getWatchlist()
        .then((data: any) => {
          setWatchlist(data);
          setLoading(false);
        })
        .catch((err: any) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const handleRemoveFromWatchlist = (id: string, e: any) => {
    e.stopPropagation();
    if (window.api && window.api.toggleWatchlist) {
      window.api.toggleWatchlist(id)
        .then((res: any) => {
          if (res.success && !res.inWatchlist) {
            loadWatchlist();
          }
        })
        .catch(console.error);
    }
  };

  const formatBani = (bani: number | undefined) => {
    if (bani === undefined) return 'N/A';
    return (bani / 100).toFixed(2) + ' lei';
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-details');
  };

  const calculateRoi = (buy: number, sell: number | undefined) => {
    if (!sell || buy === 0) return 0;
    const profit = sell - buy;
    return (profit / buy) * 100;
  };

  return (
    <div className="page-watchlist fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{isRo ? 'Watchlist (Produse Urmărite)' : 'Watchlist (Tracked Products)'}</h2>
          <p className="page-subtitle">{isRo ? 'Urmărește oportunitățile selectate, modificările de prețuri de la furnizori și scorurile eMAG în timp real.' : 'Track selected opportunities, supplier price changes, and eMAG scores in real-time.'}</p>
        </div>
      </div>

      {/* Watchlist Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">{isRo ? 'Se încarcă watchlist-ul...' : 'Loading watchlist...'}</div>
        ) : watchlist.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>{isRo ? 'Denumire Produs' : 'Product Name'}</th>
                <th>SKU</th>
                <th>{isRo ? 'Furnizor' : 'Supplier'}</th>
                <th>{isRo ? 'Preț Achiz.' : 'Buy Price'}</th>
                <th>{isRo ? 'Preț eMAG Mediu' : 'eMAG Avg Price'}</th>
                <th>{isRo ? 'ROI Estimativ' : 'Est. ROI'}</th>
                <th>Opp Score</th>
                <th>{isRo ? 'Verdict AI' : 'AI Verdict'}</th>
                <th style={{ width: '100px' }}>{isRo ? 'Acțiuni' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map((p) => {
                const roi = calculateRoi(p.price_supplier, p.price_med);
                
                return (
                  <tr key={p.id} className="clickable-row" onClick={() => handleProductClick(p.id)}>
                    <td onClick={(e) => handleRemoveFromWatchlist(p.id, e)} className="watchlist-cell active">
                      <Star size={16} fill="currentColor" className="star-icon active" />
                    </td>
                    <td>
                      <div className="product-cell-name">
                        <strong>{p.name}</strong>
                        {p.brand && <span className="product-brand">{p.brand}</span>}
                      </div>
                    </td>
                    <td><code>{p.sku}</code></td>
                    <td><span className="supplier-tag">{p.supplier_name}</span></td>
                    <td className="price-col">{formatBani(p.price_supplier)}</td>
                    <td className="price-col">{formatBani(p.price_med)}</td>
                    <td className={`roi-col ${roi >= 35 ? 'text-green' : 'text-orange'}`}>
                      {roi.toFixed(1)}%
                    </td>
                    <td className="score-col"><strong>{p.opportunity_score !== undefined ? p.opportunity_score : '—'}</strong></td>
                    <td>
                      {p.verdict ? (
                        <span className={`badge ${
                          p.verdict === 'CUMPĂRĂ' || p.verdict === 'BUY' ? 'badge-success' :
                          p.verdict === 'FOARTE BUN' || p.verdict === 'VERY GOOD' ? 'badge-success' :
                          p.verdict === 'RISC MEDIU' || p.verdict === 'MEDIUM RISK' ? 'badge-warning' : 'badge-danger'
                        }`}>{p.verdict}</span>
                      ) : (
                        <span className="badge badge-offline">{isRo ? 'Fără Analiză' : 'No Analysis'}</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="icon-btn text-blue" 
                        onClick={(e) => { e.stopPropagation(); handleProductClick(p.id); }}
                        title={isRo ? 'Vizualizează Analiza' : 'View Analysis'}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="icon-btn text-danger" 
                        onClick={(e) => handleRemoveFromWatchlist(p.id, e)}
                        title={isRo ? 'Elimină din Urmărire' : 'Remove from Tracked'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <p>{isRo ? 'Nu urmărești niciun produs momentan. Adaugă produse din catalog apăsând pe steluța din dreptul lor.' : 'No products tracked currently. Click the star icon next to any product in the catalog to add it to your watchlist.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
