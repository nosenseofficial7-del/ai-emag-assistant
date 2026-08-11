import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Trash2, RefreshCw, ShieldAlert } from 'lucide-react';
import type { PortfolioItem } from '../types';

interface PortfolioProps {
  setCurrentPage: (page: string) => void;
  setSelectedProductId: (id: string) => void;
  t: any;
}

interface Alert {
  id: string;
  product_id?: string;
  product_name?: string;
  type: 'buybox_loss' | 'stock_critical';
  message: string;
  is_read: number;
  created_at: string;
}

export default function Portfolio({ setCurrentPage, setSelectedProductId, t }: PortfolioProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  useEffect(() => {
    loadPortfolio();
    loadAlerts();

    // Listen for background alerts live from daemon
    if (window.api && window.api.onBackgroundAlert) {
      const unsubscribe = window.api.onBackgroundAlert(() => {
        loadAlerts();
        loadPortfolio();
      });
      return () => unsubscribe();
    }
  }, []);

  const loadPortfolio = () => {
    setLoading(true);
    if (window.api && window.api.getPortfolio) {
      window.api.getPortfolio()
        .then((data) => {
          setPortfolio(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const loadAlerts = () => {
    if (window.api && window.api.getAlerts) {
      window.api.getAlerts().then(setAlerts).catch(console.error);
    }
  };

  const isRo = t.navDashboard === 'Panou Control';

  const handleSyncEmag = async () => {
    if (syncing) return;
    setSyncing(true);
    setSyncMessage(t.msgSyncing);

    try {
      const apiConfig = await window.api.getSettings('emag_api_config');
      const config = apiConfig || { username: 'demo', password: '' };

      const syncMsgDownload = isRo 
        ? "Descarca ofertele active si sincronizeaza portofoliul local..."
        : "Downloading active offers and synchronizing local portfolio...";
      setSyncMessage(syncMsgDownload);
      
      const res = await window.api.syncEmagProducts(config);
      
      if (res.success) {
        const syncSuccessMsg = isRo
          ? `Sincronizare reusita! Au fost sincronizate ${res.count} oferte in mod ${res.mode.toUpperCase()}.`
          : `Sync successful! Synchronized ${res.count} offers in ${res.mode.toUpperCase()} mode.`;
        setSyncMessage(syncSuccessMsg);
        loadPortfolio();
        loadAlerts();
      } else {
        alert(`Error syncing eMAG: ${res.error}`);
      }
    } catch (e: any) {
      alert(`Error: ${e.message}`);
    } finally {
      setTimeout(() => {
        setSyncing(false);
        setSyncMessage(null);
      }, 3000);
    }
  };

  const handleMarkAlertRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.api && window.api.markAlertRead) {
      window.api.markAlertRead(id).then(() => {
        loadAlerts();
      }).catch(console.error);
    }
  };

  const handleDeleteItem = (id: string, sku: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg = isRo
      ? `Sigur doresti sa stergi inregistrarea SKU "${sku}" din portofoliul tau?`
      : `Are you sure you want to delete SKU "${sku}" from your portfolio?`;
    
    if (confirm(confirmMsg)) {
      if (window.api && window.api.deletePortfolioItem) {
        window.api.deletePortfolioItem(id)
          .then((res) => {
            if (res.success) {
              loadPortfolio();
            } else {
              alert(`Error: ${res.error}`);
            }
          })
          .catch(console.error);
      }
    }
  };

  const formatBani = (bani: number | undefined) => {
    if (bani === undefined) return '0.00 RON';
    return (bani / 100).toFixed(2) + ' RON';
  };

  const getEstProfitPerItem = (purchase: number, sale: number) => {
    const comision = Math.round((sale * 15) / 100); // 15% default eMAG commission
    return sale - purchase - comision;
  };

  const getMargin = (purchase: number, sale: number) => {
    const profit = getEstProfitPerItem(purchase, sale);
    if (sale === 0) return 0;
    return (profit / sale) * 100;
  };

  const getRoi = (purchase: number, sale: number) => {
    const profit = getEstProfitPerItem(purchase, sale);
    if (purchase === 0) return 0;
    return (profit / purchase) * 100;
  };

  const handleProductClick = (productId: string | undefined) => {
    if (productId) {
      setSelectedProductId(productId);
      setCurrentPage('product-details');
    }
  };

  const lowStockAlerts = portfolio.filter(item => item.stock_qty <= 3 && item.stock_qty > 0);
  const deadStockAlerts = portfolio.filter(item => {
    const purchaseDate = new Date(item.purchase_date);
    const diffDays = (new Date().getTime() - purchaseDate.getTime()) / (1000 * 3600 * 24);
    return diffDays > 60 && item.stock_qty > 5;
  });

  const activeBuyboxAlerts = alerts.filter(a => a.type === 'buybox_loss' && a.is_read === 0);
  const activeStockCriticalAlerts = alerts.filter(a => a.type === 'stock_critical' && a.is_read === 0);

  return (
    <div className="page-portfolio fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.portTitle}</h2>
          <p className="page-subtitle">{t.portSubtitle}</p>
        </div>
        <div>
          <button 
            className="btn btn-primary hover-glow-btn" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            onClick={handleSyncEmag}
            disabled={syncing}
          >
            <RefreshCw size={16} className={syncing ? 'spin' : ''} />
            {syncing ? (isRo ? 'Se sincronizeaza...' : 'Syncing...') : t.btnSyncEmag}
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className="alert alert-info animated-alert" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
          <RefreshCw size={16} className="spin text-blue" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Alerte eMAG Live (Buybox & Stock Critic) */}
      {(activeBuyboxAlerts.length > 0 || activeStockCriticalAlerts.length > 0) && (
        <div className="alerts-dashboard-section" style={{ marginTop: '15px' }}>
          {activeBuyboxAlerts.map(alertItem => (
            <div key={alertItem.id} className="alert alert-danger portfolio-alert-card animated-alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldAlert size={20} />
                <div>
                  <strong>{t.alertBuyboxTitle}</strong> {alertItem.message}
                </div>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={(e) => handleMarkAlertRead(alertItem.id, e)}
              >
                {t.btnHide}
              </button>
            </div>
          ))}

          {activeStockCriticalAlerts.map(alertItem => (
            <div key={alertItem.id} className="alert alert-info portfolio-alert-card animated-alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} className="text-orange" />
                <div>
                  <strong>{t.alertB2BStockTitle}</strong> {alertItem.message}
                </div>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ fontSize: '11px', padding: '4px 8px' }}
                onClick={(e) => handleMarkAlertRead(alertItem.id, e)}
              >
                {t.btnHide}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Alerte Standard (Stoc mic local / Dead stock) */}
      {(lowStockAlerts.length > 0 || deadStockAlerts.length > 0) && (
        <div className="alerts-dashboard-section" style={{ marginTop: '15px' }}>
          {lowStockAlerts.length > 0 && (
            <div className="alert alert-danger portfolio-alert-card animated-alert">
              <AlertCircle size={20} />
              <div>
                <strong>{t.alertStockTitle}</strong> {t.alertStockDesc}
                <ul>
                  {lowStockAlerts.map(item => (
                    <li key={item.id}>
                      {item.product_name || `SKU: ${item.sku}`} ({isRo ? 'Stoc curent' : 'Current stock'}: <strong>{item.stock_qty} {isRo ? 'unitati' : 'units'}</strong>)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {deadStockAlerts.length > 0 && (
            <div className="alert alert-info portfolio-alert-card animated-alert">
              <AlertTriangle size={20} className="text-orange" />
              <div>
                <strong>{t.alertDeadTitle}</strong> {t.alertDeadDesc}
                <ul>
                  {deadStockAlerts.map(item => (
                    <li key={item.id}>
                      {item.product_name || `SKU: ${item.sku}`} ({isRo ? 'Achizitionat pe' : 'Purchased on'}: {new Date(item.purchase_date).toLocaleDateString('ro-RO')} • {isRo ? 'Ramas' : 'Left'}: {item.stock_qty} buc.)
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Portfolio Table */}
      <div className="table-container" style={{ marginTop: '15px' }}>
        {loading ? (
          <div className="loading-state">{isRo ? 'Se incarca portofoliul...' : 'Loading portfolio...'}</div>
        ) : portfolio.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>{t.tableColName} / SKU</th>
                <th>{t.tableColEan}</th>
                <th>{t.tableColBuy}</th>
                <th>{t.tableColSell}</th>
                <th>{t.tableColTotalInvest}</th>
                <th>{t.tableColQty}</th>
                <th>Marja / ROI</th>
                <th>{t.tableColDate}</th>
                <th style={{ width: '80px' }}>{t.tableColActions}</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((item) => {
                const totalInvested = item.purchase_price * item.purchase_qty;
                const margin = getMargin(item.purchase_price, item.sale_price);
                const roi = getRoi(item.purchase_price, item.sale_price);
                const isLowStock = item.stock_qty <= 3;
                
                return (
                  <tr 
                    key={item.id} 
                    className={item.product_id ? 'clickable-row' : ''} 
                    onClick={() => handleProductClick(item.product_id)}
                  >
                    <td>
                      <div className="product-cell-name">
                        <strong>{item.product_name || (isRo ? 'Produs Custom (Fara link catalog)' : 'Custom Product (Unlinked)')}</strong>
                        <span className="product-brand">SKU: <code>{item.sku}</code></span>
                      </div>
                    </td>
                    <td>{item.ean || '—'}</td>
                    <td className="price-col">{formatBani(item.purchase_price)}</td>
                    <td className="price-col">{formatBani(item.sale_price)}</td>
                    <td className="price-col font-bold">{formatBani(totalInvested)}</td>
                    <td>
                      <span className={`stock-badge ${isLowStock ? 'badge-low-stock' : 'badge-good-stock'}`}>
                        {item.purchase_qty} {isRo ? 'initial' : 'initial'} / <strong>{item.stock_qty} {isLowStock ? t.badgeLowStock : t.badgeGoodStock}</strong>
                      </span>
                    </td>
                    <td>
                      <div className="margin-roi-cell">
                        <span className="margin-tag">{t.detailsOutMargin}: {margin.toFixed(1)}%</span>
                        <span className="roi-tag text-green">ROI: {roi.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>{new Date(item.purchase_date).toLocaleDateString('ro-RO')}</td>
                    <td className="actions-cell">
                      <button 
                        className="icon-btn text-danger" 
                        onClick={(e) => handleDeleteItem(item.id, item.sku, e)}
                        title={t.actionDelete}
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
            <p>{isRo ? 'Portofoliul tau este gol momentan. Adauga produse din paginile de detalii ale catalogului sau sincronizeaza contul eMAG Partner.' : 'Your portfolio is empty. Add products from the catalog details page or sync your eMAG Partner store.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
