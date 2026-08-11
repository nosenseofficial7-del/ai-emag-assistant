import { useState, useEffect } from 'react';
import { Sparkles, Cpu, ShieldCheck, Zap } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  lang?: string;
}

export default function SplashScreen({ onFinish, lang = 'ro' }: SplashScreenProps) {
  const isRo = lang === 'ro';
  const [progress, setProgress] = useState(0);
  const [versionText, setVersionText] = useState(lang === 'ro' ? 'Versiunea 1.7.7 Enterprise' : 'Version 1.7.7 Enterprise');
  const [statusText, setStatusText] = useState(
    isRo ? 'Initalizare Baza de date SQLite locala...' : 'Initializing local SQLite database...'
  );
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if ((window as any).api && (window as any).api.checkForUpdates) {
      (window as any).api.checkForUpdates()
        .then((res: any) => {
          if (res) {
            const v = res.latestVersion || res.currentVersion || '1.7.6';
            setVersionText(`v${v} • Enterprise Edition`);
          }
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    const steps = [
      { 
        pct: 20, 
        msg: isRo ? 'Scanare conectori B2B (Maxy, Verk, Eany)...' : 'Scanning B2B connectors (Maxy, Verk, Eany)...' 
      },
      { 
        pct: 40, 
        msg: isRo ? 'Verificare cheie activare licenta NoSense 2026...' : 'Authenticating NoSense 2026 license key...' 
      },
      { 
        pct: 65, 
        msg: isRo ? 'Verificare modul cercetare eMAG Marketplace...' : 'Checking eMAG Marketplace research module...' 
      },
      { 
        pct: 85, 
        msg: isRo ? 'Incarcare motor Asistent AI & Interfata...' : 'Preparing AI Assistant engine & UI...' 
      },
      { 
        pct: 100, 
        msg: isRo ? 'Gata! Se deschide aplicatia...' : 'Ready! Launching application...' 
      }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + 1;
        if (currentStep < steps.length && next >= steps[currentStep].pct) {
          setStatusText(steps[currentStep].msg);
          currentStep++;
        }

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              onFinish();
            }, 400); // match CSS fade-out duration
          }, 300);
          return 100;
        }
        return next;
      });
    }, 75);

    return () => clearInterval(interval);
  }, [isRo, onFinish]);

  return (
    <div 
      className={`splash-overlay ${isFadingOut ? 'splash-fade-out' : ''}`}
      onClick={onFinish}
      style={{ cursor: 'pointer' }}
    >
      <div className="splash-card">
        {/* Animated Cyber Ring Spinner */}
        <div className="splash-spinner-wrapper">
          <div className="spinner-ring outer-ring"></div>
          <div className="spinner-ring inner-ring"></div>
          <div className="splash-icon-center">
            <Cpu size={32} className="splash-icon-glow" />
          </div>
        </div>

        <h1 className="splash-title">
          AI eMAG <span className="splash-title-highlight">Assistant</span>
        </h1>
        <span style={{ fontSize: '13px', fontWeight: '800', color: '#60a5fa', letterSpacing: '1px' }}>
          {versionText}
        </span>

        {/* Progress Bar Container */}
        <div className="splash-progress-container">
          <div 
            className="splash-progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        {/* Status Text & Percentage */}
        <div className="splash-status-row">
          <span className="splash-status-text">{statusText}</span>
          <span className="splash-status-pct">{progress}%</span>
        </div>

        {/* Footer badges */}
        <div className="splash-footer-badges">
          <span className="splash-badge"><ShieldCheck size={13} /> SQLite Local DB</span>
          <span className="splash-badge"><Zap size={13} /> Live Sourcing</span>
          <span className="splash-badge"><Sparkles size={13} /> NoSense 2026</span>
        </div>
      </div>
    </div>
  );
}
