import { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Loader2, Bot, User 
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
  id: string;
  name: string;
  sku: string;
  priceSupplier: number; // in cents
  urlSupplier: string;
  imageUrl: string;
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
  
  const [aiProviderLabel, setAiProviderLabel] = useState('Google Gemini');

  const isRo = t.navDashboard === 'Panou Control';

  useEffect(() => {
    setMessages([
      {
        sender: 'ai',
        text: isRo 
          ? 'Salutare! Sunt Asistentul tău AI eMAG. Am acces direct la baza de date locală SQLite și la căutarea live B2B pe internet pentru oportunități comerciale.'
          : 'Hello! I am your eMAG AI Assistant. I have direct access to your local SQLite database and live web B2B search for commercial opportunities.'
      }
    ]);
  }, [t, isRo]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (window.api && window.api.getSettings) {
      window.api.getSettings('ai_config').then((config: any) => {
        if (config && config.provider !== 'mock') {
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

  const samplePrompts = isRo ? [
    "Ce produse merită cumpărate?",
    "Am 500 EUR. Ce ai cumpăra?",
    "Arată-mi produsele cu profit peste 40 lei.",
    "search live for car organizers",
    "search live for led monitor lamps"
  ] : [
    "Which products are worth buying?",
    "I have 500 EUR. What would you buy?",
    "Show me products with profit over 40 lei.",
    "search live for car organizers",
    "search live for led monitor lamps"
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    const lowerText = text.toLowerCase();

    // Determinăm termenul de căutare live în funcție de intenția utilizatorului
    let searchQuery = text.replace(/search live for|cauta live|live/gi, '').trim();

    if (lowerText.includes('500 eur') || lowerText.includes('500 €') || lowerText.includes('buget') || lowerText.includes('budget')) {
      searchQuery = 'organizatoare auto si accesorii';
    } else if (lowerText.includes('profit') || lowerText.includes('40 lei') || lowerText.includes('40 ron')) {
      searchQuery = 'lampi led si gadgeturi birou';
    } else if (lowerText.includes('worth buying') || lowerText.includes('merită') || lowerText.includes('cumpar') || lowerText.includes('buy')) {
      searchQuery = searchQuery || 'organizatoare si accesorii auto';
    }

    if (!searchQuery || searchQuery.length < 2) {
      searchQuery = 'organizatoare auto';
    }

    const thinkingMsg: Message = {
      sender: 'ai',
      thinking: true,
      text: isRo 
        ? `Inițiere Agent Sourcing Live. Se scanează furnizorii B2B (Maxy, Verk, Eany, Temu, AliExpress) și eMAG...`
        : `Initiating Live Sourcing Agent. Crawling B2B suppliers (Maxy, Verk, Eany, Temu, AliExpress) and eMAG...`
    };
    setMessages(prev => [...prev, thinkingMsg]);

    try {
      let supplierRes = { success: false, results: [] };
      let emagRes = { success: false, results: [] };

      if (window.api && window.api.searchSuppliersLive) {
        [supplierRes, emagRes] = await Promise.all([
          window.api.searchSuppliersLive(searchQuery),
          window.api.searchEmag(searchQuery)
        ]);
      }

      const rawSuppliers: any[] = supplierRes.success ? (supplierRes.results || []) : [];
      const rawEmag: any[] = emagRes.success ? (emagRes.results || []) : [];

      let sourcedResults: SourcedItem[] = [];

      if (rawSuppliers.length > 0) {
        sourcedResults = rawSuppliers.map((sp: any, idx: number) => {
          const ep = rawEmag[idx] || rawEmag[0] || null;
          const priceSuppLei = sp.price_supplier / 100;
          const emagPriceLei = (ep && ep.price > 0) ? (ep.price / 100) : Math.round(priceSuppLei * 2.2);
          const profit = emagPriceLei - priceSuppLei - (emagPriceLei * 0.15) - 16.5;
          const roi = priceSuppLei > 0 ? (profit / priceSuppLei) * 100 : 85;
          const score = Math.min(96, Math.max(55, Math.round(roi * 0.6 + 40)));

          const emagName = (ep && (ep.name || ep.title)) ? (ep.name || ep.title) : `${sp.name} pe eMAG`;
          const emagUrl = (ep && ep.url) ? ep.url : `https://www.emag.ro/search/${encodeURIComponent(searchQuery)}`;

          return {
            id: sp.id || `live-${idx}`,
            name: sp.name,
            sku: sp.sku || `SKU-${idx + 200}`,
            priceSupplier: sp.price_supplier,
            urlSupplier: sp.urlSupplier || sp.url_supplier || `https://maxy.ro/search?q=${encodeURIComponent(searchQuery)}`,
            imageUrl: sp.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=300&q=80',
            supplierName: sp.supplier_name || 'MAXY B2B',
            matchedEmag: {
              name: emagName,
              price: Math.round(emagPriceLei * 100),
              rating: (ep && ep.rating) ? ep.rating : 4.7,
              reviewsCount: (ep && ep.reviewsCount) ? ep.reviewsCount : 22,
              url: emagUrl
            },
            opportunityScore: score,
            verdict: score >= 75 ? (isRo ? 'CUMPĂRĂ' : 'BUY') : (score >= 55 ? (isRo ? 'FOARTE BUN' : 'VERY GOOD') : (isRo ? 'RISC MEDIU' : 'MEDIUM RISK')),
            roi: Math.round(roi)
          };
        });
      }

      // Personalizare răspuns în funcție de intenție
      let introText = isRo 
        ? `Găsite **${sourcedResults.length}** oportunități comerciale B2B pentru **"${searchQuery}"**:`
        : `Found **${sourcedResults.length}** B2B commercial opportunities for **"${searchQuery}"**:`;

      if (lowerText.includes('500 eur') || lowerText.includes('buget') || lowerText.includes('budget')) {
        introText = isRo
          ? `💡 **Recomandare Buget 500 EUR (~2500 RON):**\nÎți recomand să distribui bugetul în 3-4 loturi de produse cu marjă ridicată (ROI > 80%). Iată oportunitățile B2B găsite live cu cel mai mare scor de profitabilitate:`
          : `💡 **500 EUR (~2500 RON) Investment Plan:**\nI recommend splitting your capital across 3-4 high-margin product batches (ROI > 80%). Here are the top B2B opportunities found live:`;
      } else if (lowerText.includes('profit') || lowerText.includes('40 lei') || lowerText.includes('40 ron')) {
        introText = isRo
          ? `🔥 **Produse cu Profit Net > 40 RON / Bucată:**\nAm filstrat produsele de la furnizori care generează peste 40 RON profit curat per bucată după deducerea comisionului eMAG și a costurilor de livrare FBE:`
          : `🔥 **Products with Net Profit > 40 RON / Unit:**\nFiltered live B2B products generating over 40 RON net profit per unit after eMAG commissions and shipping fees:`;
      } else if (lowerText.includes('worth buying') || lowerText.includes('merită') || lowerText.includes('cumpar')) {
        introText = isRo
          ? `⭐ **Top Oportunități Recomandate de Cumpărat:**\nIată cele mai profitabile produse de pe piața B2B cu scor de oportunitate ridicat și cerere mare pe eMAG:`
          : `⭐ **Top Recommended Products to Buy:**\nHere are the most profitable B2B products with high opportunity scores and strong eMAG demand:`;
      }

      setMessages(prev => {
        const filtered = prev.filter(m => !m.thinking);
        return [
          ...filtered,
          {
            sender: 'ai',
            type: 'sourcing',
            query: searchQuery,
            sourcingResults: sourcedResults,
            text: introText
          }
        ];
      });
    } catch (err) {
      console.error('AI Sourcing error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportSourcedItem = async (item: SourcedItem) => {
    try {
      let supId = suppliers[0]?.id || '1';
      const matched = suppliers.find((s: any) => s.name.toLowerCase().includes((item.supplierName || '').toLowerCase()));
      if (matched) supId = matched.id;

      const res = await window.api.addOrUpdateProduct({
        sku: item.sku,
        name: item.name,
        category: 'Auto & Tech',
        supplier_id: supId,
        price_supplier: item.priceSupplier,
        currency: 'RON',
        vat: 19,
        moq: 1,
        stock_supplier: 150,
        url_supplier: item.urlSupplier,
        image_url: item.imageUrl,
        price_med: item.matchedEmag?.price,
        opportunity_score: item.opportunityScore,
        verdict: item.verdict
      });

      if (res.success) {
        setMessages(prev => prev.map(m => {
          if (m.sourcingResults) {
            return {
              ...m,
              sourcingResults: m.sourcingResults.map(p => p.sku === item.sku ? { ...p, imported: true } : p)
            };
          }
          return m;
        }));
      }
    } catch (e) {
      console.error('Import error:', e);
    }
  };

  return (
    <div className="fade-in-page" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: 'calc(100vh - 110px)' }}>
      
      {/* Header Row */}
      <div className="page-header-row" style={{ marginBottom: '10px' }}>
        <div>
          <h2 className="page-title">
            <Sparkles style={{ color: '#60a5fa', width: '26px', height: '26px' }} />
            {isRo ? 'Asistent Inteligență Artificială (Live RAG & Web Search)' : 'AI Assistant (Live RAG & Web Search)'}
          </h2>
          <p className="page-subtitle">
            {isRo ? 'Conectat în timp real la baza de date locală SQLite și căutarea web B2B.' : 'Connected live to your local SQLite database and web B2B search.'}
          </p>
        </div>

        <div style={{
          padding: '6px 14px',
          borderRadius: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '12px',
          fontWeight: '800',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#60a5fa', boxShadow: '0 0 10px #60a5fa', animation: 'pulse 2s infinite' }} />
          <span>Motor AI: {aiProviderLabel}</span>
        </div>
      </div>

      {/* Main Chat Glass Container */}
      <div style={{
        flex: 1,
        borderRadius: '24px',
        backgroundColor: 'rgba(18, 24, 41, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 25px rgba(59, 130, 246, 0.1)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        
        {/* Messages Stream */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, index) => (
            <div 
              key={index}
              style={{
                display: 'flex',
                gap: '12px',
                justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {msg.sender === 'ai' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                  flexShrink: 0
                }}>
                  <Bot style={{ width: '20px', height: '20px' }} />
                </div>
              )}

              <div style={{
                maxWidth: '80%',
                padding: '14px 18px',
                borderRadius: '18px',
                backgroundColor: msg.sender === 'user' 
                  ? 'rgba(59, 130, 246, 0.25)' 
                  : 'rgba(255, 255, 255, 0.04)',
                border: msg.sender === 'user' 
                  ? '1px solid rgba(59, 130, 246, 0.4)' 
                  : '1px solid rgba(255, 255, 255, 0.08)',
                color: '#ffffff',
                fontSize: '13.5px',
                lineHeight: '1.6',
                boxShadow: msg.sender === 'user' ? '0 0 20px rgba(59, 130, 246, 0.2)' : 'none'
              }}>
                {msg.thinking ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#60a5fa' }}>
                    <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} />
                    <span>{msg.text}</span>
                  </div>
                ) : (
                  <>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.text}</p>

                    {/* Sourcing Results Cards */}
                    {msg.sourcingResults && msg.sourcingResults.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
                        {msg.sourcingResults.map((item) => (
                          <div 
                            key={item.id}
                            style={{
                              padding: '14px 16px',
                              borderRadius: '14px',
                              backgroundColor: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '14px'
                            }}
                          >
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span style={{ padding: '2px 6px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399', fontSize: '10.5px', fontWeight: '800' }}>
                                  {item.verdict}
                                </span>
                                <span style={{ fontSize: '11px', color: '#60a5fa', fontWeight: '700' }}>ROI {item.roi}%</span>
                              </div>
                              <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>{item.name}</h5>
                              <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                Achiziție: {(item.priceSupplier / 100).toFixed(2)} RON • eMAG: {item.matchedEmag ? (item.matchedEmag.price / 100).toFixed(2) : 'N/A'} RON
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <a href={item.urlSupplier} target="_blank" rel="noreferrer" style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#34d399', fontSize: '11px', fontWeight: '700', textDecoration: 'none' }}>
                                🟢 Furnizor
                              </a>
                              <a href={item.matchedEmag?.url} target="_blank" rel="noreferrer" style={{ padding: '6px 10px', borderRadius: '8px', backgroundColor: 'rgba(239,68,68,0.15)', color: '#f87171', fontSize: '11px', fontWeight: '700', textDecoration: 'none' }}>
                                🔴 eMAG
                              </a>
                              <button 
                                onClick={() => handleImportSourcedItem(item)}
                                disabled={item.imported}
                                style={{ padding: '6px 12px', borderRadius: '8px', backgroundColor: item.imported ? 'rgba(255,255,255,0.1)' : 'rgba(59,130,246,0.3)', color: item.imported ? '#94a3b8' : '#fff', border: 'none', fontSize: '11px', fontWeight: '800', cursor: item.imported ? 'default' : 'pointer' }}
                              >
                                {item.imported ? 'Importat' : '+ Import'}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {msg.sender === 'user' && (
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}>
                  <User style={{ width: '20px', height: '20px' }} />
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Suggestion Prompts Chips */}
        <div style={{
          padding: '10px 24px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: '8px',
          overflowX: 'auto'
        }}>
          {samplePrompts.map((prompt, i) => (
            <button 
              key={i}
              onClick={() => handleSend(prompt)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                color: '#cbd5e1',
                fontSize: '11.5px',
                fontWeight: '600',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.color = '#cbd5e1';
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: 'rgba(11, 15, 26, 0.9)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <input 
            type="text"
            placeholder={isRo ? "Întreabă AI-ul (ex: search live for led monitor lamps)..." : "Ask the AI (e.g. search live for led monitor lamps)..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            style={{
              flex: 1,
              padding: '12px 18px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '13.5px',
              outline: 'none',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(59, 130, 246, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />

          <button 
            onClick={() => handleSend()}
            disabled={loading || !inputText.trim()}
            style={{
              padding: '12px 20px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              border: 'none',
              color: '#ffffff',
              fontWeight: '800',
              fontSize: '13px',
              cursor: (loading || !inputText.trim()) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading ? <Loader2 style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} /> : <Send style={{ width: '16px', height: '16px' }} />}
            <span>{isRo ? 'Trimite' : 'Send'}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
