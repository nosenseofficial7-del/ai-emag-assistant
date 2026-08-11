import { useState, useEffect } from 'react';
import { Cpu } from 'lucide-react';

interface PageTransitionLoaderProps {
  targetPage: string;
  lang?: string;
}

export default function PageTransitionLoader({ targetPage, lang = 'ro' }: PageTransitionLoaderProps) {
  const isRo = lang === 'ro';
  const [progress, setProgress] = useState(0);

  const pageNamesRo: Record<string, string> = {
    'dashboard': 'Tablou de Bord',
    'products': 'Produse & Analiză',
    'hunter': 'Product Hunter',
    'product-hunter': 'Product Hunter',
    'suppliers': 'Furnizori B2B',
    'emag': 'Cercetare eMAG',
    'emag-research': 'Cercetare eMAG',
    'portfolio': 'Produsele Mele',
    'watchlist': 'Watchlist',
    'ai': 'AI Assistant',
    'ai-assistant': 'AI Assistant',
    'import': 'Import Excel/CSV',
    'import-wizard': 'Import Excel/CSV',
    'calculator': 'Calculator Profit',
    'profit-calculator': 'Calculator Profit',
    'settings': 'Setări',
    'changelog': 'Jurnal Schimbări (Changelog)'
  };

  const pageNamesEn: Record<string, string> = {
    'dashboard': 'Dashboard',
    'products': 'Products & Analysis',
    'hunter': 'Product Hunter',
    'product-hunter': 'Product Hunter',
    'suppliers': 'B2B Suppliers',
    'emag': 'eMAG Research',
    'emag-research': 'eMAG Research',
    'portfolio': 'My Portfolio',
    'watchlist': 'Watchlist',
    'ai': 'AI Assistant',
    'ai-assistant': 'AI Assistant',
    'import': 'Excel/CSV Import',
    'import-wizard': 'Excel/CSV Import',
    'calculator': 'Profit Calculator',
    'profit-calculator': 'Profit Calculator',
    'settings': 'Settings',
    'changelog': 'Changelog'
  };

  const pageName = isRo 
    ? (pageNamesRo[targetPage] || targetPage) 
    : (pageNamesEn[targetPage] || targetPage);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5; // 20 steps * 100ms = 2000ms (2 sec + transitions = 2.5s)
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-transition-overlay">
      <div className="page-transition-card">
        <div className="splash-spinner-wrapper" style={{ width: '60px', height: '60px', marginBottom: '14px' }}>
          <div className="spinner-ring outer-ring"></div>
          <div className="spinner-ring inner-ring"></div>
          <div className="splash-icon-center">
            <Cpu size={24} className="splash-icon-glow" />
          </div>
        </div>

        <h4 style={{ margin: '0 0 4px 0', fontSize: '15px', color: '#ffffff', fontWeight: '700' }}>
          {isRo ? `Navigare spre ${pageName}...` : `Loading ${pageName}...`}
        </h4>
        <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#94a3b8' }}>
          {isRo ? 'Pregătire date și interfață...' : 'Preparing view & data...'}
        </p>

        <div className="splash-progress-container" style={{ height: '5px', width: '220px' }}>
          <div 
            className="splash-progress-fill" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
