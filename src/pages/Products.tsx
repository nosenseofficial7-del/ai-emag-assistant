import { useEffect, useState } from 'react';
import { Eye, Trash2, Star, Filter, Download } from 'lucide-react';
import type { Product, Supplier } from '../types';

interface ProductsProps {
  setCurrentPage: (page: string) => void;
  setSelectedProductId: (id: string) => void;
  searchQuery: string;
  t: any;
}

export default function Products({ setCurrentPage, setSelectedProductId, searchQuery, t }: ProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stare filtre
  const [search, setSearch] = useState(searchQuery);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState('');

  // Sincronizeaza cautarea globala
  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedSupplier, selectedCategory, selectedVerdict, searchQuery]);

  const loadSuppliers = () => {
    if (window.api && window.api.getSuppliers) {
      window.api.getSuppliers().then(setSuppliers).catch(console.error);
    }
  };

  const loadProducts = () => {
    setLoading(true);
    if (window.api && window.api.getProducts) {
      const filters = {
        search: search.trim() || undefined,
        supplierId: selectedSupplier || undefined,
        category: selectedCategory || undefined,
        verdict: selectedVerdict || undefined
      };
      
      window.api.getProducts(filters)
        .then((data) => {
          setProducts(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load products:', err);
          setLoading(false);
        });
    }
  };

  const handleToggleWatchlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.api && window.api.toggleWatchlist) {
      window.api.toggleWatchlist(id)
        .then(() => {
          loadProducts();
        })
        .catch(console.error);
    }
  };

  const isRo = t.navDashboard === 'Panou Control';

  const handleDeleteProduct = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmMsg = isRo 
      ? `Sigur doresti sa stergi produsul "${name}" din baza de date?`
      : `Are you sure you want to delete "${name}" from the database?`;
    
    if (confirm(confirmMsg)) {
      if (window.api && window.api.deleteProduct) {
        window.api.deleteProduct(id)
          .then((res) => {
            if (res.success) {
              loadProducts();
            } else {
              alert(`Error: ${res.error}`);
            }
          })
          .catch(console.error);
      }
    }
  };

  const handleViewDetails = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-details');
  };

  const handleExportExcel = () => {
    if (window.api && window.api.exportProductsExcel) {
      window.api.exportProductsExcel(products)
        .then((res: any) => {
          if (res.success) {
            alert(isRo ? 'Exportul in format Excel eMAG a fost finalizat cu succes!' : 'eMAG Excel catalog exported successfully!');
          }
        })
        .catch(console.error);
    }
  };

  const handleExportXml = () => {
    if (window.api && window.api.exportProductsXml) {
      window.api.exportProductsXml(products)
        .then((res: any) => {
          if (res.success) {
            alert(isRo ? 'Exportul feed-ului XML a fost finalizat cu succes!' : 'XML product feed exported successfully!');
          }
        })
        .catch(console.error);
    }
  };

  const formatBani = (bani: number | undefined) => {
    if (bani === undefined) return '—';
    return (bani / 100).toFixed(2) + ' RON';
  };

  const calculateRoi = (buy: number, sell: number | undefined) => {
    if (!sell || buy === 0) return '—';
    const profit = sell - buy;
    const roi = (profit / buy) * 100;
    return roi.toFixed(1) + '%';
  };

  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  return (
    <div className="page-products fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.prodTitle}</h2>
          <p className="page-subtitle">{t.prodSubtitle}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary hover-glow-btn" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
            onClick={handleExportExcel}
            disabled={products.length === 0}
            title={isRo ? "Exporta catalogul curent in format Excel compatibil cu importul eMAG" : "Export current catalog as eMAG Excel template"}
          >
            <Download size={14} /> {t.btnExportExcel}
          </button>
          <button 
            className="btn btn-secondary hover-glow-btn" 
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
            onClick={handleExportXml}
            disabled={products.length === 0}
            title={isRo ? "Exporta feed XML compatibil cu regulile de stoc eMAG" : "Export XML feed compatible with eMAG stock rules"}
          >
            <Download size={14} /> {t.btnExportXml}
          </button>
          <button className="primary-btn hover-glow-btn" onClick={() => setCurrentPage('import')}>
            {t.btnImportCatalog}
          </button>
        </div>
      </div>

      {/* Filter panel */}
      <div className="filter-panel panel-card">
        <div className="filter-header">
          <Filter size={16} /> <strong>{t.filterTitle}</strong>
        </div>
        <div className="filter-grid">
          <div className="filter-group">
            <label>{t.filterSearch}</label>
            <input 
              type="text" 
              placeholder={isRo ? "Cautare dupa nume/SKU/EAN..." : "Search by name/SKU/EAN..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>{t.filterSupplier}</label>
            <select 
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="filter-select"
            >
              <option value="">{t.filterAllSuppliers}</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>{t.filterCategory}</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">{t.filterAllCategories}</option>
              {categories.map(c => (
                <option key={c} value={c || ''}>{c}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>{t.filterVerdict}</label>
            <select 
              value={selectedVerdict}
              onChange={(e) => setSelectedVerdict(e.target.value)}
              className="filter-select"
            >
              <option value="">{t.filterAllVerdicts}</option>
              <option value="CUMPĂRĂ">{isRo ? 'CUMPARA' : 'BUY'}</option>
              <option value="FOARTE BUN">{isRo ? 'FOARTE BUN' : 'VERY GOOD'}</option>
              <option value="RISC MEDIU">{isRo ? 'RISC MEDIU' : 'MEDIUM RISK'}</option>
              <option value="NU MERITĂ">{isRo ? 'NU MERITA' : 'DO NOT BUY'}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">{isRo ? 'Se incarca lista de produse...' : 'Loading product list...'}</div>
        ) : products.length > 0 ? (
          <table className="products-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>{t.tableColWatch}</th>
                <th>{t.tableColName}</th>
                <th>{t.tableColSku}</th>
                <th>{t.tableColEan}</th>
                <th>{t.tableColSupplier}</th>
                <th>{t.tableColBuy}</th>
                <th>{t.tableColSell}</th>
                <th>{t.tableColRoi}</th>
                <th>{t.tableColOpp}</th>
                <th>{t.tableColVerdict}</th>
                <th style={{ width: '100px' }}>{t.tableColActions}</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const hasResearch = p.opportunity_score !== undefined;
                const score = p.opportunity_score;
                
                return (
                  <tr key={p.id} onClick={() => handleViewDetails(p.id)} className="clickable-row">
                    <td onClick={(e) => handleToggleWatchlist(p.id, e)} className="watchlist-cell" title={isRo ? "Adauga in Watchlist" : "Add to Watchlist"}>
                      <Star size={16} className={`star-icon ${hasResearch && score! > 70 ? 'active' : ''}`} />
                    </td>
                    <td>
                      <div className="product-cell-name">
                        <strong>{p.name}</strong>
                        {p.brand && <span className="product-brand">{p.brand}</span>}
                      </div>
                    </td>
                    <td><code>{p.sku}</code></td>
                    <td>{p.ean || (isRo ? 'Fara EAN' : 'No EAN')}</td>
                    <td><span className="supplier-tag">{p.supplier_name}</span></td>
                    <td className="price-col">{formatBani(p.price_supplier)}</td>
                    <td className="price-col">{formatBani(p.price_med)}</td>
                    <td className={`roi-col ${p.price_med && p.price_med > p.price_supplier ? 'text-green' : 'text-danger'}`}>
                      {calculateRoi(p.price_supplier, p.price_med)}
                    </td>
                    <td className="score-col">
                      <strong>{score !== undefined ? score : '—'}</strong>
                    </td>
                    <td>
                      {p.verdict ? (
                        <span className={`badge ${
                          p.verdict === 'CUMPĂRĂ' || p.verdict === 'BUY' || p.verdict === 'CUMPARA' ? 'badge-success' :
                          p.verdict === 'FOARTE BUN' || p.verdict === 'VERY GOOD' ? 'badge-success' :
                          p.verdict === 'RISC MEDIU' || p.verdict === 'MEDIUM RISK' ? 'badge-warning' : 'badge-danger'
                        }`}>{p.verdict}</span>
                      ) : (
                        <span className="badge badge-offline">{t.badgeNoResearch}</span>
                      )}
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="icon-btn text-blue" 
                        onClick={(e) => { e.stopPropagation(); handleViewDetails(p.id); }}
                        title={t.actionDetails}
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        className="icon-btn text-danger" 
                        onClick={(e) => handleDeleteProduct(p.id, p.name, e)}
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
            <p>{isRo ? 'Nu s-au gasit produse in catalog care sa corespunda filtrelor selectate.' : 'No products found in the catalog matching the selected filters.'}</p>
          </div>
        )}
      </div>
    </div>
  );
}
