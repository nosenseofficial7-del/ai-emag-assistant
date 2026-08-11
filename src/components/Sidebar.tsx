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
  Sparkles,
  Zap
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
    <aside style={{
      width: '270px',
      backgroundColor: 'rgba(9, 13, 24, 0.92)',
      backgroundImage: 'linear-gradient(180deg, rgba(17, 24, 42, 0.9) 0%, rgba(9, 13, 24, 0.98) 100%)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      color: '#94a3b8',
      flexShrink: 0,
      zIndex: 100,
      userSelect: 'none'
    }}>
      
      {/* Brand Header */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)'
          }}>
            <Sparkles style={{ width: '22px', height: '22px' }} />
          </div>
          <div>
            <h1 style={{
              margin: 0,
              fontSize: '17px',
              fontWeight: '900',
              color: '#ffffff',
              letterSpacing: '-0.3px',
              lineHeight: '1.2'
            }}>
              AI eMAG <span style={{
                background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>Assistant</span>
            </h1>
            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              PRO SUITE v1.7.5
            </span>
          </div>
        </div>

        {/* Live Status LED Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 12px',
          borderRadius: '20px',
          backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
          border: isOnline ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(239, 68, 68, 0.3)',
          width: 'fit-content'
        }}>
          <span style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: isOnline ? '#34d399' : '#f87171',
            boxShadow: isOnline ? '0 0 10px #34d399' : '0 0 10px #f87171',
            animation: 'pulseLed 2s infinite'
          }} />
          <span style={{
            fontSize: '11px',
            fontWeight: '800',
            color: isOnline ? '#34d399' : '#f87171',
            letterSpacing: '0.5px'
          }}>
            {isOnline ? t.statusOnline : t.statusOffline}
          </span>
        </div>
      </div>
      
      {/* Menu Navigation Items */}
      <nav style={{
        flex: 1,
        padding: '16px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        overflowY: 'auto'
      }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isFaza2 = ['hunter', 'emag', 'ai'].includes(item.id);
          
          return (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                background: isActive 
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.22) 0%, rgba(139, 92, 246, 0.22) 100%)' 
                  : 'transparent',
                borderLeft: isActive ? '3px solid #60a5fa' : '3px solid transparent',
                boxShadow: isActive ? '0 4px 20px rgba(59, 130, 246, 0.15)' : 'none',
                color: isActive ? '#ffffff' : '#94a3b8',
                fontWeight: isActive ? '800' : '600',
                fontSize: '13.5px',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#ffffff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#94a3b8';
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon style={{ 
                  width: '18px', 
                  height: '18px', 
                  color: isActive ? '#60a5fa' : '#64748b',
                  filter: isActive ? 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.6))' : 'none'
                }} />
                <span>{item.name}</span>
              </div>

              {isFaza2 && (
                <span style={{
                  fontSize: '9px',
                  fontWeight: '800',
                  padding: '2px 7px',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.2)',
                  color: '#c084fc',
                  border: '1px solid rgba(168, 85, 247, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px'
                }}>
                  <Zap style={{ width: '10px', height: '10px' }} /> AI
                </span>
              )}
            </button>
          );
        })}
      </nav>
      
      {/* Footer info */}
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        fontSize: '11px',
        color: '#64748b'
      }}>
        <p style={{ margin: 0, fontWeight: '700', color: '#94a3b8' }}>{t.versionLabel}</p>
        <p style={{ margin: '2px 0 0 0' }}>{t.storageLabel}</p>
        <p style={{ margin: '4px 0 0 0', opacity: 0.6, fontSize: '10px' }}>{t.copyrightLabel}</p>
      </div>
    </aside>
  );
}
