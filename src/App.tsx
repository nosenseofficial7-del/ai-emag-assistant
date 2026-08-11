import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

// Pagini React
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ProductHunter from './pages/ProductHunter';
import Suppliers from './pages/Suppliers';
import EmagResearch from './pages/EmagResearch';
import Portfolio from './pages/Portfolio';
import Watchlist from './pages/Watchlist';
import AiAssistant from './pages/AiAssistant';
import ImportWizard from './pages/ImportWizard';
import ProfitCalculator from './pages/ProfitCalculator';
import Settings from './pages/Settings';
import Changelog from './pages/Changelog';
import Activation from './pages/Activation';
import SplashScreen from './components/SplashScreen';
import PageTransitionLoader from './components/PageTransitionLoader';

import { translations } from './locales/translations';

import './App.css';

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [currentPage, setCurrentPageRaw] = useState('dashboard');
  const [pageNavLoading, setPageNavLoading] = useState(false);
  const [targetPageName, setTargetPageName] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const setCurrentPage = (page: string) => {
    if (page === currentPage || pageNavLoading) return;
    setTargetPageName(page);
    setPageNavLoading(true);
    setTimeout(() => {
      setCurrentPageRaw(page);
      setPageNavLoading(false);
    }, 2200);
  };
  
  // Temă (Dark implicit, conform cerinței)
  const [darkMode, setDarkMode] = useState(true);
  
  // Status conexiune internet (Offline / Online)
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Activare licență
  const [isActivated, setIsActivated] = useState<boolean | null>(null);

  // Limba (Bilingual RO/EN)
  const [lang, setLang] = useState<'ro' | 'en'>('ro');

  useEffect(() => {
    // Încarcă limba salvată
    const storedLang = localStorage.getItem('app_lang');
    if (storedLang === 'en' || storedLang === 'ro') {
      setLang(storedLang);
    }

    // Verifică starea activării la pornire
    if (window.api && window.api.checkActivation) {
      window.api.checkActivation()
        .then((res: any) => {
          setIsActivated(res.activated);
        })
        .catch((err) => {
          console.error('Eroare verificare activare:', err);
          setIsActivated(false);
        });
    } else {
      setIsActivated(true);
    }

    // Ascultă schimbările de limbă (de ex. de pe ecranul de activare)
    const handleLangChange = () => {
      const stored = localStorage.getItem('app_lang');
      if (stored === 'en' || stored === 'ro') {
        setLang(stored);
      }
    };
    window.addEventListener('language-change', handleLangChange);
    return () => window.removeEventListener('language-change', handleLangChange);
  }, []);

  const toggleLanguage = () => {
    const next = lang === 'ro' ? 'en' : 'ro';
    setLang(next);
    localStorage.setItem('app_lang', next);
  };

  const t = translations[lang];

  useEffect(() => {
    // Setează tema inițială pe elementul document
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    document.documentElement.setAttribute('data-accent', localStorage.getItem('app_accent') || 'emerald');
    document.documentElement.setAttribute('data-anim', localStorage.getItem('app_anim') || 'ultra');
    document.documentElement.setAttribute('data-density', localStorage.getItem('app_density') || 'normal');

    const handleCustomizationChange = () => {
      document.documentElement.setAttribute('data-accent', localStorage.getItem('app_accent') || 'emerald');
      document.documentElement.setAttribute('data-anim', localStorage.getItem('app_anim') || 'ultra');
      document.documentElement.setAttribute('data-density', localStorage.getItem('app_density') || 'normal');
    };
    window.addEventListener('customization-change', handleCustomizationChange);

    // Ascultă evenimentele de conexiune rețea
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('customization-change', handleCustomizationChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleGlobalSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Render pagină activă
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setSelectedProductId={setSelectedProductId} 
            t={t}
          />
        );
      case 'products':
        return (
          <Products 
            setCurrentPage={setCurrentPage} 
            setSelectedProductId={setSelectedProductId} 
            searchQuery={searchQuery}
            t={t}
          />
        );
      case 'product-details':
        return (
          <ProductDetails 
            productId={selectedProductId} 
            setCurrentPage={setCurrentPage} 
            t={t}
          />
        );
      case 'hunter':
      case 'product-hunter':
        return (
          <ProductHunter 
            setCurrentPage={setCurrentPage} 
            setSelectedProductId={setSelectedProductId} 
            t={t}
          />
        );
      case 'suppliers':
        return <Suppliers t={t} />;
      case 'emag':
      case 'emag-research':
        return <EmagResearch t={t} />;
      case 'portfolio':
        return (
          <Portfolio 
            setCurrentPage={setCurrentPage} 
            setSelectedProductId={setSelectedProductId} 
            t={t}
          />
        );
      case 'watchlist':
        return (
          <Watchlist 
            setCurrentPage={setCurrentPage} 
            setSelectedProductId={setSelectedProductId} 
            t={t}
          />
        );
      case 'ai':
      case 'ai-assistant':
        return <AiAssistant t={t} />;
      case 'import':
      case 'import-wizard':
        return <ImportWizard setCurrentPage={setCurrentPage} t={t} />;
      case 'calculator':
      case 'profit-calculator':
        return <ProfitCalculator t={t} />;
      case 'settings':
        return <Settings t={t} lang={lang} />;
      case 'changelog':
        return <Changelog t={t} lang={lang} />;
      default:
        return (
          <Dashboard 
            setCurrentPage={setCurrentPage} 
            setSelectedProductId={setSelectedProductId}
            t={t}
          />
        );
    }
  };

  // Failsafe timer to ensure splash screen never blocks UI
  useEffect(() => {
    const failsafe = setTimeout(() => {
      setShowSplash(false);
    }, 10000);
    return () => clearTimeout(failsafe);
  }, []);

  return (
    <>
      {showSplash && (
        <SplashScreen onFinish={() => setShowSplash(false)} lang={lang} />
      )}

      {pageNavLoading && (
        <PageTransitionLoader targetPage={targetPageName} lang={lang} />
      )}

      {isActivated === null ? (
        <div style={{
          width: '100vw',
          height: '100vh',
          background: '#0f0f12',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontFamily: 'sans-serif'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div className="spin" style={{
              width: '40px',
              height: '40px',
              border: '4px solid #27272a',
              borderTopColor: '#f97316',
              borderRadius: '50%',
              margin: '0 auto 15px auto'
            }}></div>
            <p style={{ fontSize: '13px', color: '#a1a1aa' }}>
              {lang === 'ro' ? 'Se initializeaza licența...' : 'Initializing license...'}
            </p>
          </div>
        </div>
      ) : isActivated === false ? (
        <Activation onActivated={() => setIsActivated(true)} />
      ) : (
        <div className={`app-container ${darkMode ? 'theme-dark' : 'theme-light'}`}>
          <Sidebar 
            currentPage={currentPage} 
            setCurrentPage={setCurrentPage} 
            isOnline={isOnline}
            t={t}
          />
          
          <div className="main-layout-wrapper">
            <Header 
              darkMode={darkMode} 
              toggleTheme={toggleTheme} 
              onSearch={handleGlobalSearch}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              lang={lang}
              toggleLanguage={toggleLanguage}
            />
            
            <main className="content-area">
              {renderPage()}
            </main>
          </div>
        </div>
      )}
    </>
  );
}

export default App;
