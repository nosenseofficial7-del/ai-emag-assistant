import { 
  LayoutDashboard, 
  Target, 
  Search, 
  Building2, 
  Globe, 
  ShoppingBag, 
  Eye, 
  MessageSquare, 
  Upload, 
  Settings, 
  Calculator,
  History,
  Wifi,
  WifiOff
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOnline: boolean;
  t: any;
}

export default function Sidebar({ currentPage, setCurrentPage, isOnline, t }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', name: t.navDashboard, icon: LayoutDashboard },
    { id: 'products', name: t.navProducts, icon: Search },
    { id: 'hunter', name: t.navHunter, icon: Target },
    { id: 'suppliers', name: t.navSuppliers, icon: Building2 },
    { id: 'emag', name: t.navEmag, icon: Globe },
    { id: 'portfolio', name: t.navPortfolio, icon: ShoppingBag },
    { id: 'watchlist', name: t.navWatchlist, icon: Eye },
    { id: 'ai', name: t.navAi, icon: MessageSquare },
    { id: 'import', name: t.navImport, icon: Upload },
    { id: 'calculator', name: t.navCalculator, icon: Calculator },
    { id: 'settings', name: t.navSettings, icon: Settings },
    { id: 'changelog', name: t.navChangelog || 'Changelog', icon: History },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1>AI eMAG Assistant</h1>
        <div className="connection-status">
          {isOnline ? (
            <span className="status-indicator online">
              <Wifi size={14} /> {t.statusOnline}
            </span>
          ) : (
            <span className="status-indicator offline">
              <WifiOff size={14} /> {t.statusOffline}
            </span>
          )}
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isFaza2 = ['hunter', 'emag', 'ai'].includes(item.id);
          
          return (
            <button
              key={item.id}
              className={`nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setCurrentPage(item.id)}
            >
              <Icon size={18} />
              <span>{item.name}</span>
              {isFaza2 && <span className="faza2-tag">AI / F2</span>}
            </button>
          );
        })}
      </nav>
      
      <div className="sidebar-footer">
        <p className="version">{t.versionLabel}</p>
        <p className="footer-text">{t.storageLabel}</p>
        <p className="copyright" style={{ fontSize: '11px', marginTop: '6px', opacity: 0.6 }}>{t.copyrightLabel}</p>
      </div>
    </aside>
  );
}
