import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Save, FolderOpen, Database, ShieldAlert, ShieldCheck, Sparkles, RefreshCw } from 'lucide-react';
import type { OpportunityWeights, CategoryCommissions } from '../types';
import UpdateModal from '../components/UpdateModal';

interface SettingsProps {
  t: any;
  lang: 'ro' | 'en';
}

export default function Settings({ t, lang }: SettingsProps) {
  // Stari Ponderi Opportunity Score
  const [weights, setWeights] = useState<OpportunityWeights>({
    profitability: 0.30,
    demand: 0.25,
    competition: 0.25,
    marketOpportunity: 0.10,
    risk: 0.10
  });

  // Stari Comisioane
  const [commissions, setCommissions] = useState<CategoryCommissions>({});
  const [newCategory, setNewCategory] = useState('');
  const [newCommValue, setNewCommValue] = useState<number>(15);

  // Stari AI Config
  const [aiProvider, setAiProvider] = useState('mock');
  const [aiApiKey, setAiApiKey] = useState('');
  const [aiModel, setAiModel] = useState('gemini-2.5-flash');
  const [aiEndpoint, setAiEndpoint] = useState('http://localhost:11434');

  // Stari eMAG API Config
  const [emagUsername, setEmagUsername] = useState('demo');
  const [emagPassword, setEmagPassword] = useState('');
  const [emagApiUrl, setEmagApiUrl] = useState('https://marketplace-api.emag.ro/api-3/');
  const [testingEmag, setTestingEmag] = useState(false);

  // Stări Personalizare & Animații
  const [accent, setAccent] = useState<string>(localStorage.getItem('app_accent') || 'emerald');
  const [animMode, setAnimMode] = useState<string>(localStorage.getItem('app_anim') || 'ultra');
  const [density, setDensity] = useState<string>(localStorage.getItem('app_density') || 'normal');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);

  const handleAccentChange = (val: string) => {
    setAccent(val);
    localStorage.setItem('app_accent', val);
    window.dispatchEvent(new Event('customization-change'));
  };

  const handleAnimChange = (val: string) => {
    setAnimMode(val);
    localStorage.setItem('app_anim', val);
    window.dispatchEvent(new Event('customization-change'));
  };

  const handleDensityChange = (val: string) => {
    setDensity(val);
    localStorage.setItem('app_density', val);
    window.dispatchEvent(new Event('customization-change'));
  };

  const [loading, setLoading] = useState(true);
  const [alertMsg, setAlertMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);

    // Fallback din localStorage dacă există
    try {
      const storedAi = localStorage.getItem('app_ai_config');
      if (storedAi) {
        const parsed = JSON.parse(storedAi);
        setAiProvider(parsed.provider || 'mock');
        setAiApiKey(parsed.apiKey || '');
        setAiModel(parsed.model || 'gemini-2.5-flash');
        setAiEndpoint(parsed.endpoint || 'http://localhost:11434');
      }
    } catch(e) {}

    if (window.api && window.api.getSettings) {
      Promise.all([
        window.api.getSettings('opportunity_weights'),
        window.api.getSettings('emag_commissions'),
        window.api.getSettings('ai_config'),
        window.api.getSettings('emag_api_config')
      ])
        .then(([weightsData, commissionsData, aiData, emagData]) => {
          if (weightsData) setWeights(weightsData);
          if (commissionsData) setCommissions(commissionsData);
          if (aiData) {
            setAiProvider(aiData.provider || 'mock');
            setAiApiKey(aiData.apiKey || '');
            setAiModel(aiData.model || 'gemini-2.5-flash');
            setAiEndpoint(aiData.endpoint || 'http://localhost:11434');
            localStorage.setItem('app_ai_config', JSON.stringify(aiData));
          }
          if (emagData) {
            setEmagUsername(emagData.username || 'demo');
            setEmagPassword(emagData.password || '');
            setEmagApiUrl(emagData.url || 'https://marketplace-api.emag.ro/api-3/');
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const showAlert = (type: 'success' | 'danger', text: string) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleSaveWeights = (e: FormEvent) => {
    e.preventDefault();
    const sum = weights.profitability + weights.demand + weights.competition + weights.marketOpportunity + weights.risk;
    
    if (Math.abs(sum - 1.0) > 0.001) {
      const errMsg = lang === 'ro' 
        ? `Suma ponderilor trebuie sa fie exact 100%. Suma curenta este: ${(sum * 100).toFixed(0)}%.`
        : `Sum of weights must equal exactly 100%. Current sum is: ${(sum * 100).toFixed(0)}%.`;
      showAlert('danger', errMsg);
      return;
    }

    if (window.api && window.api.saveSettings) {
      window.api.saveSettings('opportunity_weights', weights)
        .then((res: any) => {
          if (res.success) {
            showAlert('success', lang === 'ro' ? 'Ponderile scorului de oportunitate au fost salvate cu succes.' : 'Opportunity score weights saved successfully.');
          } else {
            showAlert('danger', `Error: ${res.error}`);
          }
        })
        .catch(console.error);
    }
  };

  const handleSaveCommissions = () => {
    if (window.api && window.api.saveSettings) {
      window.api.saveSettings('emag_commissions', commissions)
        .then((res: any) => {
          if (res.success) {
            showAlert('success', lang === 'ro' ? 'Comisioanele categoriilor eMAG au fost salvate cu succes.' : 'eMAG category commissions saved successfully.');
          } else {
            showAlert('danger', `Error: ${res.error}`);
          }
        })
        .catch(console.error);
    }
  };

  const handleAddCategoryCommission = () => {
    if (!newCategory.trim()) return;
    const updated = {
      ...commissions,
      [newCategory.trim()]: newCommValue
    };
    setCommissions(updated);
    setNewCategory('');
    setNewCommValue(15);
  };

  const handleRemoveCategoryCommission = (cat: string) => {
    if (cat === 'Default') return;
    const updated = { ...commissions };
    delete updated[cat];
    setCommissions(updated);
  };

  const handleSaveAiConfig = (e: FormEvent) => {
    e.preventDefault();
    const config = {
      provider: aiProvider,
      apiKey: aiApiKey,
      model: aiModel,
      endpoint: aiEndpoint
    };
    
    // Salvam in localStorage
    localStorage.setItem('app_ai_config', JSON.stringify(config));

    if (window.api && window.api.saveSettings) {
      window.api.saveSettings('ai_config', config)
        .then((res: any) => {
          if (res.success) {
            showAlert('success', lang === 'ro' ? 'Configuratia asistentului AI a fost salvata cu succes.' : 'AI assistant configuration saved successfully.');
          } else {
            showAlert('danger', `Error: ${res.error}`);
          }
        })
        .catch(console.error);
    } else {
      showAlert('success', lang === 'ro' ? 'Configuratia asistentului AI a fost salvata.' : 'AI assistant configuration saved.');
    }
  };

  const handleSaveEmagConfig = (e: FormEvent) => {
    e.preventDefault();
    if (window.api && window.api.saveSettings) {
      window.api.saveSettings('emag_api_config', {
        username: emagUsername,
        password: emagPassword,
        url: emagApiUrl
      })
        .then((res: any) => {
          if (res.success) {
            showAlert('success', lang === 'ro' ? 'Setarile API eMAG Partner au fost salvate cu succes.' : 'eMAG Partner API settings saved successfully.');
          } else {
            showAlert('danger', `Error: ${res.error}`);
          }
        })
        .catch(console.error);
    }
  };

  const handleTestEmagConnection = () => {
    setTestingEmag(true);
    if (window.api && window.api.testEmagConnection) {
      window.api.testEmagConnection({
        username: emagUsername,
        password: emagPassword,
        url: emagApiUrl
      })
        .then((res: any) => {
          setTestingEmag(false);
          if (res.success) {
            showAlert('success', lang === 'ro' ? `Conexiune eMAG Partner reusita! Mod: ${res.mode.toUpperCase()}` : `eMAG Partner connection successful! Mode: ${res.mode.toUpperCase()}`);
          } else {
            showAlert('danger', `Error: ${res.error}`);
          }
        })
        .catch((err) => {
          setTestingEmag(false);
          showAlert('danger', `Error: ${err.message}`);
        });
    }
  };

  const handleOpenLogs = () => {
    if (window.api && window.api.openLogsFolder) {
      window.api.openLogsFolder()
        .then((res: any) => {
          if (!res.success) {
            showAlert('danger', `Error: ${res.error}`);
          }
        })
        .catch(console.error);
    }
  };

  const handleBackup = () => {
    if (window.api && window.api.showSaveDialog && window.api.backupDatabase) {
      const options = {
        title: lang === 'ro' ? 'Salveaza copia de siguranta a bazei de date' : 'Save database backup file',
        defaultPath: 'ai_emag_assistant_backup.db',
        filters: [{ name: 'SQLite Database', extensions: ['db'] }]
      };
      
      window.api.showSaveDialog(options)
        .then((res: any) => {
          if (res.filePath) {
            window.api.backupDatabase(res.filePath)
              .then((backupRes: any) => {
                if (backupRes.success) {
                  showAlert('success', lang === 'ro' ? 'Backup-ul bazei de date a fost salvat cu succes.' : 'Database backup created successfully.');
                } else {
                  showAlert('danger', `Error: ${backupRes.error}`);
                }
              })
              .catch(console.error);
          }
        })
        .catch(console.error);
    }
  };

  const handleRestore = () => {
    const confirmMsg = lang === 'ro' 
      ? 'Atentie! Restaurarea bazei de date va suprascrie datele actuale din catalog si portofoliu. Sigur doriti sa continuati?'
      : 'Warning! Restoring the database will overwrite your current catalog and portfolio data. Are you sure you want to proceed?';
    
    if (confirm(confirmMsg)) {
      if (window.api && window.api.showOpenDialog && window.api.restoreDatabase) {
        const options = {
          title: lang === 'ro' ? 'Selecteaza fisierul backup pentru restaurare' : 'Select backup file to restore',
          filters: [{ name: 'SQLite Database', extensions: ['db'] }],
          properties: ['openFile']
        };

        window.api.showOpenDialog(options)
          .then((res: any) => {
            if (res.filePaths && res.filePaths.length > 0) {
              window.api.restoreDatabase(res.filePaths[0])
                .then((restoreRes: any) => {
                  if (restoreRes.success) {
                    showAlert('success', lang === 'ro' ? 'Baza de date a fost restaurata cu succes. Reporneste aplicatia pentru siguranta.' : 'Database restored successfully. Please restart the app.');
                    loadSettings();
                  } else {
                    showAlert('danger', `Error: ${restoreRes.error}`);
                  }
                })
                .catch(console.error);
            }
          })
          .catch(console.error);
      }
    }
  };

  if (loading) {
    return <div className="loading-state">{lang === 'ro' ? 'Se incarca setarile...' : 'Loading settings...'}</div>;
  }

  return (
    <div className="page-settings fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.navSettings}</h2>
          <p className="page-subtitle">{lang === 'ro' ? 'Personalizeaza ponderile scorurilor, comisioanele platformei eMAG si conexiunea API.' : 'Customize scoring weights, eMAG marketplace commissions, and API integration settings.'}</p>
        </div>
      </div>

      {alertMsg && (
        <div className={`alert alert-${alertMsg.type} mt-1 mb-1 animated-alert`}>
          <span>{alertMsg.text}</span>
        </div>
      )}

      <div className="settings-grid">
        {/* Ponderi Scorul de Oportunitate */}
        <div className="settings-card">
          <h3>⚖️ {t.setWeightsTitle}</h3>
          <p className="card-desc">{t.setWeightsDesc}</p>
          
          <form onSubmit={handleSaveWeights} className="settings-form">
            <div className="setting-control-group">
              <label>{t.setWeightsProfit}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={Math.round(weights.profitability * 100)} 
                  onChange={(e) => setWeights({ ...weights, profitability: parseFloat(e.target.value || '0') / 100 })}
                  min="0" max="100"
                />
                <span>%</span>
              </div>
            </div>

            <div className="setting-control-group">
              <label>{t.setWeightsDemand}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={Math.round(weights.demand * 100)} 
                  onChange={(e) => setWeights({ ...weights, demand: parseFloat(e.target.value || '0') / 100 })}
                  min="0" max="100"
                />
                <span>%</span>
              </div>
            </div>

            <div className="setting-control-group">
              <label>{t.setWeightsComp}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={Math.round(weights.competition * 100)} 
                  onChange={(e) => setWeights({ ...weights, competition: parseFloat(e.target.value || '0') / 100 })}
                  min="0" max="100"
                />
                <span>%</span>
              </div>
            </div>

            <div className="setting-control-group">
              <label>{t.setWeightsMarket}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={Math.round(weights.marketOpportunity * 100)} 
                  onChange={(e) => setWeights({ ...weights, marketOpportunity: parseFloat(e.target.value || '0') / 100 })}
                  min="0" max="100"
                />
                <span>%</span>
              </div>
            </div>

            <div className="setting-control-group">
              <label>{t.setWeightsRisk}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={Math.round(weights.risk * 100)} 
                  onChange={(e) => setWeights({ ...weights, risk: parseFloat(e.target.value || '0') / 100 })}
                  min="0" max="100"
                />
                <span>%</span>
              </div>
            </div>

            <button type="submit" className="primary-btn mt-1 hover-glow-btn">
              <Save size={16} /> {t.btnSaveWeights}
            </button>
          </form>
        </div>

        {/* Comisioane eMAG pe Categorie */}
        <div className="settings-card">
          <h3>📊 {t.setCommTitle}</h3>
          <p className="card-desc">{t.setCommDesc}</p>
          
          <div className="commissions-table-box">
            <table className="comm-table">
              <thead>
                <tr>
                  <th>{t.setCommColCat}</th>
                  <th style={{ width: '120px' }}>{t.setCommColVal}</th>
                  <th style={{ width: '60px' }}>{t.setCommColAct}</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(commissions).map((cat) => (
                  <tr key={cat}>
                    <td><strong>{cat}</strong></td>
                    <td>
                      <input 
                        type="number" 
                        value={commissions[cat]} 
                        onChange={(e) => setCommissions({ ...commissions, [cat]: parseFloat(e.target.value || '0') })}
                        className="table-input"
                        min="0" max="100" step="0.1"
                      />
                    </td>
                    <td>
                      {cat !== 'Default' ? (
                        <button className="text-danger-btn" onClick={() => handleRemoveCategoryCommission(cat)}>
                          {lang === 'ro' ? 'Sterge' : 'Delete'}
                        </button>
                      ) : <span>—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="add-comm-row" style={{ marginTop: '10px' }}>
              <input 
                type="text" 
                placeholder={t.setCommNewCatPlace}
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="add-input"
              />
              <input 
                type="number" 
                value={newCommValue}
                onChange={(e) => setNewCommValue(parseFloat(e.target.value || '0'))}
                className="add-input-val"
                min="0" max="100"
              />
              <button className="secondary-btn" onClick={handleAddCategoryCommission}>
                {lang === 'ro' ? 'Adauga' : 'Add'}
              </button>
            </div>
            
            <button className="primary-btn mt-1 w-full hover-glow-btn" onClick={handleSaveCommissions}>
              <Save size={16} /> {t.btnSaveComm}
            </button>
          </div>
        </div>

        {/* Configurare Asistent AI */}
        <div className="settings-card">
          <h3><Sparkles size={18} className="text-blue" /> {t.setAiTitle}</h3>
          <p className="card-desc">{t.setAiDesc}</p>
          
          <form onSubmit={handleSaveAiConfig} className="settings-form">
            <div className="setting-control-group">
              <label>{t.setAiProvider}</label>
              <select 
                value={aiProvider}
                onChange={(e) => {
                  setAiProvider(e.target.value);
                  if (e.target.value === 'gemini') setAiModel('gemini-2.5-flash');
                  else if (e.target.value === 'openai') setAiModel('gpt-4o');
                  else if (e.target.value === 'claude') setAiModel('claude-3-5-sonnet-20241022');
                  else if (e.target.value === 'ollama') setAiModel('llama3');
                  else setAiModel('mock-model');
                }}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              >
                <option value="mock">{lang === 'ro' ? 'Mock / Demo (Fara cheie API)' : 'Mock / Demo (No API Key)'}</option>
                <option value="gemini">Google Gemini</option>
                <option value="openai">OpenAI ChatGPT</option>
                <option value="claude">Anthropic Claude</option>
                <option value="ollama">Ollama (Local / Offline)</option>
              </select>
            </div>

            {aiProvider !== 'mock' && aiProvider !== 'ollama' && (
              <div className="setting-control-group">
                <label>{t.setAiKey}</label>
                <input 
                  type="password"
                  placeholder={lang === 'ro' ? "Introdu cheia ta API..." : "Enter your API Key..."}
                  value={aiApiKey}
                  onChange={(e) => setAiApiKey(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
            )}

            {aiProvider === 'ollama' && (
              <div className="setting-control-group">
                <label>{t.setAiEndpoint}</label>
                <input 
                  type="text"
                  placeholder="http://localhost:11434"
                  value={aiEndpoint}
                  onChange={(e) => setAiEndpoint(e.target.value)}
                  style={{ width: '100%', padding: '10px' }}
                />
              </div>
            )}

            {aiProvider !== 'mock' && (
              <div className="setting-control-group">
                <label>{t.setAiModel}</label>
                {aiProvider === 'gemini' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <select
                      value={aiModel}
                      onChange={(e) => setAiModel(e.target.value)}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
                    >
                      <option value="gemini-2.5-flash">gemini-2.5-flash (Gratuit / Recomandat - Ultra Rapid)</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash (Gratuit - Rapid Standard)</option>
                      <option value="gemini-1.5-pro">gemini-1.5-pro (Gratuit - Raționament Avansat)</option>
                    </select>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {lang === 'ro' ? '💡 Obține cheia API gratuită de pe aistudio.google.com' : '💡 Get your free API key at aistudio.google.com'}
                    </span>
                  </div>
                ) : (
                  <input 
                    type="text"
                    placeholder={lang === 'ro' ? "Numele exact al modelului..." : "Exact model name..."}
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    style={{ width: '100%', padding: '10px' }}
                  />
                )}
              </div>
            )}

            <button type="submit" className="primary-btn mt-1 hover-glow-btn">
              <Save size={16} /> {t.btnSaveAi}
            </button>
          </form>
        </div>

        {/* Personalizare Interfață & Animații */}
        <div className="settings-card">
          <h3>🎨 {lang === 'ro' ? 'Personalizare & Animații' : 'UI Themes & Animations'}</h3>
          <p className="card-desc">
            {lang === 'ro' ? 'Alege culoarea de accent, intensitatea animațiilor și densitatea afișării.' : 'Choose accent color, animation intensity, and screen data density.'}
          </p>
          
          <div className="settings-form">
            <div className="setting-control-group">
              <label>{lang === 'ro' ? 'Culoare Accent Interfață' : 'UI Accent Color'}</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                <button 
                  type="button" 
                  onClick={() => handleAccentChange('emerald')}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: accent === 'emerald' ? '2px solid #fff' : '1px solid var(--border-color)', background: '#10b981', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  🟢 Emerald
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAccentChange('blue')}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: accent === 'blue' ? '2px solid #fff' : '1px solid var(--border-color)', background: '#3b82f6', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  💙 Blue
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAccentChange('purple')}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: accent === 'purple' ? '2px solid #fff' : '1px solid var(--border-color)', background: '#8b5cf6', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  💜 Purple
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAccentChange('gold')}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: accent === 'gold' ? '2px solid #fff' : '1px solid var(--border-color)', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  💛 Gold
                </button>
                <button 
                  type="button" 
                  onClick={() => handleAccentChange('crimson')}
                  style={{ padding: '6px 12px', borderRadius: '6px', border: accent === 'crimson' ? '2px solid #fff' : '1px solid var(--border-color)', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '0.85rem' }}
                >
                  ❤️ Crimson
                </button>
              </div>
            </div>

            <div className="setting-control-group mt-1">
              <label>{lang === 'ro' ? 'Intensitate Animații' : 'Animation Intensity'}</label>
              <select 
                value={animMode} 
                onChange={(e) => handleAnimChange(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              >
                <option value="ultra">{lang === 'ro' ? '⚡ Ultra Dinamic (Glow 60fps & Hover Scale)' : '⚡ Ultra Dynamic (60fps Glow & Scale)'}</option>
                <option value="smooth">{lang === 'ro' ? '🌊 Netezire Standard (Smooth Standard)' : '🌊 Smooth Standard'}</option>
                <option value="minimal">{lang === 'ro' ? '🚀 Rapid / Performanță Maximă (Minimal Motion)' : '🚀 Fast / High Performance (Minimal Motion)'}</option>
              </select>
            </div>

            <div className="setting-control-group mt-1">
              <label>{lang === 'ro' ? 'Densitate Date & Layout' : 'UI Data Density'}</label>
              <select 
                value={density} 
                onChange={(e) => handleDensityChange(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              >
                <option value="normal">{lang === 'ro' ? '📐 Spațios / Modern (Spacious)' : '📐 Spacious & Modern'}</option>
                <option value="compact">{lang === 'ro' ? '📊 Compact (Afișează mai multe rânduri)' : '📊 Compact (Shows more data rows)'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Configurare eMAG Marketplace API */}
        <div className="settings-card">
          <h3>🏪 {t.setEmagTitle}</h3>
          <p className="card-desc">{t.setEmagDesc}</p>
          
          <form onSubmit={handleSaveEmagConfig} className="settings-form">
            <div className="setting-control-group">
              <label>{t.setEmagUrl}</label>
              <input 
                type="text"
                value={emagApiUrl}
                onChange={(e) => setEmagApiUrl(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="setting-control-group">
              <label>{t.setEmagUser}</label>
              <input 
                type="text"
                placeholder="ex: user_api@partner"
                value={emagUsername}
                onChange={(e) => setEmagUsername(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="setting-control-group">
              <label>{t.setEmagPass}</label>
              <input 
                type="password"
                placeholder={lang === 'ro' ? "Parola API..." : "API Password..."}
                value={emagPassword}
                onChange={(e) => setEmagPassword(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-dark)', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
              <button type="submit" className="primary-btn hover-glow-btn" style={{ flex: 1 }}>
                <Save size={16} /> {t.btnSaveEmag}
              </button>
              <button 
                type="button" 
                className="secondary-btn" 
                style={{ flex: 1, display: 'inline-flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}
                onClick={handleTestEmagConnection}
                disabled={testingEmag}
              >
                {testingEmag ? (lang === 'ro' ? 'Se testeaza...' : 'Testing...') : t.btnTestEmag}
              </button>
            </div>
          </form>
        </div>

        {/* Database Management & Logs */}
        <div className="settings-card full-width">
          <h3><Database size={18} /> {t.setDbTitle}</h3>
          <p className="card-desc">{t.setDbDesc}</p>
          
          <div className="maintenance-actions-row">
            <div className="action-box">
              <h5>{t.setDbBackupTitle}</h5>
              <p>{t.setDbBackupDesc}</p>
              <button className="secondary-btn" onClick={handleBackup}>
                <Database size={16} /> {t.btnDbBackup}
              </button>
            </div>

            <div className="action-box">
              <h5>{t.setDbRestoreTitle}</h5>
              <p>{t.setDbRestoreDesc}</p>
              <button className="secondary-btn btn-danger-border" onClick={handleRestore}>
                <ShieldAlert size={16} /> {t.btnDbRestore}
              </button>
            </div>

            <div className="action-box">
              <h5>{t.setDbLogsTitle}</h5>
              <p>{t.setDbLogsDesc}</p>
              <button className="secondary-btn" onClick={handleOpenLogs}>
                <FolderOpen size={16} /> {t.btnDbLogs}
              </button>
            </div>
          </div>
        </div>

        {/* Update Logs / Changelog */}
        <div className="settings-card full-width mt-2">
          <h3>📜 {t.changelogTitle}</h3>
          <p className="card-desc">{t.changelogDesc}</p>
          
          <div className="changelog-timeline" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
            {/* v1.7.3 */}
            {/* v1.7.4 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid #10b981', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#10b981' }}>
                  {lang === 'ro' 
                    ? 'v1.7.4 – Suport Bilingv Complet (RO/EN) & Minor Bug-Fixes' 
                    : 'v1.7.4 – Full Bilingual Support (RO/EN) & Minor Bug-Fixes'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>11 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Suport Bilingv Complet (Română / Engleză):</strong> Traducere 100% integrată pe toate paginile, taburile, formularele și panourile de analiză.</li>
                    <li><strong>Corecție Verificare Logică Limbă Activă (isRo):</strong> Eliminarea cazurilor în care versiunea română se afișa când comutatorul era setat pe Engleză.</li>
                    <li><strong>Minor Bug-Fixes & Ajustări Interfață:</strong> Corecții la afișarea meniurilor dropdown și vizibilitate îmbunătățită a badge-urilor.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Full Bilingual Support (Romanian / English):</strong> 100% full translation across all pages, forms, and analysis sidebars.</li>
                    <li><strong>Language Logic Check Bug-Fix (isRo):</strong> Resolved issue where Romanian text was shown when English mode was active.</li>
                    <li><strong>Minor Bug-Fixes & UI Adjustments:</strong> Improved dropdown select option styling and enhanced badge visibility.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.7.3 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#3b82f6' }}>
                  {lang === 'ro' 
                    ? 'v1.7.3 – Remediere Contrast Dark Mode & Sincronizare Dinamică GitHub fără Cache' 
                    : 'v1.7.3 – Dark Mode Select Contrast Fix & Real-Time Cacheless GitHub Sync'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>10 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Remediere Contrast Meniuri Derulante (Select Options):</strong> S-a forțat stilul color-scheme: dark și background-color pe opțiunile meniurilor derulante, eliminând complet textul alb pe fundal alb pe Windows.</li>
                    <li><strong>Sincronizare Dinamică în Timp Real fără Cache:</strong> Adăugat filtru automat Cache-Buster (?t=timestamp) pe versiunea de GitHub pentru citirea instantanee a modificărilor.</li>
                    <li><strong>Sistem de Actualizare Automată (Check for Updates):</strong> Posibilitatea de a verifica și instala actualizările aplicației direct dintr-un singur click.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Select Option Contrast Fix:</strong> Forced color-scheme: dark and custom background styles on select option dropdown items.</li>
                    <li><strong>Real-Time Cacheless GitHub Sync:</strong> Added automatic cache-buster timestamp query parameters to GitHub manifest checks.</li>
                    <li><strong>1-Click Auto-Update System:</strong> Easily check and install application updates directly with a single click.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.7.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#3b82f6' }}>
                  {lang === 'ro' 
                    ? 'v1.7.0 – Sistem Auto-Update într-un Click & Protecție Eroare 503 AI' 
                    : 'v1.7.0 – 1-Click Auto-Update System & AI 503 Protection'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>10 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Sistem de Actualizare Automată (Check for Updates):</strong> Posibilitatea de a verifica și instala actualizările aplicației direct dintr-un singur click.</li>
                    <li><strong>Protecție Automată Eroare 503 AI:</strong> Sistem inteligent cu reîncercări automate (Exponential Backoff) la erori de server Google Gemini API.</li>
                    <li><strong>Filtru de Relevanță Contextuală Strictă:</strong> Eliminarea automată a produselor irelevante de casă la căutările din categoria Auto.</li>
                    <li><strong>Comparare Directă 🟢 Furnizor & 🔴 eMAG:</strong> Butoane side-by-side pe fiecare card de produs cu link-uri de căutare garantate pe eMAG.</li>
                  </>
                ) : (
                  <>
                    <li><strong>1-Click Auto-Update System:</strong> Check and install application updates directly with a single click.</li>
                    <li><strong>Automatic AI 503 Error Retry:</strong> Integrated exponential backoff retries for Google Gemini server overloads.</li>
                    <li><strong>Strict Context Relevance Filter:</strong> Filters out non-car home products when searching for auto accessories.</li>
                    <li><strong>Direct Side-by-Side Links:</strong> Color-coded 🟢 Supplier and 🔴 eMAG search buttons.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.6.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid #3b82f6', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#3b82f6' }}>
                  {lang === 'ro' 
                    ? 'v1.6.0 – Selector Versiuni Gemini & Persistență Dublă Setări' 
                    : 'v1.6.0 – Gemini Version Selector & Dual Persistence Settings'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>10 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Selector Versiuni AI Google Gemini:</strong> Selector drop-down pentru modelele gemini-2.5-flash (Recomandat Ultra-Rapid), gemini-1.5-flash și gemini-1.5-pro în Setări.</li>
                    <li><strong>Persistență Dublă Setări (SQLite + LocalStorage):</strong> Salvarea sincronizată a cheilor API și configurărilor AI.</li>
                    <li><strong>Comanda "Mai Multe Te Rog":</strong> Asistentul AI recunoaște comanda conversatională de aducere suplimentară de produse B2B din chat.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Google Gemini Version Selector:</strong> Dropdown selector for gemini-2.5-flash, gemini-1.5-flash, and gemini-1.5-pro.</li>
                    <li><strong>Dual Persistence System:</strong> Synchronized API keys and AI settings across SQLite and LocalStorage.</li>
                    <li><strong>Interactive "More Products" Command:</strong> AI Assistant recognizes commands to fetch additional B2B sourcing batches.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.5.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid #8b5cf6', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'ro' 
                    ? 'v1.5.0 – Vânătoare Live Online B2B pe Scală Mare & Ordonare Ieftin Primul' 
                    : 'v1.5.0 – Large Scale Live B2B Online Search & Cheapest First Sorting'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>09 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Vânătoare Live Online B2B:</strong> Scanare în timp real pe site-urile furnizorilor en-gros (Maxy B2B, VERK Wholesale, EANY Dropship) cu ordonare <em>Cheapest First</em>.</li>
                    <li><strong>Filtrare după Buget & Marjă:</strong> Filtrare pe Buget Maxim Achiziție (RON/EUR), Preț Maxim Unitat și Scor Oportunitate.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Large Scale Live B2B Online Search:</strong> Real-time parsing across wholesale B2B suppliers (Maxy, Verk, Eany) with instant eMAG price comparisons.</li>
                    <li><strong>Budget & Margin Filtering:</strong> Filter products by Maximum Total Budget, Maximum Unit Cost, Category, and Opportunity Score.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.4.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid #f59e0b', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'ro' 
                    ? 'v1.4.0 – Manual Oficial de Utilizare PDF (10 Capitole Complexe)' 
                    : 'v1.4.0 – Official PDF User Manual (10 Detailed Chapters)'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>09 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Manual Oficial de Utilizare PDF:</strong> Ghid tehnic complet pe 10 capitole în format PDF A4 descarcabil direct din aplicație.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Official PDF User Manual:</strong> Comprehensive 10-chapter printable A4 technical guide downloadable directly within the app.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.3.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'ro' 
                    ? 'v1.3.0 – Interfață Bilingvă RO/EN & Personalizare Culori UI' 
                    : 'v1.3.0 – Bilingual RO/EN Interface & UI Theme Personalization'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>09 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Interfață Bilingvă (Română / Engleză):</strong> Comutare instantanee a limbii din header și panoul de activare a licenței.</li>
                    <li><strong>Engine de Personalizare Culori:</strong> 5 teme de culori de accent UI (Smarald, Cian, Violet, Chihlimbar, Albastru Cyber).</li>
                  </>
                ) : (
                  <>
                    <li><strong>Bilingual Interface (Romanian / English):</strong> Instant language switching via header and activation panel.</li>
                    <li><strong>Theme Personalization Engine:</strong> 5 UI accent color themes (Emerald, Cyber, Purple, Amber, Crimson).</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.2.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'ro'
                    ? 'v1.2.0 – Asistent AI Chat RAG & Inspectare Cod SQL'
                    : 'v1.2.0 – AI RAG Chat Assistant & SQL Query Inspection'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>09 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Asistent AI Chat RAG:</strong> Chat inteligent ce traduce automat întrebările din limbaj natural în SQL și rulează interogările pe SQLite.</li>
                    <li><strong>Consolă de Transparență SQL:</strong> Buton dedicat <code>&gt;_ Vezi interogare SQLite rulată</code> sub răspunsurile AI-ului.</li>
                  </>
                ) : (
                  <>
                    <li><strong>AI RAG Chat Assistant:</strong> Natural language chat translating stock queries into live SQLite SQL queries.</li>
                    <li><strong>SQL Transparency Console:</strong> Collapsible <code>&gt;_ View SQLite query run</code> button under AI responses.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.1.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'ro'
                    ? 'v1.1.0 – Scor de Oportunitate AI (0-100) & Analiză Concurență'
                    : 'v1.1.0 – AI Opportunity Score (0-100) & Competition Analysis'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>09 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Scor de Oportunitate (0 - 100):</strong> Calcularea automată a potențialului de profit și atribuirea verdictelor clare (CUMPĂRĂ, FOARTE BUN, RISC MEDIU, NU MERITĂ).</li>
                  </>
                ) : (
                  <>
                    <li><strong>Opportunity Score (0 - 100):</strong> Automated profit potential calculation assigning clear verdicts.</li>
                  </>
                )}
              </ul>
            </div>

            {/* v1.0.0 */}
            <div className="changelog-item" style={{ borderLeft: '3px solid var(--border-color)', paddingLeft: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h5 style={{ margin: 0, fontSize: '14px', fontWeight: '700' }}>
                  {lang === 'ro' ? 'v1.0.0 – Versiunea de Bază (Enterprise MVP)' : 'v1.0.0 – Base Enterprise MVP Release'}
                </h5>
                <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>08 August 2026</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                {lang === 'ro' ? (
                  <>
                    <li><strong>Bază de Date SQLite Locala Privată:</strong> Configurare nativă cu <code>node:sqlite</code> pentru persistență offline completă a catalogului și portofoliului.</li>
                    <li><strong>Simulator Financiar eMAG:</strong> Calculul exact al marjei nete, comisionului pe categorie, TVA și costurilor logistice.</li>
                  </>
                ) : (
                  <>
                    <li><strong>Private Native SQLite Database:</strong> Native <code>node:sqlite</code> database configuration for complete offline catalog persistence.</li>
                    <li><strong>eMAG Financial Calculator:</strong> Precise net margin calculation accounting for category commissions, VAT, and shipping logistics.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
          
          {/* Licență & Activare NoSense 2026 */}
          <div className="settings-card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lang === 'ro' ? 'Licență NoSense 2026' : 'NoSense 2026 License'}
                    <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      ACTIVATĂ
                    </span>
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {lang === 'ro' ? 'Aplicația este activată complet cu cheie Enterprise validă. Apasă pentru dezactivare și re-introducere cod.' : 'App is fully activated with valid Enterprise key. Click to deactivate and prompt for key.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={async () => {
                  if ((window as any).api && (window as any).api.deactivateApp) {
                    await (window as any).api.deactivateApp();
                  }
                  localStorage.removeItem('app_activated');
                  window.location.reload();
                }}
                className="btn btn-secondary"
                style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', cursor: 'pointer' }}
              >
                {lang === 'ro' ? '🔑 Resetează / Solicită Licență Nouă' : '🔑 Reset / Prompt License Key'}
              </button>
            </div>
          </div>

          {/* Centrul de Actualizări Sistem (Update Center) */}
          <div className="settings-card" style={{ marginTop: '20px', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.9) 100%)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                  <RefreshCw className="w-6 h-6" />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {lang === 'ro' ? 'Centrul de Actualizări Sistem' : 'System Update Center'}
                    <span style={{ fontSize: '10px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '12px', fontWeight: '700' }}>
                      v1.7.5
                    </span>
                  </h4>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    {lang === 'ro' ? 'Verifică disponibilitatea unei noi versiuni și instalează actualizările într-un singur click.' : 'Check for new version availability and install updates in 1 click.'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUpdateModalOpen(true)}
                className="btn btn-primary"
                style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', borderRadius: '10px', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)', border: 'none', cursor: 'pointer' }}
              >
                <RefreshCw className="w-4 h-4" />
                {lang === 'ro' ? '🔍 Verifică Actualizări Acum' : '🔍 Check for Updates Now'}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '25px', paddingTop: '15px', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: '12px', color: 'var(--text-secondary)' }}>
            {t.copyrightLabel} © {lang === 'ro' ? 'Toate drepturile rezervate.' : 'All rights reserved.'}
          </div>
        </div>
      </div>

      <UpdateModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
      />
    </div>
  );
}
