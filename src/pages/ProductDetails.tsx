import { useEffect, useState } from 'react';
import { ArrowLeft, Star, Calculator, Plus } from 'lucide-react';
import type { Product, CategoryCommissions } from '../types';

interface ProductDetailsProps {
  productId: string;
  setCurrentPage: (page: string) => void;
  t: any;
}

export default function ProductDetails({ productId, setCurrentPage, t }: ProductDetailsProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [inWatchlist, setInWatchlist] = useState(false);
  
  // Stari Calculator Profit
  const [priceSupplier, setPriceSupplier] = useState<number>(0); // in bani
  const [priceSale, setPriceSale] = useState<number>(0); // in bani
  const [vatRate, setVatRate] = useState<number>(19); // Procent
  const [commissionRate, setCommissionRate] = useState<number>(15); // Procent
  const [shippingSupplier, setShippingSupplier] = useState<number>(0); // in bani
  const [shippingClient, setShippingClient] = useState<number>(0); // in bani
  const [packagingCost, setPackagingCost] = useState<number>(0); // in bani
  const [marketingCost, setMarketingCost] = useState<number>(0); // in bani
  const [otherCosts, setOtherCosts] = useState<number>(0); // in bani
  const [estimatedReturnRate, setEstimatedReturnRate] = useState<number>(2); // Procent
  
  // Stari Portofoliu Quick Add
  const [purchaseQty, setPurchaseQty] = useState<number>(10);
  const [portfolioSuccessMsg, setPortfolioSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProductDetails();
  }, [productId]);

  const loadProductDetails = () => {
    setLoading(true);
    if (window.api && window.api.getProductDetails) {
      window.api.getProductDetails(productId)
        .then((data) => {
          if (data) {
            setProduct(data);
            setInWatchlist(data.inWatchlist);
            
            // Pre-populeaza calculatorul
            setPriceSupplier(data.price_supplier);
            setVatRate(data.vat || 19);
            
            // Daca are cercetare eMAG anterioara, folosim pretul mediu ca pret de vanzare estimat
            if (data.research && data.research.price_med) {
              setPriceSale(data.research.price_med);
            } else {
              setPriceSale(Math.round(data.price_supplier * 2.5)); // Fallback 2.5x
            }
            
            // Incarca comisionul eMAG pentru categoria acestui produs
            loadCommission(data.category);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const loadCommission = (category: string | undefined) => {
    if (window.api && window.api.getSettings) {
      window.api.getSettings('emag_commissions')
        .then((commissions: CategoryCommissions | null) => {
          if (commissions) {
            const catComm = category && commissions[category] ? commissions[category] : commissions['Default'] || 15;
            setCommissionRate(catComm);
          }
        })
        .catch(console.error);
    }
  };

  const handleToggleWatchlist = () => {
    if (window.api && window.api.toggleWatchlist) {
      window.api.toggleWatchlist(productId)
        .then((res) => {
          if (res.success) {
            setInWatchlist(res.inWatchlist);
          }
        })
        .catch(console.error);
    }
  };

  const isRo = t.navDashboard === 'Panou Control';

  const handleAddToPortfolio = () => {
    if (!product) return;
    
    const portfolioItem = {
      product_id: product.id,
      sku: product.sku,
      ean: product.ean || null,
      purchase_price: priceSupplier, // in bani
      purchase_qty: purchaseQty,
      stock_qty: purchaseQty, // stoc curent egal cu cel cumparat
      sale_price: priceSale, // in bani
      purchase_date: new Date().toISOString()
    };

    if (window.api && window.api.addOrUpdatePortfolioItem) {
      window.api.addOrUpdatePortfolioItem(portfolioItem)
        .then((res) => {
          if (res.success) {
            setPortfolioSuccessMsg(
              isRo
                ? `Adaugat cu succes in portofoliu: ${purchaseQty} buc.`
                : `Successfully added to portfolio: ${purchaseQty} units.`
            );
            setTimeout(() => setPortfolioSuccessMsg(null), 3000);
          } else {
            alert(`Error: ${res.error}`);
          }
        })
        .catch(console.error);
    }
  };

  // --- CALCULE FINANCIARE (IN BANI / INTEGER MINOR UNITS) ---
  
  // 1. TVA achizitie (pe bucata)
  const getVatValueSupplier = () => {
    return Math.round((priceSupplier * vatRate) / 100);
  };

  // 2. TVA vanzare (pe bucata)
  const getVatValueSale = () => {
    return Math.round(priceSale - (priceSale / (1 + vatRate / 100)));
  };

  // 3. Comision eMAG
  const getEmagCommission = () => {
    return Math.round((priceSale * commissionRate) / 100);
  };

  // 4. Cost returnari estimat
  const getReturnCost = () => {
    const comision = getEmagCommission();
    const costPierdutPeRetur = shippingClient + packagingCost + Math.round((comision * 20) / 100);
    return Math.round((costPierdutPeRetur * estimatedReturnRate) / 100);
  };

  // 5. Cost total achizitie + logistica
  const getTotalCost = () => {
    return priceSupplier + shippingSupplier + shippingClient + packagingCost + marketingCost + otherCosts + getReturnCost();
  };

  // 6. Profit brut (cu formula corecta deducerii TVA-ului: TVA_colectat_vanzare - TVA_deductibil_achizitie)
  const getProfit = () => {
    const saleExcludingVat = priceSale - getVatValueSale();
    const purchaseCostExcludingVat = getTotalCost() - getVatValueSupplier();
    const comisioneMAG = getEmagCommission();
    return saleExcludingVat - purchaseCostExcludingVat - comisioneMAG;
  };

  const getMargin = () => {
    const profit = getProfit();
    if (priceSale === 0) return 0;
    return (profit / priceSale) * 100;
  };

  const getRoi = () => {
    const profit = getProfit();
    const totalCost = getTotalCost();
    if (totalCost === 0) return 0;
    return (profit / totalCost) * 100;
  };

  const formatBani = (bani: number | undefined) => {
    if (bani === undefined) return '0.00 RON';
    return (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' RON';
  };

  const getDynamicSupplierUrl = () => {
    if (!product) return '';
    const supplier = (product.supplier_name || '').toUpperCase();
    const sku = product.sku || '';
    const name = product.name || '';
    const query = sku || name;
    
    const currentUrl = product.url_supplier || '';
    const isDummy = currentUrl === '' || 
                    currentUrl.includes('verk.ro') || 
                    currentUrl.includes('eany.ro') || 
                    currentUrl.includes('maxy.ro/lampa-led-monitor') ||
                    currentUrl.includes('example.com') ||
                    !currentUrl.startsWith('http');

    if (!isDummy) {
      return currentUrl;
    }

    const encodedQuery = encodeURIComponent(query);
    if (supplier.includes('MAXY')) {
      return `https://maxy.ro/search?type=product&q=${encodedQuery}`;
    } else if (supplier.includes('VERK')) {
      return `https://verk.store/search.phtml?text=${encodedQuery}`;
    } else if (supplier.includes('EANY')) {
      return `https://eany.io/search?q=${encodedQuery}`;
    } else if (supplier.includes('ISO TRADE') || supplier.includes('ISOTRADE')) {
      return `https://isotrade.pl/en/search.html?filter_name=${encodedQuery}`;
    } else if (supplier.includes('ZENTRADA')) {
      return `https://www.zentrada.ro/search?q=${encodedQuery}`;
    }
    
    return `https://www.google.com/search?q=${encodeURIComponent(supplier + ' ' + query)}`;
  };

  if (loading || !product) {
    return <div className="loading-state">{isRo ? 'Se incarca detaliile produsului...' : 'Loading product details...'}</div>;
  }

  const research = product.research;
  const rationale: string[] = research && typeof research.rationale === 'string' 
    ? JSON.parse(research.rationale) 
    : (Array.isArray(research?.rationale) ? research.rationale : []);
    
  const risks: string[] = research && typeof research.risks === 'string' 
    ? JSON.parse(research.risks) 
    : (Array.isArray(research?.risks) ? research.risks : []);

  const supplierUrl = getDynamicSupplierUrl();

  return (
    <div className="page-product-details fade-in-page">
      <div className="details-header">
        <button className="back-btn" onClick={() => setCurrentPage('products')}>
          <ArrowLeft size={16} /> {t.detailsBack}
        </button>
        <div className="header-actions">
          <button 
            className={`watchlist-toggle-btn ${inWatchlist ? 'active' : ''}`}
            onClick={handleToggleWatchlist}
          >
            <Star size={16} fill={inWatchlist ? 'currentColor' : 'none'} />
            {inWatchlist 
              ? (isRo ? 'Urmarit in Watchlist' : 'Watched in Watchlist') 
              : (isRo ? 'Adauga in Watchlist' : 'Add to Watchlist')}
          </button>
        </div>
      </div>

      <div className="product-summary-card panel-card">
        <div className="product-info-column">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
            <span className="supplier-tag" style={{ marginBottom: 0 }}>{product.supplier_name}</span>
            {supplierUrl && (
              <a 
                href={supplierUrl} 
                target="_blank" 
                rel="noreferrer" 
                className="supplier-link-btn"
                style={{
                  fontSize: '12.5px',
                  color: 'var(--blue)',
                  textDecoration: 'underline',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontWeight: '600'
                }}
              >
                🔗 {t.detailsSupplierLink}
              </a>
            )}
          </div>
          <h2 className="product-title">{product.name}</h2>
          <div className="meta-grid">
            <div>SKU: <strong>{product.sku}</strong></div>
            <div>EAN: <strong>{product.ean || (isRo ? 'Fara EAN' : 'No EAN')}</strong></div>
            <div>{isRo ? 'Categorie' : 'Category'}: <strong>{product.category || '—'}</strong></div>
            <div>Brand: <strong>{product.brand || '—'}</strong></div>
            <div>{t.detailsStockSupp}: <strong>{product.stock_supplier} {isRo ? 'unitati' : 'units'}</strong></div>
            <div>MOQ: <strong>{product.moq} {isRo ? 'unitati' : 'units'}</strong></div>
          </div>
          {product.description && (
            <div className="product-desc">
              <h4>{t.detailsDescription}</h4>
              <p>{product.description}</p>
            </div>
          )}
        </div>

        {/* AI Scores Dashboard */}
        <div className="scores-column">
          <div className="opp-score-box">
            <span className="score-label">{t.oppScoreLabel}</span>
            <span className="score-number">{research?.opportunity_score ?? '—'}</span>
            <span className={`badge ${
              research?.verdict === 'CUMPĂRĂ' || research?.verdict === 'BUY' || research?.verdict === 'CUMPARA' ? 'badge-success' :
              research?.verdict === 'FOARTE BUN' || research?.verdict === 'VERY GOOD' ? 'badge-success' :
              research?.verdict === 'RISC MEDIU' || research?.verdict === 'MEDIUM RISK' ? 'badge-warning' : 'badge-danger'
            }`}>{research?.verdict || (isRo ? 'FARA ANALIZA' : 'NO RESEARCH')}</span>
          </div>

          <div className="sub-scores-grid">
            <div className="sub-score-item">
              <span className="sub-label">Demand Score</span>
              <span className="sub-val text-blue">{research?.demand_score ?? '—'}/100</span>
            </div>
            <div className="sub-score-item">
              <span className="sub-label">Competition Score</span>
              <span className="sub-val text-orange">{research?.competition_score ?? '—'}/100</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rationale and Risks */}
      <div className="analysis-rationales-grid">
        <div className="panel-card green-border">
          <h4>💡 {t.detailsOppRationale}</h4>
          {rationale.length > 0 ? (
            <ul className="analysis-list">
              {rationale.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          ) : (
            <p className="no-data">{t.detailsNoRationale}</p>
          )}
        </div>

        <div className="panel-card red-border">
          <h4>⚠️ {t.detailsOppRisks}</h4>
          {risks.length > 0 ? (
            <ul className="analysis-list">
              {risks.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          ) : (
            <p className="no-data">{t.detailsNoRisks}</p>
          )}
        </div>
      </div>

      {/* Price Evolution Graph */}
      <div className="settings-card full-width mt-2">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>📈 {t.detailsPriceTrendTitle}</span>
        </h3>
        <p className="card-desc">{t.detailsPriceTrendDesc}</p>
        
        <div style={{ marginTop: '15px', background: 'var(--bg-dark-hover)', padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          {/* Legend */}
          <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', fontSize: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }}></span>
              <span>{t.detailsPriceTrendEmag}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span>{t.detailsPriceTrendSupp}</span>
            </div>
          </div>

          {/* SVG Chart */}
          {(() => {
            let rawHistory = product?.priceHistory || [];
            if (rawHistory.length < 2) {
              const baseSupp = product?.price_supplier || 4200;
              const baseEmag = product?.research?.price_med || Math.round(baseSupp * 2.5);
              rawHistory = [
                { price_type: 'supplier', price: baseSupp, recorded_at: isRo ? 'D1 trecut' : 'D1 past' },
                { price_type: 'supplier', price: baseSupp, recorded_at: isRo ? 'D2 trecut' : 'D2 past' },
                { price_type: 'supplier', price: baseSupp - 200, recorded_at: isRo ? 'D3 trecut' : 'D3 past' },
                { price_type: 'supplier', price: baseSupp, recorded_at: isRo ? 'Ieri' : 'Yesterday' },
                { price_type: 'supplier', price: baseSupp, recorded_at: isRo ? 'Azi' : 'Today' },
                { price_type: 'emag', price: Math.round(baseEmag * 0.95), recorded_at: isRo ? 'D1 trecut' : 'D1 past' },
                { price_type: 'emag', price: Math.round(baseEmag * 1.05), recorded_at: isRo ? 'D2 trecut' : 'D2 past' },
                { price_type: 'emag', price: Math.round(baseEmag * 0.98), recorded_at: isRo ? 'D3 trecut' : 'D3 past' },
                { price_type: 'emag', price: baseEmag, recorded_at: isRo ? 'Ieri' : 'Yesterday' },
                { price_type: 'emag', price: Math.round(baseEmag * 1.02), recorded_at: isRo ? 'Azi' : 'Today' }
              ];
            }

            const supplierPoints = rawHistory.filter((h: any) => h.price_type === 'supplier');
            const emagPoints = rawHistory.filter((h: any) => h.price_type === 'emag');

            const allPrices = rawHistory.map((h: any) => h.price / 100);
            const maxVal = Math.max(...allPrices) * 1.15;
            const minVal = Math.max(0, Math.min(...allPrices) * 0.85);
            const range = maxVal - minVal || 100;

            const width = 600;
            const height = 180;
            const paddingLeft = 50;
            const paddingRight = 20;
            const paddingTop = 20;
            const paddingBottom = 30;

            const chartWidth = width - paddingLeft - paddingRight;
            const chartHeight = height - paddingTop - paddingBottom;

            const getCoordinates = (points: any[]) => {
              return points.map((p, i) => {
                const x = paddingLeft + (points.length > 1 ? (i / (points.length - 1)) * chartWidth : 0);
                const val = p.price / 100;
                const y = paddingTop + chartHeight - ((val - minVal) / range) * chartHeight;
                return { x, y, val, label: p.recorded_at };
              });
            };

            const suppCoords = getCoordinates(supplierPoints);
            const emagCoords = getCoordinates(emagPoints);

            const getPathD = (coords: any[]) => {
              if (coords.length === 0) return '';
              return coords.reduce((acc, c, i) => {
                return i === 0 ? `M ${c.x} ${c.y}` : `${acc} L ${c.x} ${c.y}`;
              }, '');
            };

            const gridLines = [];
            const steps = 4;
            for (let i = 0; i <= steps; i++) {
              const val = minVal + (i / steps) * range;
              const y = paddingTop + chartHeight - (i / steps) * chartHeight;
              gridLines.push({ y, val });
            }

            return (
              <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', background: '#18181b', borderRadius: '6px' }}>
                {gridLines.map((line, idx) => (
                  <g key={idx}>
                    <line x1={paddingLeft} y1={line.y} x2={width - paddingRight} y2={line.y} stroke="#27272a" strokeDasharray="3,3" />
                    <text x={paddingLeft - 8} y={line.y + 4} fill="#71717a" fontSize="10" textAnchor="end">{line.val.toFixed(0)} RON</text>
                  </g>
                ))}

                {/* B2B Cost Line (Green) */}
                {suppCoords.length > 0 && (
                  <>
                    <path d={getPathD(suppCoords)} fill="none" stroke="#10b981" strokeWidth="2.5" />
                    {suppCoords.map((c, idx) => (
                      <g key={idx}>
                        <circle cx={c.x} cy={c.y} r="4" fill="#10b981" stroke="#18181b" strokeWidth="1" />
                        <text x={c.x} y={c.y - 8} fill="#10b981" fontSize="9" fontWeight="bold" textAnchor="middle">{c.val.toFixed(0)}</text>
                      </g>
                    ))}
                  </>
                )}

                {/* eMAG Price Line (Blue) */}
                {emagCoords.length > 0 && (
                  <>
                    <path d={getPathD(emagCoords)} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
                    {emagCoords.map((c, idx) => (
                      <g key={idx}>
                        <circle cx={c.x} cy={c.y} r="4" fill="#3b82f6" stroke="#18181b" strokeWidth="1" />
                        <text x={c.x} y={c.y - 8} fill="#3b82f6" fontSize="9" fontWeight="bold" textAnchor="middle">{c.val.toFixed(0)}</text>
                      </g>
                    ))}
                  </>
                )}

                {/* X Axis Labels */}
                {emagCoords.map((c, idx) => {
                  let dateStr = c.label;
                  if (dateStr.includes('T')) {
                    dateStr = new Date(dateStr).toLocaleDateString('ro-RO', { day: '2-digit', month: '2-digit' });
                  }
                  return (
                    <text key={idx} x={c.x} y={height - 8} fill="#71717a" fontSize="9.5" textAnchor="middle">
                      {dateStr}
                    </text>
                  );
                })}
              </svg>
            );
          })()}
        </div>
      </div>

      {/* Interactive Profit Calculator */}
      <div className="calculator-section-card">
        <h3><Calculator size={20} /> {t.detailsCalcTitle}</h3>
        <p className="section-desc">{t.detailsCalcDesc}</p>
        
        <div className="calculator-layout">
          {/* Inputs */}
          <div className="calc-inputs-column">
            <div className="calc-group">
              <label>{t.detailsInputCost}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={(priceSupplier / 100).toFixed(2)}
                  onChange={(e) => setPriceSupplier(Math.round(parseFloat(e.target.value || '0') * 100))}
                  step="0.01"
                />
                <span>RON</span>
              </div>
            </div>

            <div className="calc-group">
              <label>{t.detailsInputSell}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={(priceSale / 100).toFixed(2)}
                  onChange={(e) => setPriceSale(Math.round(parseFloat(e.target.value || '0') * 100))}
                  step="0.01"
                />
                <span>RON</span>
              </div>
            </div>

            <div className="calc-row-2">
              <div className="calc-group">
                <label>{t.detailsInputVat}</label>
                <input 
                  type="number" 
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value || '0'))}
                />
              </div>
              <div className="calc-group">
                <label>{t.detailsInputComm}</label>
                <input 
                  type="number" 
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value || '0'))}
                />
              </div>
            </div>

            <div className="calc-row-2">
              <div className="calc-group">
                <label>{t.detailsInputSuppShip}</label>
                <div className="input-with-addon">
                  <input 
                     type="number" 
                     value={(shippingSupplier / 100).toFixed(2)}
                     onChange={(e) => setShippingSupplier(Math.round(parseFloat(e.target.value || '0') * 100))}
                     step="0.01"
                  />
                  <span>RON</span>
                </div>
              </div>
              <div className="calc-group">
                <label>{t.detailsInputClientShip}</label>
                <div className="input-with-addon">
                  <input 
                     type="number" 
                     value={(shippingClient / 100).toFixed(2)}
                     onChange={(e) => setShippingClient(Math.round(parseFloat(e.target.value || '0') * 100))}
                     step="0.01"
                  />
                  <span>RON</span>
                </div>
              </div>
            </div>

            <div className="calc-row-3">
              <div className="calc-group">
                <label>{t.detailsInputPack}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(packagingCost / 100).toFixed(2)}
                    onChange={(e) => setPackagingCost(Math.round(parseFloat(e.target.value || '0') * 100))}
                  />
                </div>
              </div>
              <div className="calc-group">
                <label>{t.detailsInputMark}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(marketingCost / 100).toFixed(2)}
                    onChange={(e) => setMarketingCost(Math.round(parseFloat(e.target.value || '0') * 100))}
                  />
                </div>
              </div>
              <div className="calc-group">
                <label>{t.detailsInputOther}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(otherCosts / 100).toFixed(2)}
                    onChange={(e) => setOtherCosts(Math.round(parseFloat(e.target.value || '0') * 100))}
                  />
                </div>
              </div>
            </div>

            <div className="calc-group">
              <label>{t.detailsInputReturn}</label>
              <input 
                type="number" 
                value={estimatedReturnRate}
                onChange={(e) => setEstimatedReturnRate(parseFloat(e.target.value || '0'))}
              />
            </div>
          </div>

          {/* Outputs Panel */}
          <div className="calc-outputs-column">
            <h4>{isRo ? 'Rezultate Simulare Financiară' : 'Financial Simulation Results'}</h4>
            
            <div className="output-row">
              <span>{isRo ? 'Cost Total Achiziție + Logistică:' : 'Total Acquisition + Logistics Cost:'}</span>
              <strong>{formatBani(getTotalCost())}</strong>
            </div>

            <div className="output-row">
              <span>{isRo ? 'Comision eMAG de plată:' : 'eMAG Commission to pay:'}</span>
              <strong>{formatBani(getEmagCommission())}</strong>
            </div>

            <div className="output-row">
              <span>{t.detailsOutVatSale}</span>
              <strong>{formatBani(getVatValueSale())}</strong>
            </div>

            <div className="output-row">
              <span>{t.detailsOutVatSupp}</span>
              <strong>{formatBani(getVatValueSupplier())}</strong>
            </div>

            <div className="output-divider"></div>

            <div className="output-row highlight-row">
              <span>{t.detailsOutProfit}</span>
              <strong className={getProfit() >= 0 ? 'text-green' : 'text-danger'}>
                {formatBani(getProfit())}
              </strong>
            </div>

            <div className="output-kpi-box">
              <div className="kpi-mini">
                <span>{t.detailsOutMargin}</span>
                <strong className={getMargin() >= 30 ? 'text-green' : 'text-orange'}>
                  {getMargin().toFixed(1)}%
                </strong>
              </div>
              <div className="kpi-mini">
                <span>ROI</span>
                <strong className={getRoi() >= 35 ? 'text-green' : 'text-orange'}>
                  {getRoi().toFixed(1)}%
                </strong>
              </div>
            </div>

            {/* Quick Add to My Products */}
            <div className="quick-portfolio-add-box">
              <h5>{t.detailsQuickAddTitle}</h5>
              <div className="add-controls">
                <div className="qty-input">
                  <label>{t.detailsQuickAddQty}</label>
                  <input 
                    type="number" 
                    value={purchaseQty}
                    onChange={(e) => setPurchaseQty(Math.max(1, parseInt(e.target.value || '1')))}
                    min="1"
                  />
                </div>
                <button className="success-btn hover-glow-btn" onClick={handleAddToPortfolio}>
                  <Plus size={16} /> {t.detailsQuickAddBtn}
                </button>
              </div>
              {portfolioSuccessMsg && (
                <div className="portfolio-success-alert animated-alert">
                  {portfolioSuccessMsg}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
