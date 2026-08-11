import { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Loader2, Terminal, 
  ExternalLink, Plus, Check, Database 
} from 'lucide-react';

interface Message {
  sender: 'user' | 'ai';
  text?: string;
  thinking?: boolean;
  sql?: string;
  type?: 'text' | 'sourcing';
  query?: string;
  sourcingResults?: SourcedItem[];
  error?: boolean;
}

interface SourcedItem {
  name: string;
  sku: string;
  priceSupplier: number; // in cents
  imageUrl: string;
  urlSupplier: string;
  supplierName?: string;
  matchedEmag?: {
    name: string;
    price: number;
    rating: number;
    reviewsCount: number;
    url: string;
  };
  opportunityScore: number;
  verdict: string;
  roi: number;
  imported?: boolean;
}

interface AiAssistantProps {
  t: any;
}

export default function AiAssistant({ t }: AiAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const [aiConfigured, setAiConfigured] = useState(false);
  const [aiProviderLabel, setAiProviderLabel] = useState('Mock / Demo');

  useEffect(() => {
    // Seteaza mesajul initial in functie de limba selectata
    setMessages([
      {
        sender: 'ai',
        text: t.aiWelcome
      }
    ]);
  }, [t]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Verificam configuratia AI
    if (window.api && window.api.getSettings) {
      window.api.getSettings('ai_config').then((config: any) => {
        if (config && config.provider !== 'mock') {
          setAiConfigured(true);
          const labels: any = {
            gemini: 'Google Gemini',
            openai: 'OpenAI ChatGPT',
            claude: 'Anthropic Claude',
            ollama: 'Ollama Local'
          };
          setAiProviderLabel(labels[config.provider] || config.provider);
        }
      });
      
      window.api.getSuppliers().then(setSuppliers).catch(console.error);
    }
  }, []);

  const isRo = t.navDashboard === 'Panou Control';

  const samplePrompts = isRo ? [
    "Ce produse merita cumparate?",
    "Am 500 EUR. Ce ai cumpara?",
    "Arata-mi produsele cu profit peste 40 lei.",
    "Ce ar trebui sa reaprovizionez?",
    "cauta live lampi led monitor",
    "cauta live organizatoare auto"
  ] : [
    "Which products are worth buying?",
    "I have 500 EUR. What would you buy?",
    "Show me products with profit over 40 lei.",
    "What should I restock?",
    "search live for led monitor lamps",
    "search live for car organizers"
  ];

  // Collapsible SQL query states
  const [visibleSqlIndex, setVisibleSqlIndex] = useState<number | null>(null);

  const handleSend = async (text: string) => {
    if (!text.trim() || loading) return;

    // Adaugam mesajul utilizatorului
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInputText('');
    setLoading(true);

    // Adaugam starea de incarcare
    setMessages(prev => [...prev, { sender: 'ai', thinking: true }]);

    try {
      const res = await window.api.askAi(text);
      
      // Eliminam starea de incarcare
      setMessages(prev => prev.filter(m => !m.thinking));

      if (res.success) {
        if (res.type === 'action' && res.action === 'live_sourcing') {
          await runSourcingAgent(res.query);
        } else {
          setMessages(prev => [...prev, { 
            sender: 'ai', 
            text: res.text, 
            sql: res.sql, 
            type: 'text' 
          }]);
        }
      } else {
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: `Error: ${res.error}`, 
          error: true 
        }]);
      }
    } catch (err: any) {
      setMessages(prev => prev.filter(m => !m.thinking));
      setMessages(prev => [...prev, { 
        sender: 'ai', 
        text: `Connection error: ${err.message || err}`, 
        error: true 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runSourcingAgent = async (keyword: string) => {
    const startMsg = isRo
      ? `Initiez Agentul Sourcing. Scanam in timp real furnizorii B2B (Maxy, Verk, Eany) si eMAG Marketplace pentru: **"${keyword}"**...\nAcest proces dureaza cateva secunde.`
      : `Initiating Sourcing Agent. Crawling B2B suppliers (Maxy, Verk, Eany) and eMAG Marketplace in real-time for: **"${keyword}"**...\nThis process takes a few seconds.`;
      
    setMessages(prev => [...prev, { 
      sender: 'ai', 
      type: 'sourcing',
      text: startMsg,
      query: keyword
    }]);

    try {
      const [supplierRes, emagRes] = await Promise.all([
        window.api.searchSuppliersLive(keyword),
        window.api.searchEmag(keyword)
      ]);

      if (!supplierRes.success || !emagRes.success) {
        throw new Error(supplierRes.error || emagRes.error || 'Live search failed on one of the platforms.');
      }

      const rawSupplier = supplierRes.results || [];
      const rawEmag = emagRes.results || [];

      if (rawSupplier.length === 0) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: isRo 
            ? `Cautarea live a finalizat, dar nu am gasit produse la furnizorii B2B pentru **"${keyword}"**.`
            : `Live search completed, but no products were found at B2B suppliers for **"${keyword}"**.`
        }]);
        return;
      }

      const sourcedItems: SourcedItem[] = rawSupplier.slice(0, 5).map((sp: any, index: number) => {
        const ep = rawEmag[index] || rawEmag[0] || null;
        
        let roi = 0;
        let opportunityScore = 30;
        let verdict = isRo ? 'NU MERITA' : 'DO NOT BUY';
        let matchedEmagObj = undefined;

        if (ep) {
          matchedEmagObj = {
            name: ep.name,
            price: ep.price,
            rating: ep.rating,
            reviewsCount: ep.reviewsCount,
            url: ep.url
          };
          
          const purchasePrice = sp.price_supplier / 100; // in RON
          const activePrice = ep.price; // in RON
          const comisionRate = 15;
          const comisionEmag = (activePrice * comisionRate) / 100;
          const tvaVanzare = (activePrice * 19) / 119;
          const logistica = 15 + 1.5;
          const profit = activePrice - purchasePrice - comisionEmag - tvaVanzare - logistica;
          roi = purchasePrice > 0 ? (profit / purchasePrice) * 100 : 0;

          let demandScore = Math.min(100, Math.round(Math.log10(ep.reviewsCount + 1) * 40));
          if (ep.rating > 0) demandScore = Math.min(100, Math.round(demandScore * (ep.rating / 5)));
          
          const competitionScore = 40;
          let profitabilityScore = 0;
          if (roi >= 50) profitabilityScore = 100;
          else if (roi >= 35) profitabilityScore = 85;
          else if (roi >= 20) profitabilityScore = 60;
          else if (roi >= 5) profitabilityScore = 30;

          opportunityScore = Math.round(
            demandScore * 0.25 + 
            (100 - competitionScore) * 0.25 + 
            profitabilityScore * 0.30 + 
            30 * 0.10 + 
            80 * 0.10
          );

          if (opportunityScore >= 75) verdict = isRo ? 'CUMPARA' : 'BUY';
          else if (opportunityScore >= 60) verdict = isRo ? 'FOARTE BUN' : 'VERY GOOD';
          else if (opportunityScore >= 45) verdict = isRo ? 'RISC MEDIU' : 'MEDIUM RISK';
        }

        return {
          name: sp.name,
          sku: sp.sku,
          priceSupplier: sp.price_supplier,
          imageUrl: sp.image_url,
          urlSupplier: sp.url_supplier,
          supplierName: sp.supplier_name,
          matchedEmag: matchedEmagObj,
          opportunityScore,
          verdict,
          roi,
          imported: false
        };
      });

      const endMsg = isRo
        ? `Am gasit **${rawSupplier.length}** produse la furnizor si **${rawEmag.length}** listari concurente pe eMAG. Iata cele mai bune oportunitati de import calculate:`
        : `Found **${rawSupplier.length}** B2B supplier products and **${rawEmag.length}** competing listings on eMAG. Here are the calculated opportunities:`;

      setMessages(prev => [...prev, {
        sender: 'ai',
        type: 'sourcing',
        text: endMsg,
        sourcingResults: sourcedItems
      }]);

    } catch (err: any) {
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: isRo ? `Eroare scanare live Sourcing: ${err.message || err}` : `Live sourcing scan error: ${err.message || err}`,
        error: true
      }]);
    }
  };

  const handleImportSourcedItem = async (item: SourcedItem, msgIdx: number, itemIdx: number) => {
    if (window.api && window.api.addOrUpdateProduct) {
      let matchedSupplier = suppliers.find(s => 
        item.supplierName && s.name.toUpperCase().includes(item.supplierName.toUpperCase())
      );
      if (!matchedSupplier && item.supplierName) {
        matchedSupplier = suppliers.find(s => 
          s.name.toUpperCase().includes('MAXY') || s.name.toUpperCase().includes('VERK') || s.name.toUpperCase().includes('EANY')
        );
      }
      const supplierId = matchedSupplier ? matchedSupplier.id : (suppliers[0] ? suppliers[0].id : 'sup_maxy_default');

      const productPayload = {
        supplier_id: supplierId,
        name: item.name,
        sku: item.sku,
        price_supplier: item.priceSupplier,
        image_url: item.imageUrl,
        url_supplier: item.urlSupplier,
        stock_supplier: 50,
        moq: 1,
        vat: 19.0,
        currency: 'RON',
        research: item.matchedEmag ? {
          price_min: Math.round((item.matchedEmag.price * 0.9) * 100) / 100,
          price_med: item.matchedEmag.price,
          price_max: Math.round((item.matchedEmag.price * 1.1) * 100) / 100,
          sellers_count: 3,
          rating: item.matchedEmag.rating,
          reviews_count: item.matchedEmag.reviewsCount
        } : undefined
      };

      try {
        const res = await window.api.addOrUpdateProduct(productPayload);
        if (res.success) {
          setMessages(prev => {
            const updated = [...prev];
            const msg = updated[msgIdx];
            if (msg && msg.sourcingResults) {
              msg.sourcingResults[itemIdx] = {
                ...msg.sourcingResults[itemIdx],
                imported: true
              };
            }
            return updated;
          });
        } else {
          alert(`Error: ${res.error}`);
        }
      } catch (err: any) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  return (
    <div className="page-ai-assistant fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.aiTitle}</h2>
          <p className="page-subtitle">{t.aiSubtitle}</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: 'var(--bg-dark-hover)', padding: '6px 12px', borderRadius: '20px', border: '1px solid var(--border-color)' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: aiConfigured ? '#10b981' : '#f59e0b' }}></span>
          <span>{t.aiEngineLabel}: <strong>{aiProviderLabel}</strong></span>
        </div>
      </div>

      <div className="ai-assistant-layout">
        {/* Chat window */}
        <div className="chat-container settings-card">
          <div className="chat-messages-box">
            {messages.map((m, idx) => (
              <div key={idx} className={`message-bubble ${m.sender === 'user' ? 'user-msg' : 'ai-msg'} ${m.error ? 'error-bubble' : ''}`}>
                <div className="msg-avatar">
                  {m.sender === 'user' ? 'ME' : <Sparkles size={16} />}
                </div>
                <div className="msg-content" style={{ width: '100%' }}>
                  {m.thinking ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)' }}>
                      <Loader2 size={16} className="spin text-blue" />
                      <span>{t.aiThinking}</span>
                    </div>
                  ) : (
                    <>
                      <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{m.text}</p>
                      
                      {/* Sourcing Results Cards */}
                      {m.sourcingResults && m.sourcingResults.length > 0 && (
                        <div className="sourcing-cards-carousel" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                          {m.sourcingResults.map((item, itemIdx) => (
                            <div key={itemIdx} className="panel-card" style={{ display: 'flex', gap: '12px', padding: '12px', background: 'var(--bg-dark-hover)', border: '1px solid var(--border-color)', borderRadius: '8px', alignItems: 'center' }}>
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name} 
                                  style={{ width: '56px', height: '56px', objectFit: 'contain', background: '#fff', padding: '2px', borderRadius: '4px' }}
                                />
                              )}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <h5 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '700', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.name}</h5>
                                <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                  B2B Cost: <strong>{(item.priceSupplier / 100).toFixed(2)} RON</strong> 
                                  {item.matchedEmag && (
                                    <> | eMAG: <strong>{item.matchedEmag.price.toFixed(2)} RON</strong> | ROI: <strong style={{ color: item.roi >= 20 ? '#10b981' : '#ef4444' }}>{item.roi.toFixed(0)}%</strong></>
                                  )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                                  <span style={{ fontSize: '10.5px' }}>{isRo ? 'Oportunitate' : 'Opportunity'}: <strong>{item.opportunityScore}/100</strong></span>
                                  <span className={`badge ${item.verdict === 'CUMPĂRĂ' || item.verdict === 'FOARTE BUN' || item.verdict === 'BUY' || item.verdict === 'VERY GOOD' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '9px', padding: '1px 4px' }}>
                                    {item.verdict}
                                  </span>
                                </div>
                              </div>
                              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                {item.urlSupplier && (
                                  <a 
                                    href={item.urlSupplier} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    className="btn btn-secondary" 
                                    style={{ padding: '6px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', textDecoration: 'none' }}
                                    title={isRo ? "Vezi la furnizor" : "View at supplier"}
                                  >
                                    <ExternalLink size={13} /> {isRo ? "Vezi Furnizor" : "View Supplier"}
                                  </a>
                                )}
                                <a 
                                  href={`https://www.emag.ro/search/${encodeURIComponent(item.name)}`} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="btn btn-secondary" 
                                  style={{ padding: '6px 10px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', textDecoration: 'none' }}
                                  title={isRo ? "Vezi și compară produsul pe eMAG" : "View and compare on eMAG"}
                                >
                                  <ExternalLink size={13} /> {isRo ? "Vezi eMAG" : "View eMAG"}
                                </a>
                                {item.imported ? (
                                  <button className="btn btn-success" disabled style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}>
                                    <Check size={14} /> {t.badgeImported}
                                  </button>
                                ) : (
                                  <button 
                                    className="btn btn-primary hover-glow-btn" 
                                    style={{ padding: '6px 12px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11.5px' }}
                                    onClick={() => handleImportSourcedItem(item, idx, itemIdx)}
                                  >
                                    <Plus size={14} /> {t.btnImportSourced}
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Code SQL Block collapse */}
                      {m.sql && (
                        <div style={{ marginTop: '10px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '11px', padding: '4px 8px' }}
                            onClick={() => setVisibleSqlIndex(visibleSqlIndex === idx ? null : idx)}
                          >
                            <Terminal size={12} />
                            {visibleSqlIndex === idx ? t.btnHideSql : t.btnShowSql}
                          </button>
                          {visibleSqlIndex === idx && (
                            <pre style={{ margin: '6px 0 0 0', padding: '10px', background: '#1e1e1e', color: '#85d5fe', borderRadius: '6px', fontFamily: 'monospace', fontSize: '11.5px', overflowX: 'auto', border: '1px solid var(--border-color)' }}>
                              <code>{m.sql}</code>
                            </pre>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSend(inputText); }} className="chat-input-form">
            <input 
              type="text" 
              placeholder={t.aiPlaceholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="chat-input-field"
              disabled={loading}
            />
            <button type="submit" className="chat-send-btn hover-glow-btn" disabled={loading || !inputText.trim()}>
              {loading ? <Loader2 size={16} className="spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>

        {/* Suggestion column */}
        <div className="ai-info-column">
          <div className="settings-card info-faza-card">
            <div className="alert-header">
              <Database size={18} className="text-blue" />
              <strong>{t.aiInfoTitle}</strong>
            </div>
            <p className="mt-1" style={{ fontSize: '12.5px' }}>
              {t.aiInfoDesc}
            </p>
            {!aiConfigured && (
              <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                💡 <em>{t.aiSettingsTip}</em>
              </div>
            )}
          </div>

          <div className="settings-card prompt-suggestions-card">
            <h4>{t.aiSuggestedTitle}</h4>
            <div className="suggested-prompts-grid">
              {samplePrompts.map((p, idx) => (
                <button 
                  key={idx} 
                  className="prompt-suggestion-btn" 
                  onClick={() => handleSend(p)}
                  disabled={loading}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
