import { useState, useEffect } from 'react';
import { Key, ShieldAlert, Loader2, Globe } from 'lucide-react';
import { translations } from '../locales/translations';

interface ActivationProps {
  onActivated: () => void;
}

export default function Activation({ onActivated }: ActivationProps) {
  const [lang, setLang] = useState<'ro' | 'en'>('ro');
  const [keyInput, setKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('app_lang');
    if (stored === 'en') setLang('en');
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'ro' ? 'en' : 'ro';
    setLang(next);
    localStorage.setItem('app_lang', next);
    // Dispatch a global event so that other components can listen if needed
    window.dispatchEvent(new Event('language-change'));
  };

  const t = translations[lang];

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    
    // Auto-hyphenate XXXX-XXXX-XXXX-XXXX
    const raw = value.replace(/-/g, '');
    if (raw.length > 16) return;
    
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.substring(i, i + 4));
    }
    
    setKeyInput(parts.join('-'));
    setErrorMsg(null);
  };

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyInput || keyInput.length < 16) {
      setErrorMsg(t.actErrorLen);
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      if (window.api && window.api.activateApp) {
        const res = await window.api.activateApp(keyInput);
        if (res.success) {
          onActivated();
        } else {
          setErrorMsg(t.actErrorInvalid);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error connection to DB');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle, #1e1e24 0%, #0f0f12 100%)',
      color: 'var(--text-primary)',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Language toggle float top-right */}
      <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
        <button 
          onClick={toggleLanguage}
          className="theme-toggle-header-btn"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 12px', background: 'rgba(24,24,27,0.8)', border: '1px solid var(--border-color)', borderRadius: '20px' }}
        >
          <Globe size={16} className="text-blue" />
          <span style={{ fontWeight: 'bold' }}>{lang.toUpperCase()}</span>
        </button>
      </div>

      <div className="settings-card" style={{
        width: '420px',
        padding: '35px 25px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        textAlign: 'center',
        background: 'rgba(24, 24, 27, 0.85)',
        backdropFilter: 'blur(10px)'
      }}>
        {/* Glow icon */}
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f97316 0%, #3b82f6 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px auto',
          boxShadow: '0 0 20px rgba(249, 115, 22, 0.4)'
        }}>
          <Key size={32} color="#fff" />
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
          {t.actTitle}
        </h2>
        
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5', margin: '0 0 25px 0' }}>
          {t.actDesc}
        </p>

        {errorMsg && (
          <div className="alert alert-danger" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            textAlign: 'left',
            padding: '10px 12px',
            marginBottom: '20px',
            borderRadius: '6px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            background: 'rgba(239, 68, 68, 0.1)',
            color: '#fca5a5'
          }}>
            <ShieldAlert size={16} style={{ flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleActivate} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px', letterSpacing: '0.5px' }}>
              {t.actLabel}
            </label>
            <input 
              type="text"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              value={keyInput}
              onChange={handleKeyChange}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-dark)',
                color: 'var(--text-primary)',
                fontSize: '18px',
                textAlign: 'center',
                letterSpacing: '2px',
                fontWeight: 'bold',
                fontFamily: 'monospace'
              }}
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{
              padding: '12px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={16} className="spin" /> {lang === 'ro' ? 'Se valideaza...' : 'Validating...'}
              </>
            ) : (
              t.actBtn
            )}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          paddingTop: '15px',
          borderTop: '1px solid var(--border-color)',
          fontSize: '11px',
          color: 'var(--text-secondary)',
          opacity: 0.7
        }}>
          {t.copyrightLabel} © {lang === 'ro' ? 'Toate drepturile rezervate.' : 'All rights reserved.'}
        </div>
      </div>
    </div>
  );
}
