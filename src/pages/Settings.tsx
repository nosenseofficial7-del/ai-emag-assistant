import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, Plus, Trash2, Sliders, DollarSign, Bot } from 'lucide-react';
import type { OpportunityWeights, CategoryCommissions } from '../types';

interface SettingsProps {
  t: any;
  lang?: 'ro' | 'en';
}

export default function Settings({ t }: SettingsProps) {
  const isRo = t.navDashboard === 'Panou Control';

  const [weights, setWeights] = useState<OpportunityWeights>({
    profitability: 0.30,
    demand: 0.25,
    competition: 0.25,
    marketOpportunity: 0.10,
    risk: 0.10
  });
  
  const [commissions, setCommissions] = useState<CategoryCommissions>({});
  const [newCatName, setNewCatName] = useState('');
  const [newCatCommission, setNewCatCommission] = useState('15');
  
  const [aiConfig, setAiConfig] = useState({
    provider: 'gemini',
    apiKey: '',
    model: 'gemini-1.5-flash'
  });
  
  const [savingWeights, setSavingWeights] = useState(false);
  const [savingCommissions, setSavingCommissions] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [msgWeights, setMsgWeights] = useState('');
  const [msgCommissions, setMsgCommissions] = useState('');
  const [msgAi, setMsgAi] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    if (window.api && window.api.getSettings) {
      try {
        const w = await window.api.getSettings('opportunity_weights');
        if (w) setWeights(w);
        
        const c = await window.api.getSettings('emag_commissions');
        if (c) setCommissions(c);
        
        const ai = await window.api.getSettings('ai_config');
        if (ai) setAiConfig(ai);
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    }
  };

  const handleWeightChange = (key: keyof OpportunityWeights, val: number) => {
    setWeights(prev => ({
      ...prev,
      [key]: val / 100
    }));
  };

  const totalWeightPercent = Math.round(
    (weights.profitability + weights.demand + weights.competition + weights.marketOpportunity + weights.risk) * 100
  );

  const saveWeights = async () => {
    setSavingWeights(true);
    try {
      if (window.api && window.api.saveSettings) {
        await window.api.saveSettings('opportunity_weights', weights);
        setMsgWeights(isRo ? 'Ponderi salvate cu succes!' : 'Weights saved successfully!');
        setTimeout(() => setMsgWeights(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingWeights(false);
    }
  };

  const saveCommissions = async () => {
    setSavingCommissions(true);
    try {
      if (window.api && window.api.saveSettings) {
        await window.api.saveSettings('emag_commissions', commissions);
        setMsgCommissions(isRo ? 'Comisioane salvate cu succes!' : 'Commissions saved successfully!');
        setTimeout(() => setMsgCommissions(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingCommissions(false);
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const commVal = parseFloat(newCatCommission) || 15;
    setCommissions(prev => ({
      ...prev,
      [newCatName.trim()]: commVal
    }));
    setNewCatName('');
    setNewCatCommission('15');
  };

  const handleDeleteCategory = (cat: string) => {
    setCommissions(prev => {
      const next = { ...prev };
      delete next[cat];
      return next;
    });
  };

  const saveAiConfig = async () => {
    setSavingAi(true);
    try {
      if (window.api && window.api.saveSettings) {
        await window.api.saveSettings('ai_config', aiConfig);
        setMsgAi(isRo ? 'Configurație AI salvată cu succes!' : 'AI configuration saved successfully!');
        setTimeout(() => setMsgAi(''), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingAi(false);
    }
  };

  return (
    <div className="fade-in-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">
            <SettingsIcon style={{ color: '#8b5cf6', width: '26px', height: '26px' }} />
            {isRo ? 'Setări Aplicație & Ponderi Algoritm' : 'Application Settings & Algorithm Weights'}
          </h2>
          <p className="page-subtitle">
            {isRo ? 'Personalizează ponderile scorului de oportunitate, comisioanele eMAG și integrarea AI.' : 'Customize opportunity score weights, eMAG commissions, and AI API integration.'}
          </p>
        </div>
      </div>

      {/* Grid: 3 Glassmorphic Sections */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Section 1: Opportunity Score Weights */}
        <div style={{
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: 'rgba(18, 24, 41, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Sliders style={{ color: '#60a5fa', width: '20px', height: '20px' }} />
              {isRo ? 'Ponderi Scorul de Oportunitate' : 'Opportunity Score Weights'}
            </h3>
            <span style={{ fontSize: '12px', fontWeight: '800', color: totalWeightPercent === 100 ? '#34d399' : '#f87171' }}>
              Total: {totalWeightPercent}% / 100%
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Profitability */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1' }}>
                <span>{isRo ? 'Profitabilitate (ROI)' : 'Profitability (ROI)'}</span>
                <strong>{Math.round(weights.profitability * 100)}%</strong>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={Math.round(weights.profitability * 100)}
                onChange={(e) => handleWeightChange('profitability', parseInt(e.target.value))}
                style={{ accentColor: '#3b82f6' }}
              />
            </div>

            {/* Demand */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1' }}>
                <span>{isRo ? 'Cerere (Volum Recenzii)' : 'Demand (Reviews Volume)'}</span>
                <strong>{Math.round(weights.demand * 100)}%</strong>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={Math.round(weights.demand * 100)}
                onChange={(e) => handleWeightChange('demand', parseInt(e.target.value))}
                style={{ accentColor: '#3b82f6' }}
              />
            </div>

            {/* Competition */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1' }}>
                <span>{isRo ? 'Competiție (Număr Vânzători)' : 'Competition (Sellers Count)'}</span>
                <strong>{Math.round(weights.competition * 100)}%</strong>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={Math.round(weights.competition * 100)}
                onChange={(e) => handleWeightChange('competition', parseInt(e.target.value))}
                style={{ accentColor: '#3b82f6' }}
              />
            </div>

            {/* Risk */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#cbd5e1' }}>
                  <span>{isRo ? 'Risc Redus' : 'Low Risk Factor'}</span>
                  <strong>{Math.round(weights.risk * 100)}%</strong>
                </div>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={Math.round(weights.risk * 100)}
                onChange={(e) => handleWeightChange('risk', parseInt(e.target.value))}
                style={{ accentColor: '#3b82f6' }}
              />
            </div>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={saveWeights}
              disabled={savingWeights}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              <span>{isRo ? 'Salvează Ponderi' : 'Save Weights'}</span>
            </button>
            {msgWeights && <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '700' }}>{msgWeights}</span>}
          </div>
        </div>

        {/* Section 2: eMAG Category Commissions */}
        <div style={{
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: 'rgba(18, 24, 41, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign style={{ color: '#34d399', width: '20px', height: '20px' }} />
            {isRo ? 'Comisioane eMAG pe Categorii (%)' : 'eMAG Category Commissions (%)'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
            {Object.keys(commissions).map((cat) => (
              <div 
                key={cat}
                style={{
                  padding: '12px 14px',
                  borderRadius: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff', display: 'block' }}>{cat}</span>
                  <span style={{ fontSize: '11px', color: '#34d399', fontWeight: '700' }}>{commissions[cat]}% comision</span>
                </div>
                {cat !== 'Default' && (
                  <button 
                    onClick={() => handleDeleteCategory(cat)}
                    style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', padding: '4px' }}
                  >
                    <Trash2 style={{ width: '16px', height: '16px' }} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add Category Row */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder={isRo ? "Categorie nouă (ex: Grădină)" : "New Category (e.g. Garden)"}
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', outline: 'none', flex: 1 }}
            />
            <input 
              type="number" 
              placeholder="15"
              value={newCatCommission}
              onChange={(e) => setNewCatCommission(e.target.value)}
              style={{ width: '80px', padding: '10px 14px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', outline: 'none' }}
            />
            <button 
              onClick={handleAddCategory}
              style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)', color: '#60a5fa', fontWeight: '800', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus style={{ width: '16px', height: '16px' }} /> {isRo ? 'Adaugă' : 'Add'}
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={saveCommissions}
              disabled={savingCommissions}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              <span>{isRo ? 'Salvează Comisioane' : 'Save Commissions'}</span>
            </button>
            {msgCommissions && <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '700' }}>{msgCommissions}</span>}
          </div>
        </div>

        {/* Section 3: AI Engine Config */}
        <div style={{
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: 'rgba(18, 24, 41, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bot style={{ color: '#ec4899', width: '20px', height: '20px' }} />
            {isRo ? 'Configurare Motor Inteligență Artificială (LLM)' : 'AI Engine Configuration (LLM)'}
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Furnizor AI</label>
              <select
                value={aiConfig.provider}
                onChange={(e) => setAiConfig(prev => ({ ...prev, provider: e.target.value }))}
                style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '13.5px', outline: 'none' }}
              >
                <option value="gemini" style={{ backgroundColor: '#111522' }}>Google Gemini (Recomandat)</option>
                <option value="openai" style={{ backgroundColor: '#111522' }}>OpenAI ChatGPT</option>
                <option value="claude" style={{ backgroundColor: '#111522' }}>Anthropic Claude</option>
                <option value="ollama" style={{ backgroundColor: '#111522' }}>Ollama Local (Offline)</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>Cheie API (API Key)</label>
              <input 
                type="password"
                placeholder="AIzaSy..."
                value={aiConfig.apiKey}
                onChange={(e) => setAiConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '13.5px', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              onClick={saveAiConfig}
              disabled={savingAi}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              <Save style={{ width: '16px', height: '16px' }} />
              <span>{isRo ? 'Salvează Configurație AI' : 'Save AI Config'}</span>
            </button>
            {msgAi && <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '700' }}>{msgAi}</span>}
          </div>
        </div>

      </div>

    </div>
  );
}
