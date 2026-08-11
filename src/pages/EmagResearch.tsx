import React, { useEffect, useState } from 'react';
import { 
  Search, Sparkles, Globe, AlertTriangle, 
  CheckCircle2, Calculator, Link2, Loader2, Info 
} from 'lucide-react';

interface ScrapedProduct {
  id: string;
  pnk: string;
  name: string;
  price: number;
  category: string;
  url?: string;
  imageUrl?: string;
  rating: number;
  reviewsCount: number;
}

interface EmagProps {
  t: any;
}

export default function EmagResearch({ t }: EmagProps) {
  const isRo = t.navDashboard === 'Panou Control';
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScrapedProduct[]>([]);
  const [error, setError] = useState('');
  
  // Selection & Analysis
  const [selectedProduct, setSelectedProduct] = useState<ScrapedProduct | null>(null);
  const [localProducts, setLocalProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  
  // Stats adjusted by user for saving
  const [sellersCount, setSellersCount] = useState(3);
  const [overridePriceMed, setOverridePriceMed] = useState<number | null>(null);
  
  // Saving status
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    loadLocalProducts();
  }, []);

  const loadLocalProducts = () => {
    if (window.api && window.api.getProducts) {
      window.api.getProducts({})
        .then(setLocalProducts)
        .catch(console.error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setResults([]);
    setSelectedProduct(null);

    try {
      const res = await window.api.searchEmag(query);
      if (res.success) {
        setResults(res.results || []);
        if ((res.results || []).length === 0) {
          setError(isRo ? 'Niciun produs găsit pe eMAG pentru această căutare.' : 'No products found on eMAG for this search query.');
        }
      } else {
        setError(res.error || (isRo ? 'Eroare la conectarea cu scraperul eMAG.' : 'Error connecting to eMAG scraper.'));
      }
    } catch (err: any) {
      setError(err.message || (isRo ? 'Eroare de procesare.' : 'Processing error.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProduct = (product: ScrapedProduct) => {
    setSelectedProduct(product);
    setOverridePriceMed(null);
    setSaveSuccess(false);
    setSaveError('');
    
    // Incearca auto-matching dupa nume sau categorie in catalogul local
    if (localProducts.length > 0) {
      const match = localProducts.find((p) => 
        p.name.toLowerCase().includes(product.name.toLowerCase().slice(0, 15)) ||
        product.name.toLowerCase().includes(p.name.toLowerCase().slice(0, 15))
      );
      if (match) {
        setSelectedProductId(match.id);
      } else {
        setSelectedProductId(localProducts[0].id);
      }
    }
  };

  // Calculare estimare financiara live
  const activeProduct = localProducts.find((p) => p.id === selectedProductId);
  const activePrice = overridePriceMed !== null ? overridePriceMed : (selectedProduct?.price || 0);

  const priceMin = Math.round(activePrice * 0.9 * 100) / 100;
  const priceMax = Math.round(activePrice * 1.15 * 100) / 100;

  const getPreviewCalculations = () => {
    if (!activeProduct || !activePrice) return null;

    const priceSupplierVal = activeProduct.price_supplier / 100; // lei
    const comisionEst = activePrice * 0.15; // 15%
    const logisticaEst = 16.5; // transport + ambalaj

    const profit = activePrice - priceSupplierVal - comisionEst - logisticaEst;
    const roi = priceSupplierVal > 0 ? (profit / priceSupplierVal) * 100 : 0;
    const margin = activePrice > 0 ? (profit / activePrice) * 100 : 0;

    let opportunityScore = 40;
    if (roi > 50) opportunityScore += 35;
    else if (roi > 25) opportunityScore += 20;

    if (profit > 40) opportunityScore += 20;
    else if (profit > 20) opportunityScore += 10;

    if (sellersCount <= 2) opportunityScore += 10;
    else if (sellersCount > 8) opportunityScore -= 15;

    opportunityScore = Math.max(5, Math.min(99, opportunityScore));

    const demandScore = selectedProduct ? Math.min(99, Math.round(selectedProduct.reviewsCount * 1.2 + 30)) : 50;
    const competitionScore = Math.min(99, sellersCount * 10 + 20);
    const riskScore = Math.max(10, 100 - opportunityScore);

    let verdict = isRo ? 'RISC MEDIU' : 'MEDIUM RISK';
    if (opportunityScore >= 75) verdict = isRo ? 'CUMPĂRĂ' : 'BUY';
    else if (opportunityScore >= 60) verdict = isRo ? 'FOARTE BUN' : 'VERY GOOD';
    else if (opportunityScore < 45) verdict = isRo ? 'NU MERITĂ' : 'NOT WORTH';

    return { profit, roi, margin, opportunityScore, verdict, demandScore, competitionScore, riskScore };
  };

  const preview = getPreviewCalculations();

  const handleSaveResearch = async () => {
    if (!selectedProductId || !selectedProduct) return;

    setSaving(true);
    setSaveError('');
    setSaveSuccess(false);

    const researchPayload = {
      price_min: priceMin,
      price_med: activePrice,
      price_max: priceMax,
      sellers_count: sellersCount,
      rating: selectedProduct.rating,
      reviews_count: selectedProduct.reviewsCount
    };

    try {
      const res = await window.api.saveRealtimeResearch(selectedProductId, researchPayload);
      if (res.success) {
        setSaveSuccess(true);
        loadLocalProducts(); // Reload local list to update items
      } else {
        setSaveError(res.error || (isRo ? 'Eroare la salvarea analizei în baza de date.' : 'Error saving research to database.'));
      }
    } catch (err: any) {
      setSaveError(err.message || (isRo ? 'Eroare de comunicare IPC.' : 'IPC communication error.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-emag-research fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{isRo ? 'Cercetare eMAG Marketplace Real-Time' : 'eMAG Marketplace Real-Time Research'}</h2>
          <p className="page-subtitle">{isRo ? 'Interoghează platforma eMAG în timp real și asociază rezultatele cu catalogul local pentru scoruri exacte de profitabilitate.' : 'Query eMAG live in real-time and match listings with your local catalog for precise margin scores.'}</p>
        </div>
      </div>

      <div className="settings-card mb-2">
        <form onSubmit={handleSearch} className="search-bar-form" style={{ display: 'flex', gap: '10px' }}>
          <div className="input-with-addon" style={{ flex: 1 }}>
            <Search size={18} className="addon-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              placeholder={isRo ? 'Caută pe eMAG după cuvânt-cheie (ex: lampa led monitor, aspirator auto, organizator auto)...' : 'Search eMAG by keyword (e.g. led monitor lamp, car vacuum, car organizer)...'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ paddingLeft: '38px', width: '100%' }}
              disabled={loading}
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            {loading ? <Loader2 size={16} className="spin" /> : <Globe size={16} />}
            {isRo ? 'Caută Live' : 'Search Live'}
          </button>
        </form>

        {error && (
          <div className="alert alert-danger mt-2" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', borderRadius: '6px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <AlertTriangle size={18} />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="research-layout" style={{ display: 'grid', gridTemplateColumns: selectedProduct ? '1.2fr 1fr' : '1fr', gap: '20px', alignItems: 'start' }}>
        
        {/* Results grid */}
        {results.length > 0 && (
          <div className="settings-card" style={{ padding: '20px' }}>
            <h3 className="section-title mb-2">{isRo ? `Rezultate Căutare eMAG (${results.length} listări)` : `eMAG Search Results (${results.length} listings)`}</h3>
            
            <div className="table-responsive" style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>{isRo ? 'Imagine' : 'Image'}</th>
                    <th>{isRo ? 'Denumire Produs' : 'Product Name'}</th>
                    <th style={{ width: '100px' }}>{isRo ? 'Preț eMAG' : 'eMAG Price'}</th>
                    <th style={{ width: '120px' }}>{isRo ? 'Rating / Review-uri' : 'Rating / Reviews'}</th>
                    <th style={{ width: '100px' }}>{isRo ? 'Acțiuni' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((p) => (
                    <tr 
                      key={p.id} 
                      className={`clickable-row ${selectedProduct?.id === p.id ? 'active-row' : ''}`}
                      onClick={() => handleSelectProduct(p)}
                      style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                    >
                      <td>
                        {p.imageUrl ? (
                          <img 
                            src={p.imageUrl} 
                            alt={p.name} 
                            style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '4px', background: '#fff', padding: '2px' }} 
                            onError={(e) => { (e.target as any).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="%23ccc"><rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>' }}
                          />
                        ) : (
                          <div style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyItems: 'center', background: 'var(--border-color)', borderRadius: '4px' }}>
                            <Globe size={20} style={{ margin: 'auto', color: 'var(--text-secondary)' }} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '13.5px', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {p.name}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                          <span className="supplier-tag" style={{ margin: 0, padding: '1px 4px', fontSize: '10px' }}>eMAG</span>
                          {p.url && (
                            <a 
                              href={p.url} 
                              target="_blank" 
                              rel="noreferrer" 
                              style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: '2px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Link2 size={12} /> Vizualizează listing
                            </a>
                          )}
                        </div>
                      </td>
                      <td style={{ fontWeight: '700', color: 'var(--text-primary)' }}>
                        {p.price.toFixed(2)} RON
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '600' }}>
                          <span className="text-orange">{p.rating > 0 ? p.rating.toFixed(2) : '—'}</span>
                          <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>({p.reviewsCount})</span>
                        </div>
                      </td>
                      <td>
                        <button 
                          className={`btn ${selectedProduct?.id === p.id ? 'btn-primary' : 'btn-secondary'}`}
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectProduct(p);
                          }}
                        >
                          {isRo ? 'Analizează' : 'Analyze'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Live Analysis side-panel */}
        {selectedProduct && (
          <div className="settings-card" style={{ padding: '20px', border: '1px solid var(--blue)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h3 className="section-title" style={{ color: 'var(--blue)', display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                <Calculator size={20} /> {isRo ? 'Analiză Produs Selectat' : 'Selected Product Analysis'}
              </h3>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '4px 8px', fontSize: '11px' }}
                onClick={() => setSelectedProduct(null)}
              >
                {isRo ? 'Închide' : 'Close'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '12px', background: 'var(--bg-dark-hover)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              {selectedProduct.imageUrl && (
                <img 
                  src={selectedProduct.imageUrl} 
                  alt={selectedProduct.name} 
                  style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '2px' }}
                />
              )}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {selectedProduct.name}
                </h4>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                  {isRo ? 'Preț curent eMAG:' : 'Current eMAG Price:'} <strong>{selectedProduct.price.toFixed(2)} RON</strong> | Rating: <strong>{selectedProduct.rating > 0 ? selectedProduct.rating.toFixed(2) : '—'} ⭐</strong>
                </div>
              </div>
            </div>

            {/* Step 1: Link with Local Catalog */}
            <div className="form-group mb-2">
              <label style={{ fontWeight: '600', display: 'block', marginBottom: '6px' }}>{isRo ? 'Pasul 1: Asociază cu un produs din catalogul tău B2B' : 'Step 1: Match with a product from your B2B catalog'}</label>
              <select 
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setSaveSuccess(false);
                  setSaveError('');
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              >
                <option value="">{isRo ? '-- Alege produs local --' : '-- Choose local product --'}</option>
                {localProducts.map(lp => (
                  <option key={lp.id} value={lp.id}>
                    {lp.name} (SKU: {lp.sku}) [{isRo ? 'Cost Achiziție' : 'Buy Cost'}: {(lp.price_supplier / 100).toFixed(2)} RON]
                  </option>
                ))}
              </select>
              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block', marginTop: '4px' }}>
                {isRo ? '*Asocierea permite calculul exact al ROI-ului și al Scorului de Oportunitate bazat pe costul real de achiziție.' : '*Matching allows precise ROI and Opportunity Score calculations based on actual acquisition cost.'}
              </span>
            </div>

            {/* Step 2: Adjust variables */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>{isRo ? 'Preț Vanzare Estimativ (RON)' : 'Estimated Selling Price (RON)'}</label>
                <input 
                  type="number" 
                  step="0.01"
                  value={activePrice}
                  onChange={(e) => setOverridePriceMed(parseFloat(e.target.value) || 0)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '12px', fontWeight: '600' }}>{isRo ? 'Număr Selleri pe Buybox' : 'Sellers Count on Buybox'}</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={sellersCount}
                  onChange={(e) => setSellersCount(parseInt(e.target.value) || 1)}
                  style={{ width: '100%', padding: '8px' }}
                />
              </div>
            </div>

            {/* Live Preview of metrics */}
            {preview && activeProduct ? (
              <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '15px', background: 'var(--bg-dark-hover)', marginBottom: '20px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.5px', marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                  {isRo ? 'Previzualizare Rezultate Analiză' : 'Analysis Results Preview'}
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '15px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{isRo ? 'Marjă Estimată (Profit)' : 'Estimated Margin (Profit)'}</span>
                    <strong style={{ fontSize: '16px', color: preview.profit >= 0 ? '#10b981' : '#ef4444' }}>
                      {preview.profit.toFixed(2)} RON
                    </strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{isRo ? 'ROI Estimativ' : 'Estimated ROI'}</span>
                    <strong style={{ fontSize: '16px', color: preview.roi >= 20 ? '#10b981' : (preview.roi >= 5 ? '#f59e0b' : '#ef4444') }}>
                      {preview.roi.toFixed(1)}%
                    </strong>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>{isRo ? 'Scor Oportunitate' : 'Opportunity Score'}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                      <strong style={{ fontSize: '18px', color: 'var(--blue)' }}>{preview.opportunityScore}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>/100</span>
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'block' }}>Verdict</span>
                    <span 
                      className={`badge ${
                        preview.verdict === 'CUMPĂRĂ' || preview.verdict === 'BUY' ? 'badge-success' :
                        preview.verdict === 'FOARTE BUN' || preview.verdict === 'VERY GOOD' ? 'badge-success' :
                        preview.verdict === 'RISC MEDIU' || preview.verdict === 'MEDIUM RISK' ? 'badge-warning' : 'badge-danger'
                      }`}
                      style={{ marginTop: '4px', display: 'inline-block' }}
                    >
                      {preview.verdict}
                    </span>
                  </div>
                </div>

                {/* Score weights details breakdown */}
                <div style={{ fontSize: '11.5px', marginTop: '12px', padding: '10px', background: 'var(--bg-dark)', borderRadius: '6px', border: '1px dashed var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{isRo ? 'Scor Cerere (Volume client):' : 'Demand Score (Customer volume):'}</span>
                    <strong>{preview.demandScore}/100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>{isRo ? 'Scor Competiție (Sellers):' : 'Competition Score (Sellers):'}</span>
                    <strong>{preview.competitionScore}/100</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{isRo ? 'Scor Risc (Calitate & Marjă):' : 'Risk Score (Quality & Margin):'}</span>
                    <strong>{preview.riskScore}/100</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="info-faza-block" style={{ padding: '15px', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.1)', color: 'var(--text-secondary)', fontSize: '13px', borderRadius: '6px', marginBottom: '20px' }}>
                <Info size={16} className="text-blue" style={{ float: 'left', marginRight: '8px', marginTop: '2px' }} />
                <span>{isRo ? 'Te rog să selectezi un produs local din catalogul tău la Pasul 1 pentru a debloca calculele de marjă de profit și ROI.' : 'Please select a local product from your catalog at Step 1 to unlock profit margin and ROI calculations.'}</span>
              </div>
            )}

            {/* Action buttons */}
            {saveSuccess ? (
              <div className="alert alert-success" style={{ display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '12px', borderRadius: '6px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                  <CheckCircle2 size={18} />
                  <span>{isRo ? 'Analiză salvată cu succes!' : 'Research saved successfully!'}</span>
                </div>
                <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-secondary)' }}>
                  {isRo ? 'Produsul local a fost asociat, iar Scorul de Oportunitate și Verdictul s-au actualizat instant în catalog.' : 'The local product was matched, and Opportunity Score and Verdict were updated instantly.'}
                </p>
              </div>
            ) : (
              <div>
                {saveError && (
                  <div className="alert alert-danger mb-2" style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                    {saveError}
                  </div>
                )}
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px' }}
                  disabled={saving || !selectedProductId}
                  onClick={handleSaveResearch}
                >
                  {saving ? <Loader2 size={18} className="spin" /> : <Sparkles size={18} />}
                  {isRo ? 'Asociază Cercetare & Salvează Scoruri' : 'Match Research & Save Scores'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {results.length === 0 && !loading && (
        <div className="settings-card mt-2">
          <div className="info-faza-block" style={{ border: '1px dashed var(--border-color)', background: 'transparent' }}>
            <Sparkles size={36} className="text-blue" style={{ marginBottom: '10px' }} />
            <h3>{isRo ? 'Nicio cercetare activă' : 'No active research'}</h3>
            <p style={{ maxWidth: '600px', margin: '0 auto' }}>
              {isRo ? 'Introdu un termen de căutare sau numele unui produs în caseta de căutare de mai sus pentru a efectua o scanare în timp real a prețurilor concurente, ratingurilor și volumelor active pe eMAG.' : 'Enter a search term or product name in the box above to perform a real-time scan of competitor pricing, ratings, and live volume on eMAG.'}
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="settings-card mt-2" style={{ padding: '40px', textAlign: 'center' }}>
          <Loader2 size={48} className="spin text-blue" style={{ margin: '0 auto 15px auto' }} />
          <h3>{isRo ? 'Căutare live pe eMAG Marketplace...' : 'Live search on eMAG Marketplace...'}</h3>
          <p className="page-subtitle" style={{ maxWidth: '500px', margin: '0 auto' }}>
            {isRo ? 'Interogăm baza de date eMAG și colectăm listings. Vă rugăm să așteptați câteva secunde.' : 'Querying eMAG database and fetching live listings. Please wait a few seconds.'}
          </p>
        </div>
      )}
    </div>
  );
}
