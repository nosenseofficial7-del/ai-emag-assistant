import { useEffect, useState } from 'react';
import { 
  FileSearch, 
  TrendingUp, 
  Percent, 
  Award, 
  Users, 
  DollarSign, 
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Building2
} from 'lucide-react';
import type { DashboardStats } from '../types';

interface DashboardProps {
  setCurrentPage: (page: string) => void;
  setSelectedProductId: (id: string) => void;
  t: any;
}

export default function Dashboard({ setCurrentPage, setSelectedProductId, t }: DashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    if (window.api && window.api.getDbStats) {
      window.api.getDbStats()
        .then((data) => {
          setStats(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Failed to load dashboard stats:', err);
          setLoading(false);
        });
    }
  };

  const formatBani = (bani: number | undefined) => {
    if (bani === undefined) return '0.00 RON';
    return (bani / 100).toLocaleString('ro-RO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' RON';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
        <Sparkles style={{ width: '40px', height: '40px', color: '#60a5fa', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
        <p style={{ fontSize: '15px', fontWeight: '700', color: '#f1f5f9' }}>{t.aiThinking || 'Loading stats...'}</p>
      </div>
    );
  }

  const isRo = t.navDashboard === 'Panou Control';

  return (
    <div className="fade-in-page" style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Dashboard Top Header */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">
            <Sparkles style={{ color: '#60a5fa', width: '26px', height: '26px' }} />
            {t.dashTitle}
          </h2>
          <p className="page-subtitle">{t.dashSubtitle}</p>
        </div>

        <button 
          className="primary-btn" 
          onClick={() => setCurrentPage('import')}
        >
          <Zap style={{ width: '16px', height: '16px' }} />
          {t.btnImportCatalog}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: '18px'
      }}>
        
        {/* Card 1: Total Catalog Products */}
        <div 
          onClick={() => setCurrentPage('products')}
          style={{
            padding: '22px 20px',
            borderRadius: '20px',
            backgroundColor: 'rgba(18, 24, 41, 0.75)',
            backgroundImage: 'linear-gradient(145deg, rgba(59, 130, 246, 0.12) 0%, rgba(18, 24, 41, 0.6) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(16px)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.1)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {t.statTotalProducts}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#60a5fa'
            }}>
              <FileSearch style={{ width: '18px', height: '18px' }} />
            </div>
          </div>

          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {stats?.productsCount || 0}
          </div>

          <div style={{ fontSize: '11.5px', color: '#60a5fa', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck style={{ width: '13px', height: '13px' }} />
            {isRo ? 'stocate local în SQLite' : 'stored locally in SQLite'}
          </div>
        </div>

        {/* Card 2: Excellent Opportunities */}
        <div 
          onClick={() => setCurrentPage('products')}
          style={{
            padding: '22px 20px',
            borderRadius: '20px',
            backgroundColor: 'rgba(18, 24, 41, 0.75)',
            backgroundImage: 'linear-gradient(145deg, rgba(16, 185, 129, 0.12) 0%, rgba(18, 24, 41, 0.6) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            backdropFilter: 'blur(16px)',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(16, 185, 129, 0.1)';
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {t.statGoodOpp}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.2)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399'
            }}>
              <Award style={{ width: '18px', height: '18px' }} />
            </div>
          </div>

          <div style={{ fontSize: '32px', fontWeight: '900', color: '#34d399', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {stats?.goodOpportunities || 0}
          </div>

          <div style={{ fontSize: '11.5px', color: '#34d399', fontWeight: '600' }}>
            {isRo ? 'Verdict "CUMPĂRĂ" / "FOARTE BUN"' : 'Verdict "BUY" / "VERY GOOD"'}
          </div>
        </div>

        {/* Card 3: Average Portfolio Margin */}
        <div style={{
          padding: '22px 20px',
          borderRadius: '20px',
          backgroundColor: 'rgba(18, 24, 41, 0.75)',
          backgroundImage: 'linear-gradient(145deg, rgba(168, 85, 247, 0.12) 0%, rgba(18, 24, 41, 0.6) 100%)',
          border: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(168, 85, 247, 0.1)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {t.statAvgMargin}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(168, 85, 247, 0.2)',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#c084fc'
            }}>
              <Percent style={{ width: '18px', height: '18px' }} />
            </div>
          </div>

          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {stats?.marjaMedie || 0}%
          </div>

          <div style={{ fontSize: '11.5px', color: '#c084fc', fontWeight: '600' }}>
            {isRo ? 'pe baza stocurilor cumpărate' : 'based on purchased stock'}
          </div>
        </div>

        {/* Card 4: Average Portfolio ROI */}
        <div style={{
          padding: '22px 20px',
          borderRadius: '20px',
          backgroundColor: 'rgba(18, 24, 41, 0.75)',
          backgroundImage: 'linear-gradient(145deg, rgba(6, 182, 212, 0.12) 0%, rgba(18, 24, 41, 0.6) 100%)',
          border: '1px solid rgba(6, 182, 212, 0.3)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(6, 182, 212, 0.1)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {t.statAvgRoi}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(6, 182, 212, 0.2)',
              border: '1px solid rgba(6, 182, 212, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#22d3ee'
            }}>
              <TrendingUp style={{ width: '18px', height: '18px' }} />
            </div>
          </div>

          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {stats?.roiMediu || 0}%
          </div>

          <div style={{ fontSize: '11.5px', color: '#22d3ee', fontWeight: '600' }}>
            Return on Investment
          </div>
        </div>

        {/* Card 5: Low Competition */}
        <div style={{
          padding: '22px 20px',
          borderRadius: '20px',
          backgroundColor: 'rgba(18, 24, 41, 0.75)',
          backgroundImage: 'linear-gradient(145deg, rgba(244, 63, 94, 0.12) 0%, rgba(18, 24, 41, 0.6) 100%)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          boxShadow: '0 15px 35px rgba(0, 0, 0, 0.4), 0 0 20px rgba(244, 63, 94, 0.1)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              {t.statLowComp}
            </span>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '12px',
              backgroundColor: 'rgba(244, 63, 94, 0.2)',
              border: '1px solid rgba(244, 63, 94, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185'
            }}>
              <Users style={{ width: '18px', height: '18px' }} />
            </div>
          </div>

          <div style={{ fontSize: '32px', fontWeight: '900', color: '#ffffff', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            {stats?.lowCompetition || 0}
          </div>

          <div style={{ fontSize: '11.5px', color: '#fb7185', fontWeight: '600' }}>
            {isRo ? 'Competiție "MICA" / "V. MICA"' : 'Competition rated "LOW" / "V. LOW"'}
          </div>
        </div>

      </div>

      {/* Hero Stat: Estimated Potential Profit */}
      <div style={{
        padding: '24px 28px',
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(16, 185, 129, 0.15) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(245, 158, 11, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '20px',
        backdropFilter: 'blur(16px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #10b981 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.5)'
          }}>
            <DollarSign style={{ width: '28px', height: '28px' }} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {t.statPotentialProfit}
            </span>
            <div style={{ fontSize: '34px', fontWeight: '900', color: '#34d399', letterSpacing: '-0.5px', margin: '2px 0' }}>
              {formatBani(stats?.profitPotential)}
            </div>
            <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1' }}>
              {isRo ? 'Profit potențial total calculat din oportunitățile active de achiziție B2B.' : 'Estimated total potential profit derived from active B2B opportunities.'}
            </p>
          </div>
        </div>

        <button 
          onClick={() => setCurrentPage('portfolio')}
          style={{
            padding: '12px 24px',
            borderRadius: '14px',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: '800',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.16)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)')}
        >
          <span>{t.navPortfolio}</span>
          <ArrowRight style={{ width: '16px', height: '16px', color: '#34d399' }} />
        </button>
      </div>

      {/* Two Grid Panels Section */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Top 5 Opportunities List */}
        <div style={{
          padding: '24px',
          borderRadius: '20px',
          backgroundColor: 'rgba(18, 24, 41, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Award style={{ width: '18px', height: '18px', color: '#34d399' }} />
              {t.statTopOpp}
            </h3>
            <button 
              onClick={() => setCurrentPage('products')}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isRo ? 'Vezi toate' : 'View all'} <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          {(!stats?.topOpportunities || stats.topOpportunities.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: '#64748b', fontSize: '13px' }}>
              {t.statNoResearch}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {stats.topOpportunities.slice(0, 5).map((prod) => (
                <div 
                  key={prod.id}
                  onClick={() => {
                    setSelectedProductId(prod.id);
                    setCurrentPage('details');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                    e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                  }}
                >
                  <div>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#ffffff' }}>{prod.name}</h5>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>{prod.supplier_name || 'Maxy'} • Score: {prod.opportunity_score || 0}/100</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(16, 185, 129, 0.2)',
                      color: '#34d399',
                      fontWeight: '800',
                      fontSize: '11px'
                    }}>
                      {prod.verdict || 'BUY'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recurring Watchlist Alerts */}
        <div style={{
          padding: '24px',
          borderRadius: '20px',
          backgroundColor: 'rgba(18, 24, 41, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(16px)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
              {isRo ? 'Alerte Watchlist Recurente' : 'Recurring Watchlist Alerts'}
            </h3>
            <button 
              onClick={() => setCurrentPage('watchlist')}
              style={{ background: 'none', border: 'none', color: '#60a5fa', fontSize: '12.5px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              {isRo ? 'Deschide Watchlist' : 'Open Watchlist'} <ArrowRight style={{ width: '14px', height: '14px' }} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              fontSize: '12.5px',
              color: '#a7f3d0'
            }}>
              <Award style={{ width: '16px', height: '16px', color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff' }}>{isRo ? 'Marjă Ridicată:' : 'High Margin:'}</strong> {isRo ? 'Produsul LED Lampă Birou are o marjă estimată de 50%.' : 'The item LED Desk Lamp has an estimated margin of 50%.'}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              fontSize: '12.5px',
              color: '#93c5fd'
            }}>
              <Building2 style={{ width: '16px', height: '16px', color: '#60a5fa', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff' }}>{isRo ? 'Stoc Stabil Furnizor:' : 'Stable Supplier Stock:'}</strong> {isRo ? 'Aspirator Auto HFPA are 450 unități în stoc la MAXY.' : 'Item Car Vacuum has 450 units in stock at MAXY.'}
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: '12px',
              backgroundColor: 'rgba(245, 158, 11, 0.08)',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              fontSize: '12.5px',
              color: '#fde68a'
            }}>
              <AlertTriangle style={{ width: '16px', height: '16px', color: '#f59e0b', flexShrink: 0, marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff' }}>{isRo ? 'Competiție Activă:' : 'Active Competition:'}</strong> {isRo ? '2 noi competitori identificați pe eMAG în categoria Auto.' : '2 new competitors identified on eMAG in Auto category.'}
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
