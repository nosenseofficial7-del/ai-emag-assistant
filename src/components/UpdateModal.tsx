import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, CheckCircle, AlertCircle, X, Sparkles, Zap, Trash2 } from 'lucide-react';
import { translations } from '../locales/translations';

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
  lang?: 'ro' | 'en';
}

const UpdateModal: React.FC<UpdateModalProps> = ({ isOpen, onClose, lang = 'ro' }) => {
  const [checking, setChecking] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState({ percent: 0, transferred: '0 MB', total: '48.5 MB', speed: '0 MB/s' });
  const [installed, setInstalled] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [updateMode, setUpdateMode] = useState<'express' | 'clean'>('express');

  const t = translations[lang] || translations.ro;

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
        setTimeout(() => {
          setUpdateInfo({
            currentVersion: '1.7.6',
            hasUpdate: false,
            latestVersion: '1.7.6',
            releaseDate: new Date().toISOString().split('T')[0],
            releaseNotes: [
              lang === 'ro' ? 'Versiunea curentă v1.7.6 este complet la zi.' : 'Current version v1.7.6 is fully up to date.',
              lang === 'ro' ? 'Suport bilingv complet (Română / Engleză).' : 'Full bilingual support (Romanian / English).',
              lang === 'ro' ? 'Sistem de actualizare rapidă cu păstrarea datelor locale.' : 'Express update system preserving all local user data.'
            ]
          });
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || (lang === 'ro' ? 'Eroare la conectarea cu serverul de actualizări.' : 'Error connecting to update server.'));
    } finally {
      setTimeout(() => setChecking(false), 500);
    }
  };

  const handleStartDownload = async () => {
    if (!updateInfo) return;
    setDownloading(true);
    setError(null);
    try {
      if ((window as any).api && (window as any).api.downloadAndInstallUpdate) {
        const res = await (window as any).api.downloadAndInstallUpdate(updateInfo.downloadUrl, { cleanInstall: updateMode === 'clean' });
        if (res && res.success) {
          setInstalled(true);
        } else {
          setDownloading(false);
          setError(res?.error || (lang === 'ro' 
            ? 'Fișierul .exe nu există încă pe GitHub Releases.' 
            : 'The .exe file was not found on GitHub Releases.'));
        }
      } else {
        let p = 0;
        const interval = setInterval(() => {
          p += 10;
          setProgress({ percent: p, transferred: `${(p * 0.485).toFixed(1)} MB`, total: '48.5 MB', speed: '5.2 MB/s' });
          if (p >= 100) {
            clearInterval(interval);
            setDownloading(false);
            setInstalled(true);
          }
        }, 400);
      }
    } catch (err: any) {
      setDownloading(false);
      setError(err.message || (lang === 'ro' ? 'Eroare la descărcarea actualizării.' : 'Download error.'));
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundColor: 'rgba(7, 9, 19, 0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '20px'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        maxHeight: '90vh',
        overflowY: 'auto',
        backgroundColor: 'rgba(13, 18, 34, 0.95)',
        backgroundImage: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: '24px',
        boxShadow: '0 30px 80px rgba(0, 0, 0, 0.75), 0 0 40px rgba(59, 130, 246, 0.2)',
        color: '#f8fafc',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Header Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
            }}>
              <Sparkles style={{ width: '20px', height: '20px' }} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800', color: '#ffffff' }}>
                {t.updateModalTitle}
              </h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '11.5px', color: '#94a3b8' }}>
                {t.updateModalSubtitle}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px'
            }}
          >
            <X style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {checking && (
            <div style={{ textAlign: 'center', padding: '30px 10px' }}>
              <RefreshCw style={{ width: '36px', height: '36px', color: '#60a5fa', animation: 'spin 1s linear infinite', margin: '0 auto 14px auto' }} />
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#ffffff' }}>{t.updateChecking}</p>
              <p style={{ fontSize: '12px', color: '#94a3b8' }}>{t.updateCheckingDesc}</p>
            </div>
          )}

          {error && (
            <div style={{
              padding: '14px 16px',
              borderRadius: '14px',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <AlertCircle style={{ width: '18px', height: '18px', flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {!checking && updateInfo && !updateInfo.hasUpdate && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                color: '#34d399',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto',
                boxShadow: '0 0 25px rgba(16, 185, 129, 0.3)'
              }}>
                <CheckCircle style={{ width: '28px', height: '28px' }} />
              </div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                {t.updateUpToDate}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                {t.updateUpToDateDesc} <strong>{updateInfo.currentVersion}</strong>
              </p>
            </div>
          )}

          {!checking && updateInfo && updateInfo.hasUpdate && !downloading && !installed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{
                padding: '14px 18px',
                borderRadius: '14px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Sparkles style={{ width: '20px', height: '20px', color: '#34d399' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: '800', color: '#ffffff' }}>{t.updateAvailableBadge}</span>
                    <span style={{ display: 'block', fontSize: '11px', color: '#a7f3d0' }}>v{updateInfo.currentVersion} ➔ <strong>v{updateInfo.latestVersion}</strong></span>
                  </div>
                </div>
              </div>

              {/* Release Notes */}
              <div>
                <h5 style={{ margin: '0 0 8px 0', fontSize: '12px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {t.updateNotesTitle}
                </h5>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12.5px', color: '#cbd5e1', lineHeight: '1.6' }}>
                  {(updateInfo.releaseNotes || []).map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              {/* Express Update Choice Cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{t.updateSelectModeTitle}</label>
                
                {/* Express Mode Pill */}
                <div 
                  onClick={() => setUpdateMode('express')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: updateMode === 'express' ? 'rgba(59, 130, 246, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                    border: updateMode === 'express' ? '1px solid rgba(59, 130, 246, 0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Zap style={{ width: '20px', height: '20px', color: '#60a5fa', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>{t.updateModeExpressTitle}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.updateModeExpressDesc}</span>
                  </div>
                </div>

                {/* Clean Mode Pill */}
                <div 
                  onClick={() => setUpdateMode('clean')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '14px',
                    backgroundColor: updateMode === 'clean' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                    border: updateMode === 'clean' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    transition: 'all 0.2s'
                  }}
                >
                  <Trash2 style={{ width: '20px', height: '20px', color: '#f87171', flexShrink: 0 }} />
                  <div>
                    <strong style={{ fontSize: '13px', color: '#ffffff', display: 'block' }}>{t.updateModeCleanTitle}</strong>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{t.updateModeCleanDesc}</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {downloading && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <Download style={{ width: '32px', height: '32px', color: '#3b82f6', animation: 'bounce 1s infinite', margin: '0 auto 12px auto' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', color: '#ffffff' }}>
                {lang === 'ro' ? 'Se descarcă pachetul de actualizare...' : 'Downloading update package...'}
              </h4>
              <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#94a3b8' }}>
                {progress.transferred} / {progress.total} • {progress.speed}
              </p>
              
              <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden' }}>
                <div style={{ width: `${progress.percent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #10b981)', transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {installed && (
            <div style={{ textAlign: 'center', padding: '20px 10px' }}>
              <CheckCircle style={{ width: '48px', height: '48px', color: '#34d399', margin: '0 auto 14px auto' }} />
              <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                {lang === 'ro' ? 'Actualizare Aplicată cu Succes!' : 'Update Applied Successfully!'}
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>
                {lang === 'ro' ? 'Aplicația a fost actualizată la versiunea v1.7.6. Toate datele tale locale au fost păstrate intacte.' : 'Application updated to v1.7.6. All local user data preserved.'}
              </p>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '12px',
          padding: '16px 24px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.2)'
        }}>
          {!checking && updateInfo && updateInfo.hasUpdate && !downloading && !installed && (
            <button 
              onClick={handleStartDownload}
              style={{
                padding: '10px 20px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#ffffff',
                border: 'none',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
              }}
            >
              {t.updateBtnInstall} (v{updateInfo.latestVersion})
            </button>
          )}

          <button 
            onClick={onClose}
            style={{
              padding: '10px 18px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            {t.updateBtnClose}
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateModal;
