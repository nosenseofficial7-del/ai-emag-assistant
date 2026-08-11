import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, CheckCircle, AlertCircle, X, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';

interface UpdateInfo {
  currentVersion: string;
  hasUpdate: boolean;
  latestVersion: string;
  releaseDate?: string;
  releaseNotes?: string[];
  downloadUrl?: string;
}

interface UpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoCheck?: boolean;
}

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose }) => {
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, transferred: '0 MB', total: '48.5 MB', speed: '0 MB/s' });
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleCheckUpdates();
    }
  }, [isOpen]);

  useEffect(() => {
    if ((window as any).api && (window as any).api.onUpdateProgress) {
      const cleanup = (window as any).api.onUpdateProgress((data: any) => {
        const percent = data.percent || 0;
        const transferred = (data.transferredBytes / (1024 * 1024)).toFixed(1) + ' MB';
        const total = (data.totalBytes / (1024 * 1024)).toFixed(1) + ' MB';
        setProgress({ percent, transferred, total, speed: data.speed || '4.2 MB/s' });
      });
      return cleanup;
    }
  }, []);

  const handleCheckUpdates = async () => {
    setChecking(true);
    setError(null);
    try {
      if ((window as any).api && (window as any).api.checkForUpdates) {
        const info = await (window as any).api.checkForUpdates();
        setUpdateInfo(info);
      } else {
        // Fallback demo modal dacă rulăm în browser web
        setTimeout(() => {
          setUpdateInfo({
            currentVersion: '1.6.5',
            hasUpdate: false,
            latestVersion: '1.6.5',
            releaseDate: new Date().toISOString().split('T')[0],
            releaseNotes: [
              'Versiunea curentă v1.6.5 este complet la zi.',
              'Protecție automată la erori de server 503 Google Gemini.',
              'Filtru de relevanță contextuală strictă pentru produse auto.',
              'Comparare directă 🔴 Vezi eMAG fără erori 404.'
            ]
          });
        }, 1000);
      }
    } catch (err: any) {
      setError(err.message || 'Eroare la conectarea cu serverul de actualizări.');
    } finally {
      setTimeout(() => setChecking(false), 600);
    }
  };

  const handleStartDownload = async () => {
    if (!updateInfo) return;
    setDownloading(true);
    setError(null);
    try {
      if ((window as any).api && (window as any).api.downloadAndInstallUpdate) {
        const res = await (window as any).api.downloadAndInstallUpdate(updateInfo.downloadUrl);
        if (res && res.success) {
          setInstalled(true);
        } else {
          setDownloading(false);
          setError(res?.error || 'Fișierul .exe nu există încă pe GitHub Releases. Urcează fișierul pe GitHub conform Pasului 3.');
        }
      } else {
        // Simulation mode pentru previzualizare UI
        let p = 0;
        const interval = setInterval(() => {
          p += 10;
          const currentMb = (p * 0.485).toFixed(1);
          setProgress({ percent: p, transferred: `${currentMb} MB`, total: '48.5 MB', speed: '4.2 MB/s' });
          if (p >= 100) {
            clearInterval(interval);
            setInstalled(true);
          }
        }, 250);
      }
    } catch (err: any) {
      setDownloading(false);
      setError(err.message || 'Eroare la descărcarea actualizării de pe GitHub.');
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(5, 7, 15, 0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      padding: '20px',
      animation: 'fadeIn 0.25s ease-out'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        backgroundColor: '#111522',
        backgroundImage: 'linear-gradient(145deg, #121726 0%, #1a2035 100%)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: '20px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(59, 130, 246, 0.15)',
        overflow: 'hidden',
        color: '#f8fafc',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}>
        
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              padding: '10px',
              borderRadius: '14px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              color: '#60a5fa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Sparkles style={{ width: '22px', height: '22px' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.2px' }}>
                Centrul de Actualizări Sistem
              </h3>
              <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                Verificare & Instalare Versiuni Noi AI eMAG Assistant
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#cbd5e1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)')}
          >
            <X style={{ width: '18px', height: '18px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px' }}>
          
          {/* Status Loading */}
          {checking && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <RefreshCw style={{ width: '42px', height: '42px', color: '#60a5fa', margin: '0 auto 16px auto', animation: 'spin 1s linear infinite' }} />
              <p style={{ margin: 0, fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>
                Se verifică disponibilitatea unei noi versiuni...
              </p>
              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                Conectare securizată la serverul de release GitHub nosenseofficial7-del
              </p>
            </div>
          )}

          {/* Up To Date State */}
          {!checking && updateInfo && !updateInfo.hasUpdate && !downloading && !installed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '16px 20px',
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399'
              }}>
                <ShieldCheck style={{ width: '32px', height: '32px', flexShrink: 0, color: '#34d399' }} />
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: '#ecfdf5' }}>
                    Aplicația ta este complet la zi!
                  </h4>
                  <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#a7f3d0' }}>
                    Folosești deja cea mai recentă versiune oficială <strong>v{updateInfo.currentVersion}</strong>.
                  </p>
                </div>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Note Versiune Curentă (v{updateInfo.currentVersion}):
                </h5>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {updateInfo.releaseNotes?.map((note, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Update Available State */}
          {!checking && updateInfo && updateInfo.hasUpdate && !downloading && !installed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                padding: '18px 20px',
                borderRadius: '16px',
                backgroundColor: 'rgba(59, 130, 246, 0.12)',
                border: '1px solid rgba(59, 130, 246, 0.35)',
                color: '#93c5fd'
              }}>
                <span style={{
                  display: 'inline-block',
                  fontSize: '10px',
                  fontWeight: '800',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  backgroundColor: 'rgba(59, 130, 246, 0.25)',
                  color: '#60a5fa',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: '1px solid rgba(59, 130, 246, 0.4)'
                }}>
                  Actualizare Nouă Disponibilă
                </span>
                <h4 style={{ margin: '10px 0 4px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                  Versiunea v{updateInfo.latestVersion} este gata de instalare!
                </h4>
                <p style={{ margin: 0, fontSize: '13px', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Versiune instalată: <strong style={{ color: '#94a3b8' }}>v{updateInfo.currentVersion}</strong>
                  <ArrowRight style={{ width: '14px', height: '14px', color: '#60a5fa' }} />
                  Versiune nouă: <strong style={{ color: '#34d399', fontSize: '14px' }}>v{updateInfo.latestVersion}</strong>
                </p>
              </div>

              <div style={{
                padding: '16px',
                borderRadius: '14px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}>
                <h5 style={{ margin: '0 0 10px 0', fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  Ce este nou în versiunea v{updateInfo.latestVersion}:
                </h5>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {updateInfo.releaseNotes?.map((note, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{note}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Downloading Progress State */}
          {downloading && !installed && (
            <div style={{ padding: '10px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Download style={{ width: '18px', height: '18px', color: '#60a5fa' }} />
                  Se descarcă pachetul de actualizare...
                </span>
                <span style={{ fontSize: '16px', fontWeight: '900', color: '#34d399', fontFamily: 'monospace' }}>
                  {progress.percent}%
                </span>
              </div>

              {/* Progress Track */}
              <div style={{
                width: '100%',
                height: '12px',
                backgroundColor: '#0b0e17',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                marginBottom: '14px'
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress.percent}%`,
                  backgroundImage: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)',
                  borderRadius: '8px',
                  transition: 'width 0.25s ease-out',
                  boxShadow: '0 0 12px rgba(16, 185, 129, 0.6)'
                }} />
              </div>

              {/* Stats Footer Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#94a3b8',
                fontFamily: 'monospace',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
                <span>Transferat: <strong>{progress.transferred}</strong> / {progress.total}</span>
                <span>Viteză: <strong style={{ color: '#60a5fa' }}>{progress.speed}</strong></span>
              </div>
            </div>
          )}

          {/* Installed / Restarting State */}
          {installed && (
            <div style={{
              textAlign: 'center',
              padding: '24px 16px',
              borderRadius: '16px',
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#ecfdf5'
            }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: '#34d399', margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                Actualizare Descărcată cu Succes!
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#a7f3d0' }}>
                Kit-ul executabil de instalare a fost lansat. Aplicația va reporni pentru a finaliza instalarea versiunii v{updateInfo?.latestVersion || '1.7.0'}.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '13px',
              marginTop: '12px'
            }}>
              <AlertCircle style={{ width: '20px', height: '20px', flexShrink: 0, color: '#f87171' }} />
              <span>{error}</span>
            </div>
          )}

        </div>

        {/* Footer Actions Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          backgroundColor: 'rgba(0, 0, 0, 0.25)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {!checking && updateInfo && !updateInfo.hasUpdate && (
            <button
              onClick={handleCheckUpdates}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#f8fafc',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} /> Reîncearcă Verificarea
            </button>
          )}

          {!checking && updateInfo && updateInfo.hasUpdate && !downloading && !installed && (
            <button
              onClick={handleStartDownload}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                backgroundImage: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: '800',
                border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s'
              }}
            >
              <Download style={{ width: '16px', height: '16px' }} /> Descarcă & Instalează Actualizarea (v{updateInfo.latestVersion})
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            {installed ? 'Închide' : (updateInfo?.hasUpdate ? 'Mai târziu' : 'Închide')}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateModal;
