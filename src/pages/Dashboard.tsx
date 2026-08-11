import { useEffect, useState } from 'react';
import { 
  FileSearch, 
  TrendingUp, 
  Percent, 
  Award, 
  Users, 
  DollarSign, 
  AlertTriangle,
  ArrowRight
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
    return <div className="loading-state">{t.aiThinking || 'Loading stats...'}</div>;
  }

  const isRo = t.navDashboard === 'Panou Control';

  return (
    <div className="page-dashboard fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{t.dashTitle}</h2>
          <p className="page-subtitle">{t.dashSubtitle}</p>
        </div>
        <button className="primary-btn hover-glow-btn" onClick={() => setCurrentPage('import')}>
          {t.btnImportCatalog}
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="kpi-grid">
        <div className="kpi-card dashboard-stat-card">
          <div className="kpi-header">
            <span className="kpi-label">{t.statTotalProducts}</span>
            <FileSearch size={20} className="kpi-icon text-blue" />
          </div>
          <div className="kpi-value">{stats?.productsCount || 0}</div>
          <div className="kpi-footer">{isRo ? 'stocate local in SQLite' : 'stored locally in SQLite'}</div>
        </div>

        <div className="kpi-card dashboard-stat-card">
          <div className="kpi-header">
            <span className="kpi-label">{t.statGoodOpp}</span>
            <Award size={20} className="kpi-icon text-green" />
          </div>
          <div className="kpi-value">{stats?.goodOpportunities || 0}</div>
          <div className="kpi-footer text-green">{isRo ? 'Verdict "CUMPARA" / "FOARTE BUN"' : 'Verdict "BUY" / "VERY GOOD"'}</div>
        </div>

        <div className="kpi-card dashboard-stat-card">
          <div className="kpi-header">
            <span className="kpi-label">{t.statAvgMargin}</span>
            <Percent size={20} className="kpi-icon text-orange" />
          </div>
          <div className="kpi-value">{stats?.marjaMedie || 0}%</div>
          <div className="kpi-footer">{isRo ? 'pe baza stocurilor cumparate' : 'based on purchased stock'}</div>
        </div>

        <div className="kpi-card dashboard-stat-card">
          <div className="kpi-header">
            <span className="kpi-label">{t.statAvgRoi}</span>
            <TrendingUp size={20} className="kpi-icon text-green" />
          </div>
          <div className="kpi-value">{stats?.roiMediu || 0}%</div>
          <div className="kpi-footer">Return on Investment</div>
        </div>

        <div className="kpi-card dashboard-stat-card">
          <div className="kpi-header">
            <span className="kpi-label">{t.statLowComp}</span>
            <Users size={20} className="kpi-icon text-green" />
          </div>
          <div className="kpi-value">{stats?.lowCompetition || 0}</div>
          <div className="kpi-footer text-green">{isRo ? 'Competitie clasata "MICA" / "F. MICA"' : 'Competition rated "LOW" / "V. LOW"'}</div>
        </div>

        <div className="kpi-card dashboard-stat-card">
          <div className="kpi-header">
            <span className="kpi-label">{t.statPotentialProfit}</span>
            <DollarSign size={20} className="kpi-icon text-green" />
          </div>
          <div className="kpi-value text-green">{formatBani(stats?.profitPotential || 0)}</div>
          <div className="kpi-footer">{isRo ? 'valoare totala estimata' : 'estimated total value'}</div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="dashboard-content-layout">
        {/* Top Opportunities */}
        <div className="dashboard-panel panel-card">
          <div className="panel-header">
            <h4>{t.statTopOpp}</h4>
            <button className="text-btn" onClick={() => setCurrentPage('products')}>
              {isRo ? 'Vezi toate' : 'View all'} <ArrowRight size={14} />
            </button>
          </div>
          <div className="panel-body">
            {stats?.topOpportunities && stats.topOpportunities.length > 0 ? (
              <div className="top-opportunities-list">
                {stats.topOpportunities.map((op, idx) => (
                  <div key={op.id} className="op-row" onClick={() => {
                    setSelectedProductId(op.id);
                    setCurrentPage('product-details');
                  }}>
                    <div className="op-rank">{idx + 1}</div>
                    <div className="op-details">
                      <span className="op-name">{op.name}</span>
                      <span className="op-meta">{op.supplier_name} • {isRo ? 'Achizitie' : 'Cost'}: {formatBani(op.price_supplier)}</span>
                    </div>
                    <div className="op-scores">
                      <span className="op-score">Opp Score: <strong>{op.opportunity_score}</strong></span>
                      <span className={`badge ${
                        op.verdict === 'CUMPĂRĂ' || op.verdict === 'CUMPARA' || op.verdict === 'BUY' ? 'badge-success' :
                        op.verdict === 'FOARTE BUN' || op.verdict === 'VERY GOOD' ? 'badge-success' :
                        op.verdict === 'RISC MEDIU' || op.verdict === 'MEDIUM RISK' ? 'badge-warning' : 'badge-danger'
                      }`}>{op.verdict}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>{isRo ? 'Nu exista suficiente date analizate. Importa un fisier de produse si ruleaza analiza.' : 'No researched data available. Please import a product catalog and run analysis.'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Watchlist Quick Alerts */}
        <div className="dashboard-panel panel-card">
          <div className="panel-header">
            <h4>{isRo ? 'Alerte Watchlist recurente' : 'Recurring Watchlist Alerts'}</h4>
            <button className="text-btn" onClick={() => setCurrentPage('watchlist')}>
              {isRo ? 'Deschide Watchlist' : 'Open Watchlist'} <ArrowRight size={14} />
            </button>
          </div>
          <div className="panel-body">
            <div className="alerts-list">
              <div className="dashboard-alert-item alert-success-item">
                <AlertTriangle size={16} className="alert-icon text-green" />
                <div className="alert-text">
                  {isRo ? (
                    <><strong>Marja ridicata:</strong> Produsul <em>Lampa LED monitor</em> din Watchlist are acum marja estimata de 58%.</>
                  ) : (
                    <><strong>High margin:</strong> The item <em>LED Monitor Lamp</em> in your Watchlist now has an estimated margin of 58%.</>
                  )}
                </div>
              </div>
              <div className="dashboard-alert-item alert-info-item">
                <AlertTriangle size={16} className="alert-icon text-blue" />
                <div className="alert-text">
                  {isRo ? (
                    <><strong>Stoc furnizor stabil:</strong> <em>Aspirator auto HEPA</em> are 450 unitati in stoc la MAXY.</>
                  ) : (
                    <><strong>Stable supplier stock:</strong> <em>HEPA Car Vacuum</em> has 450 units in stock at MAXY.</>
                  )}
                </div>
              </div>
              <div className="dashboard-alert-item alert-warning-item">
                <AlertTriangle size={16} className="alert-icon text-orange" />
                <div className="alert-text">
                  {isRo ? (
                    <><strong>Competitie activa:</strong> 2 noi competitori identificati pentru produsele similare din categoria <em>Auto</em>.</>
                  ) : (
                    <><strong>Active competition:</strong> 2 new competitors identified for similar products in <em>Auto</em> category.</>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
