import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, Globe, RefreshCw } from 'lucide-react';
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
  const [versionBadge, setVersionBadge] = useState('v1.7.4');
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
              setVersionBadge(`v${res.currentVersion || '1.7.4'}`);
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
    <header className="main-header">
      <div className="header-search-container">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <button type="submit" className="search-btn">
            <Search size={18} />
          </button>
          <input
            type="text"
            placeholder={lang === 'ro' ? "Cauta global dupa EAN, SKU, produs, furnizor..." : "Global search by EAN, SKU, product, supplier..."}
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              if (e.target.value === '') {
                onSearch('');
              }
            }}
            className="search-input"
          />
          {searchInput && (
            <button type="button" className="clear-search-btn" onClick={handleClearSearch}>
              ×
            </button>
          )}
        </form>
      </div>

      <div className="header-actions">
        {/* Check Updates Button */}
        <button 
          className="theme-toggle-header-btn" 
          onClick={() => setIsUpdateModalOpen(true)} 
          title={lang === 'ro' ? "Verifică actualizări aplicație" : "Check for application updates"}
          style={{ 
            marginRight: '8px', 
            background: hasNewUpdate ? 'rgba(16, 185, 129, 0.2)' : 'rgba(59, 130, 246, 0.12)', 
            border: hasNewUpdate ? '1px solid rgba(16, 185, 129, 0.5)' : '1px solid rgba(59, 130, 246, 0.3)', 
            color: hasNewUpdate ? '#34d399' : '#60a5fa' 
          }}
        >
          <RefreshCw size={16} className={`text-blue ${hasNewUpdate ? 'animate-spin' : 'animate-spin-hover'}`} />
          <span style={{ fontWeight: '700', fontSize: '12px' }}>{versionBadge}</span>
        </button>

        {/* Language Toggle */}
        <button 
          className="theme-toggle-header-btn" 
          onClick={toggleLanguage} 
          title={lang === 'ro' ? "Comuta in Engleza" : "Switch to Romanian"}
          style={{ marginRight: '8px' }}
        >
          <Globe size={18} className="text-blue" />
          <span style={{ fontWeight: 'bold' }}>{lang.toUpperCase()}</span>
        </button>

        {/* Theme Toggle */}
        <button className="theme-toggle-header-btn" onClick={toggleTheme} title="Comuta tema Light/Dark">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          <span>
            {lang === 'ro' 
              ? (darkMode ? 'Mod Luminos' : 'Mod Intunecat') 
              : (darkMode ? 'Light Mode' : 'Dark Mode')}
          </span>
        </button>
        
        <div className="user-profile-summary">
          <span className="user-role">Seller eMAG</span>
        </div>
      </div>

      <UpdateModal 
        isOpen={isUpdateModalOpen} 
        onClose={() => setIsUpdateModalOpen(false)} 
      />
    </header>
  );
}
