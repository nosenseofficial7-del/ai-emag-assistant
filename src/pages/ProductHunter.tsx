import { useState, useEffect } from 'react';
import { Sparkles, Globe, Database, Download, Check, ExternalLink, Loader2 } from 'lucide-react';
import type { Product, Supplier } from '../types';

interface ProductHunterProps {
  setCurrentPage: (page: string) => void;
  setSelectedProductId: (id: string) => void;
  t: any;
}

interface OnlineItem {
  id: string;
  name: string;
  sku: string;
  priceSupplier: number; // in cents
  urlSupplier: string;
  imageUrl: string;
  supplierName: string;
  matchedEmagPrice?: number; // in cents
  matchedEmagName?: string;
  matchedEmagUrl?: string;
  estProfit: number; // in lei
  roi: number; // %
  opportunityScore: number;
  verdict: string;
  imported?: boolean;
}

export default function ProductHunter({ setCurrentPage, setSelectedProductId, t }: ProductHunterProps) {
  const isRo = t.navDashboard === 'Panou Control';
  const [searchMode, setSearchMode] = useState<'online' | 'local'>('online');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Results
  const [localResults, setLocalResults] = useState<Product[]>([]);
  const [onlineResults, setOnlineResults] = useState<OnlineItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [importingSku, setImportingSku] = useState<string | null>(null);

  // Filters
  const [onlineKeyword, setOnlineKeyword] = useState('lampi led monitor');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [budget, setBudget] = useState<number>(2500); // 2500 RON (500 EUR)
  const [maxPrice, setMaxPrice] = useState<number>(150); // 150 RON max unit price
  const [minProfit, setMinProfit] = useState<number>(25); // 25 RON min profit
  const [minRoi, setMinRoi] = useState<number>(25); // 25% min ROI
  const [maxCompetition, setMaxCompetition] = useState<number>(60);
  const [minDemand, setMinDemand] = useState<number>(40);
  const [minOpportunity, setMinOpportunity] = useState<number>(50);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    if (window.api && window.api.getSuppliers) {
      window.api.getSuppliers().then(setSuppliers).catch(console.error);
    }
  };

  const handleHunt = async () => {
    setLoading(true);
    setHasSearched(true);

    if (searchMode === 'online') {
      // 🌐 VANATOARE LIVE ONLINE PE O SCALA MARE (Maxy, Verk, Eany + eMAG Live)
      try {
        const queryToUse = onlineKeyword.trim() || 'organizatoare auto';
        
        const [supplierRes, emagRes] = await Promise.all([
          window.api.searchSuppliersLive(queryToUse),
          window.api.searchEmag(queryToUse)
        ]);

        const rawSuppliers = supplierRes.success ? (supplierRes.results || []) : [];
        const rawEmag = emagRes.success ? (emagRes.results || []) : [];

        const items: OnlineItem[] = rawSuppliers.map((sp: any, idx: number) => {
          const ep = rawEmag[idx] || rawEmag[0] || null;
          
          const priceSupplierVal = sp.price_supplier / 100; // lei
          let emagPriceVal = ep ? ep.price / 100 : priceSupplierVal * 1.6; // fallback 60% markup
          
          const comisionEst = emagPriceVal * 0.15;
          const logisticaEst = 16.5; // transport client + ambalaj
          const profit = emagPriceVal - priceSupplierVal - comisionEst - logisticaEst;
          const roi = priceSupplierVal > 0 ? (profit / priceSupplierVal) * 100 : 0;

          let oppScore = 40;
          if (roi > 50) oppScore += 35;
          else if (roi > 25) oppScore += 20;
          if (profit > 40) oppScore += 20;

          let verdict = isRo ? 'RISC MEDIU' : 'MEDIUM RISK';
          if (oppScore >= 75) verdict = isRo ? 'CUMPĂRĂ' : 'BUY';
          else if (oppScore >= 60) verdict = isRo ? 'FOARTE BUN' : 'VERY GOOD';
          else if (oppScore < 45) verdict = isRo ? 'NU MERITĂ' : 'NOT WORTH';

          return {
            id: String(sp.sku || idx),
            name: sp.name,
            sku: String(sp.sku || `SKU-${idx}`),
            priceSupplier: sp.price_supplier,
            urlSupplier: sp.url_supplier || '',
            imageUrl: sp.image_url || '',
            supplierName: sp.supplier_name || 'B2B Wholesale',
            matchedEmagPrice: ep ? ep.price : Math.round(emagPriceVal * 100),
            matchedEmagName: ep ? ep.name : undefined,
            matchedEmagUrl: ep ? ep.url : undefined,
            estProfit: Math.round(profit * 100) / 100,
            roi: Math.round(roi),
            opportunityScore: Math.min(99, oppScore),
            verdict
          };
        });

        // Filtrati rezultatele online dupa parametrii utilizatorului
        const filteredOnline = items.filter(item => {
          const buyPrice = item.priceSupplier / 100;
          if (buyPrice > maxPrice) return false;
          if (item.estProfit < minProfit) return false;
          if (item.roi < minRoi) return false;
          if (item.opportunityScore < minOpportunity) return false;
          return true;
        });

        // Sortam produsele cel mai ieftin primul (Cheapest First)
        filteredOnline.sort((a, b) => a.priceSupplier - b.priceSupplier);

        setOnlineResults(filteredOnline);
      } catch (err) {
        console.error('Online hunt error:', err);
        setOnlineResults([]);
      } finally {
        setLoading(false);
      }
    } else {
      // 💾 FILTRARE BAZA DE DATE LOCALA (SQLite)
      if (window.api && window.api.getProducts) {
        window.api.getProducts({})
          .then((data: any) => {
            const filtered = (data as Product[]).filter((p: Product) => {
              if (selectedSupplier && p.supplier_id !== selectedSupplier) return false;
              if (selectedCategory && p.category !== selectedCategory) return false;
              
              const priceSupplierVal = p.price_supplier / 100;
              if (priceSupplierVal > maxPrice) return false;
              
              if (!p.price_med) return false;
              const comisionEst = Math.round((p.price_med * 15) / 100);
              const profitVal = (p.price_med - p.price_supplier - comisionEst) / 100;
              if (profitVal < minProfit) return false;
              
              const roiVal = (profitVal / (p.price_supplier / 100)) * 100;
              if (roiVal < minRoi) return false;
              
              if (p.competition_score !== undefined && p.competition_score > maxCompetition) return false;
              if (p.demand_score !== undefined && p.demand_score < minDemand) return false;
              if (p.opportunity_score !== undefined && p.opportunity_score < minOpportunity) return false;
              
              return true;
            });
            filtered.sort((a: Product, b: Product) => (b.opportunity_score || 0) - (a.opportunity_score || 0));
            setLocalResults(filtered);
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      }
    }
  };

  const handleImportOnlineItem = async (item: OnlineItem) => {
    setImportingSku(item.sku);
    try {
      let targetSupId = suppliers[0]?.id || '1';
      const matchedSup = suppliers.find(s => s.name.toLowerCase().includes(item.supplierName.toLowerCase()));
      if (matchedSup) targetSupId = matchedSup.id;

      const res = await window.api.addOrUpdateProduct({
        sku: item.sku,
        name: item.name,
        category: 'Auto & Tech',
        supplier_id: targetSupId,
        price_supplier: item.priceSupplier,
        currency: 'RON',
        vat: 19,
        moq: 1,
        stock_supplier: 150,
        url_supplier: item.urlSupplier,
        image_url: item.imageUrl,
        price_med: item.matchedEmagPrice,
        opportunity_score: item.opportunityScore,
        verdict: item.verdict
      });

      if (res.success) {
        setOnlineResults(prev => prev.map(p => p.sku === item.sku ? { ...p, imported: true } : p));
      }
    } catch (e) {
      console.error('Import error:', e);
    } finally {
      setImportingSku(null);
    }
  };

  const handleProductClick = (id: string) => {
    setSelectedProductId(id);
    setCurrentPage('product-details');
  };

  const formatBani = (bani: number | undefined) => {
    if (bani === undefined) return 'N/A';
    return (bani / 100).toFixed(2) + ' lei';
  };

  const categories = ['Auto', 'Electronice', 'Home & Deco', 'Jucării', 'Sport & Outdoor'];

  return (
    <div className="page-product-hunter fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{isRo ? 'Product Hunter (Căutător Oportunități)' : 'Product Hunter (Opportunity Finder)'}</h2>
          <p className="page-subtitle">{isRo ? 'Scanați în timp real furnizorii B2B online pe o scală mare sau baza de date locală SQLite.' : 'Real-time scan wholesale B2B suppliers online at scale or your local SQLite database.'}</p>
        </div>

        {/* Mode Selector Toggle */}
        <div className="tab-switcher-mode">
          <button 
            className={`tab-btn-mode ${searchMode === 'online' ? 'active' : ''}`}
            onClick={() => setSearchMode('online')}
          >
            <Globe size={16} /> {isRo ? '🌐 Vânătoare Live Online (Internet & B2B)' : '🌐 Live Online Hunt (Web & B2B)'}
          </button>
          <button 
            className={`tab-btn-mode ${searchMode === 'local' ? 'active' : ''}`}
            onClick={() => setSearchMode('local')}
          >
            <Database size={16} /> {isRo ? '💾 Bază de Date Locală (SQLite)' : '💾 Local Database (SQLite)'}
          </button>
        </div>
      </div>

      <div className="hunter-control-panel settings-card">
        <h3>
          {searchMode === 'online' 
            ? (isRo ? '🌐 Căutare Live Online (Maxy, Verk, Eany & eMAG)' : '🌐 Live Online Search (Maxy, Verk, Eany & eMAG)') 
            : (isRo ? '🎯 Parametri Filtrare DB Locală' : '🎯 Local DB Filter Parameters')}
        </h3>

        {searchMode === 'online' && (
          <div className="filter-group mt-1 w-full">
            <label>{isRo ? 'Cuvânt Cheie / Categorie Căutare Online' : 'Keyword / Category for Online Search'}</label>
            <div className="input-with-addon">
              <input 
                type="text" 
                value={onlineKeyword} 
                onChange={(e) => setOnlineKeyword(e.target.value)} 
                placeholder={isRo ? 'Ex: lampi led monitor, organizatoare auto, casti bluetooth...' : 'Ex: led monitor lamps, car organizers, bluetooth headphones...'} 
              />
              <span>LIVE SEARCH</span>
            </div>
          </div>
        )}

        <div className="filter-grid mt-1">
          <div className="filter-group">
            <label>{isRo ? 'Buget Maxim Achiziție totală' : 'Maximum Total Purchase Budget'}</label>
            <div className="input-with-addon">
              <input type="number" value={budget} onChange={(e) => setBudget(parseFloat(e.target.value || '0'))} />
              <span>RON</span>
            </div>
          </div>

          <div className="filter-group">
            <label>{isRo ? 'Preț Maxim Produs / buc' : 'Maximum Unit Price'}</label>
            <div className="input-with-addon">
              <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(parseFloat(e.target.value || '0'))} />
              <span>RON</span>
            </div>
          </div>

          <div className="filter-group">
            <label>{isRo ? 'Profit Net Minim / buc' : 'Minimum Net Profit / unit'}</label>
            <div className="input-with-addon">
              <input type="number" value={minProfit} onChange={(e) => setMinProfit(parseFloat(e.target.value || '0'))} />
              <span>RON</span>
            </div>
          </div>

          <div className="filter-group">
            <label>{isRo ? 'ROI Minim (%)' : 'Minimum ROI (%)'}</label>
            <div className="input-with-addon">
              <input type="number" value={minRoi} onChange={(e) => setMinRoi(parseFloat(e.target.value || '0'))} />
              <span>%</span>
            </div>
          </div>

          <div className="filter-group">
            <label>{isRo ? 'Opportunity Score Minim' : 'Minimum Opportunity Score'}</label>
            <div className="input-with-addon">
              <input type="number" value={minOpportunity} onChange={(e) => setMinOpportunity(parseFloat(e.target.value || '0'))} />
              <span>/ 100</span>
            </div>
          </div>

          {searchMode === 'local' && (
            <>
              <div className="filter-group">
                <label>{isRo ? 'Competition Score Maxim' : 'Maximum Competition Score'}</label>
                <div className="input-with-addon">
                  <input type="number" value={maxCompetition} onChange={(e) => setMaxCompetition(parseFloat(e.target.value || '0'))} />
                  <span>/ 100</span>
                </div>
              </div>

              <div className="filter-group">
                <label>{isRo ? 'Demand Score Minim' : 'Minimum Demand Score'}</label>
                <div className="input-with-addon">
                  <input type="number" value={minDemand} onChange={(e) => setMinDemand(parseFloat(e.target.value || '0'))} />
                  <span>/ 100</span>
                </div>
              </div>

              <div className="filter-group">
                <label>{isRo ? 'Furnizor Țintă' : 'Target Supplier'}</label>
                <select value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="filter-select">
                  <option value="">{isRo ? 'Toți furnizorii' : 'All suppliers'}</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="filter-group">
                <label>{isRo ? 'Categorie Țintă' : 'Target Category'}</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="filter-select">
                  <option value="">{isRo ? 'Toate categoriile' : 'All categories'}</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}
        </div>

        <button className="primary-btn mt-2 w-full green-btn" onClick={handleHunt} disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />}
          {searchMode === 'online' 
            ? (isRo ? ' 🌐 VÂNEAZĂ OPORTUNITĂȚI LIVE ONLINE' : ' 🌐 HUNT LIVE ONLINE OPPORTUNITIES') 
            : (isRo ? ' 🎯 SCANEAZĂ BAZA DE DATE LOCALĂ' : ' 🎯 SCAN LOCAL DATABASE')}
        </button>
      </div>

      {/* Result Section */}
      <div className="hunter-results-section mt-2">
        {loading ? (
          <div className="loading-state">
            {searchMode === 'online' 
              ? (isRo ? 'Scanam furnizorii B2B (Maxy, Verk, Eany) si eMAG Marketplace in timp real pe o scala mare...' : 'Scanning B2B suppliers (Maxy, Verk, Eany) and eMAG Marketplace in real-time...') 
              : (isRo ? 'Algoritmul analizeaza produsele din baza de date SQLite...' : 'Analyzing products in SQLite database...')}
          </div>
        ) : hasSearched ? (
          searchMode === 'online' ? (
            onlineResults.length > 0 ? (
              <div className="opportunities-results-box">
                <h4>{isRo ? `🌐 OPORTUNITĂȚI LIVE GĂSITE ONLINE (${onlineResults.length} produse ordonate după cel mai mic preț)` : `🌐 LIVE ONLINE OPPORTUNITIES FOUND (${onlineResults.length} products sorted cheapest first)`}</h4>
                <div className="opportunities-list-wrapper mt-1">
                  {onlineResults.map((p, idx) => (
                    <div key={p.id + idx} className="hunter-op-card">
                      <div className="op-card-rank">#{idx + 1}</div>
                      
                      {p.imageUrl && (
                        <img src={p.imageUrl} alt={p.name} className="op-card-thumb" style={{ width: '54px', height: '54px', objectFit: 'contain', borderRadius: '6px' }} />
                      )}

                      <div className="op-card-details">
                        <h5>{p.name}</h5>
                        <span className="op-card-meta">
                          SKU: <code>{p.sku}</code> • {isRo ? 'Furnizor Online:' : 'Online Supplier:'} <strong style={{ color: '#10b981' }}>{p.supplierName}</strong>
                        </span>
                        {p.matchedEmagName && (
                          <p style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                            {isRo ? 'Confruntat pe eMAG:' : 'Matched on eMAG:'} <strong>{p.matchedEmagName.slice(0, 45)}...</strong>
                          </p>
                        )}
                      </div>
                      
                      <div className="op-card-financials">
                        <div className="fin-node">
                          <span>{isRo ? 'Achiziție:' : 'Purchase:'}</span>
                          <strong>{formatBani(p.priceSupplier)}</strong>
                        </div>
                        <div className="fin-node">
                          <span>{isRo ? 'Piață eMAG:' : 'eMAG Price:'}</span>
                          <strong>{formatBani(p.matchedEmagPrice)}</strong>
                        </div>
                        <div className="fin-node text-green">
                          <span>{isRo ? 'Profit Net:' : 'Net Profit:'}</span>
                          <strong>+{p.estProfit.toFixed(2)} lei</strong>
                        </div>
                        <div className="fin-node text-green">
                          <span>ROI:</span>
                          <strong>{p.roi}%</strong>
                        </div>
                      </div>

                      <div className="op-card-scores" style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span className="score-val">{p.opportunityScore}</span>
                          <span className={`badge ${
                            p.verdict === 'CUMPĂRĂ' || p.verdict === 'BUY' ? 'badge-success' :
                            p.verdict === 'FOARTE BUN' || p.verdict === 'VERY GOOD' ? 'badge-success' :
                            p.verdict === 'RISC MEDIU' || p.verdict === 'MEDIUM RISK' ? 'badge-warning' : 'badge-danger'
                          }`}>{p.verdict}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          {p.urlSupplier && (
                            <a href={p.urlSupplier} target="_blank" rel="noreferrer" className="btn-secondary-sm" style={{ textDecoration: 'none', padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '4px' }}>
                              <ExternalLink size={12} /> {isRo ? 'Furnizor' : 'Supplier'}
                            </a>
                          )}
                          <a 
                            href={`https://www.emag.ro/search/${encodeURIComponent(p.name)}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-secondary-sm" 
                            style={{ textDecoration: 'none', padding: '4px 8px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '4px' }}
                            title="Vezi și compară produsul pe eMAG"
                          >
                            <ExternalLink size={12} /> eMAG
                          </a>
                          <button 
                            className={`btn-primary-sm ${p.imported ? 'btn-imported' : ''}`}
                            onClick={() => handleImportOnlineItem(p)}
                            disabled={p.imported || importingSku === p.sku}
                            style={{ padding: '4px 10px', fontSize: '11px' }}
                          >
                            {p.imported ? <Check size={12} /> : <Download size={12} />}
                            {p.imported ? (isRo ? ' Importat' : ' Imported') : (isRo ? ' Importă în DB' : ' Import to DB')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="empty-state settings-card">
                <p>{isRo ? 'Niciun produs găsit pe internet nu a îndeplinit filtrele alese. Încearcă un alt cuvânt cheie (ex: "organizatoare auto", "căști bluetooth", "lămpi birou").' : 'No products found on the web matched your chosen filters. Try another keyword (e.g. "car organizers", "bluetooth headphones", "desk lamps").'}</p>
              </div>
            )
          ) : (
            localResults.length > 0 ? (
              <div className="opportunities-results-box">
                <h4>TOP PRODUSE RECOMANDATE DIN SQLITE ({localResults.length} oportunități găsite)</h4>
                <div className="opportunities-list-wrapper mt-1">
                  {localResults.map((p, idx) => {
                    const comisionEst = Math.round(((p.price_med || 0) * 15) / 100);
                    const profit = (p.price_med || 0) - p.price_supplier - comisionEst;
                    const roi = p.price_supplier > 0 ? (profit / p.price_supplier) * 100 : 0;
                    
                    return (
                      <div key={p.id} className="hunter-op-card" onClick={() => handleProductClick(p.id)}>
                        <div className="op-card-rank">#{idx + 1}</div>
                        <div className="op-card-details">
                          <h5>{p.name}</h5>
                          <span className="op-card-meta">
                            SKU: <code>{p.sku}</code> • Furnizor: <strong>{p.supplier_name}</strong> • Categorie: {p.category}
                          </span>
                        </div>
                        
                        <div className="op-card-financials">
                          <div className="fin-node">
                            <span>Achiziție:</span>
                            <strong>{formatBani(p.price_supplier)}</strong>
                          </div>
                          <div className="fin-node">
                            <span>Est. eMAG:</span>
                            <strong>{formatBani(p.price_med)}</strong>
                          </div>
                          <div className="fin-node text-green">
                            <span>Profit Net:</span>
                            <strong>+{formatBani(profit)}</strong>
                          </div>
                          <div className="fin-node text-green">
                            <span>ROI:</span>
                            <strong>{roi.toFixed(0)}%</strong>
                          </div>
                        </div>

                        <div className="op-card-scores">
                          <div className="score-badge-circle">
                            <span className="score-val">{p.opportunity_score}</span>
                            <span className="score-label">Opp Score</span>
                          </div>
                          <span className={`badge ${
                            p.verdict === 'CUMPĂRĂ' ? 'badge-success' :
                            p.verdict === 'FOARTE BUN' ? 'badge-success' :
                            p.verdict === 'RISC MEDIU' ? 'badge-warning' : 'badge-danger'
                          }`}>{p.verdict}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="empty-state settings-card">
                <p>Niciun produs din baza de date locală nu a îndeplinit criteriile de profitabilitate și risc.</p>
              </div>
            )
          )
        ) : (
          <div className="empty-state settings-card">
            <p>Alegeți modul de vânătoare (🌐 Live Online pe Internet sau 💾 Bază de Date Locală), introduceți parametrii și apăsați butonul de căutare.</p>
          </div>
        )}
      </div>
    </div>
  );
}
