import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Globe, RefreshCw, UserCheck } from 'lucide-react';
import UpdateModal from './UpdateModal';

interface HeaderProps {
  darkMode: boolean;
  toggleTheme: () => void;
  onSearch: (query: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  lang: 'ro' | 'en';
  toggleLanguage: () => void;
}

export default function Header({ 
  darkMode, toggleTheme, onSearch, currentPage, setCurrentPage, lang, toggleLanguage 
}: HeaderProps) {
  const [searchInput, setSearchInput] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [versionBadge, setVersionBadge] = useState('v1.7.5');
  const [hasNewUpdate, setHasNewUpdate] = useState(false);

  useEffect(() => {
    if ((window as any).api && (window as any).api.checkForUpdates) {
      (window as any).api.checkForUpdates()
        .then((res: any) => {
          if (res) {
            if (res.hasUpdate) {
              setVersionBadge(`v${res.latestVersion} Nou!`);
              setHasNewUpdate(true);
            } else {
              setVersionBadge(`v${res.currentVersion || '1.7.5'}`);
              setHasNewUpdate(false);
            }
          }
        })
        .catch(console.error);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSearch(searchInput.trim());
      if (currentPage !== 'products') {
        setCurrentPage('products');
      }
    }
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onSearch('');
  };

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 32px',
      backgroundColor: 'rgba(11, 15, 26, 0.8)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      gap: '20px',
      zIndex: 90
    }}>
      {/* Search Input Field */}
      <div style={{ flex: 1, maxWidth: '520px' }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <button type="submit" style={{
            position: 'absolute',
            left: '14px',
            background: 'none',
            border: 'none',
            color: '#60a5fa',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search style={{ width: '18px', height: '18px' }} />
          </button>
          
          <input
            type="text"
            placeholder={lang === 'ro' ? "Căutare globală EAN, SKU, denumire, furnizor..." : "Global search by EAN, SKU, title, supplier..."}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (e.target.value === '') {
                onSearch('');
              }
            }}
            style={{
              width: '100%',
              padding: '11px 40px 11px 44px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '500',
              outline: 'none',
              transition: 'all 0.25s',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
            }}
            onFocus={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
              e.target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.25)';
            }}
            onBlur={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)';
            }}
          />

          {searchInput && (
            <button 
              type="button" 
              onClick={handleClearSearch}
              style={{
                position: 'absolute',
                right: '14px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                fontSize: '18px',
                cursor: 'pointer'
              }}
            >
              ×
            </button>
          )}
        </form>
      </div>

      {/* Header Actions Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        
        {/* System Update Button */}
        <button 
          onClick={() => setIsUpdateModalOpen(true)} 
          title={lang === 'ro' ? "Centru Actualizări Sistem" : "System Update Center"}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '12px',
            background: hasNewUpdate ? 'rgba(16, 185, 129, 0.18)' : 'rgba(59, 130, 246, 0.12)', 
            border: hasNewUpdate ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(59, 130, 246, 0.3)', 
            color: hasNewUpdate ? '#34d399' : '#60a5fa',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-1px)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
        >
          <RefreshCw style={{ width: '14px', height: '14px', animation: 'spin 4s linear infinite' }} />
          <span>{versionBadge}</span>
        </button>

        {/* Language Toggle */}
        <button 
          onClick={toggleLanguage} 
          title={lang === 'ro' ? "Comutare în Engleză" : "Switch to Romanian"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#f8fafc',
            fontWeight: '800',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
        >
          <Globe style={{ width: '15px', height: '15px', color: '#60a5fa' }} />
          <span>{lang.toUpperCase()}</span>
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme} 
          title="Comutare Temă"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#cbd5e1',
            fontWeight: '600',
            fontSize: '12px',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.12)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)')}
        >
          {darkMode ? <Sun style={{ width: '15px', height: '15px', color: '#fbbf24' }} /> : <Moon style={{ width: '15px', height: '15px', color: '#818cf8' }} />}
          <span>{darkMode ? (lang === 'ro' ? 'Luminos' : 'Light') : (lang === 'ro' ? 'Întunecat' : 'Dark')}</span>
        </button>
        
        {/* Seller Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 14px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '800'
        }}>
          <UserCheck style={{ width: '15px', height: '15px', color: '#60a5fa' }} />
          <span>Seller eMAG</span>
        </div>

      </div>

      <UpdateModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
        lang={lang}
      />
    </header>
  );
}
