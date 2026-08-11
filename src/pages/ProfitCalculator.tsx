import { useState, useEffect } from 'react';
import { Calculator, DollarSign, PieChart, Info } from 'lucide-react';
import type { CategoryCommissions } from '../types';

interface ProfitCalculatorProps {
  t: any;
}

export default function ProfitCalculator({ t }: ProfitCalculatorProps) {
  const isRo = t.navDashboard === 'Panou Control';

  const [priceSupplier, setPriceSupplier] = useState<number>(5000); // 50.00 lei (bani)
  const [priceSale, setPriceSale] = useState<number>(12900); // 129.00 lei (bani)
  const [vatRate, setVatRate] = useState<number>(19);
  const [commissionRate, setCommissionRate] = useState<number>(15);
  const [shippingSupplier, setShippingSupplier] = useState<number>(0);
  const [shippingClient] = useState<number>(0);
  const [packagingCost, setPackagingCost] = useState<number>(150); // 1.50 lei (bani)
  const [marketingCost, setMarketingCost] = useState<number>(0);
  const [otherCosts] = useState<number>(0);
  const [estimatedReturnRate] = useState<number>(2);
  
  const [commissions, setCommissions] = useState<CategoryCommissions>({});
  const [selectedCategory, setSelectedCategory] = useState('Default');

  useEffect(() => {
    loadCommissions();
  }, []);

  const loadCommissions = () => {
    if (window.api && window.api.getSettings) {
      window.api.getSettings('emag_commissions')
        .then((commissionsData: CategoryCommissions | null) => {
          if (commissionsData) {
            setCommissions(commissionsData);
            setCommissionRate(commissionsData['Default'] || 15);
          }
        })
        .catch(console.error);
    }
  };

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat);
    if (commissions[cat] !== undefined) {
      setCommissionRate(commissions[cat]);
    }
  };

  const getVatValueSale = () => {
    return Math.round(priceSale - (priceSale / (1 + vatRate / 100)));
  };

  const getEmagCommission = () => {
    return Math.round((priceSale * commissionRate) / 100);
  };

  const getTotalCost = () => {
    return priceSupplier + shippingSupplier + packagingCost + marketingCost + otherCosts;
  };

  const getReturnCostBuffer = () => {
    return Math.round((priceSale * estimatedReturnRate) / 100 * 0.15);
  };

  const getProfit = () => {
    const netRevenue = priceSale - getEmagCommission() - shippingClient;
    const totalCost = getTotalCost() + getReturnCostBuffer();
    return netRevenue - totalCost;
  };

  const getMargin = () => {
    if (priceSale === 0) return 0;
    return (getProfit() / priceSale) * 100;
  };

  const getRoi = () => {
    const totalCost = getTotalCost();
    if (totalCost === 0) return 0;
    return (getProfit() / totalCost) * 100;
  };

  const formatBani = (bani: number) => {
    return (bani / 100).toFixed(2) + ' RON';
  };

  const profitLei = getProfit() / 100;
  const marginVal = getMargin();
  const roiVal = getRoi();

  return (
    <div className="fade-in-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">
            <Calculator style={{ color: '#10b981', width: '26px', height: '26px' }} />
            {isRo ? 'Calculator Marjă & Unit Economics eMAG' : 'eMAG Profit & Unit Economics Calculator'}
          </h2>
          <p className="page-subtitle">
            {isRo ? 'Simulează profitul net real luând în calcul comisioanele eMAG, TVA, ambalare și logistică.' : 'Simulate net profit margins including official eMAG commissions, VAT, packaging, and logistics.'}
          </p>
        </div>
      </div>

      {/* Grid container: 2 Glass Cards Side-by-Side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* Left Card: Input Parameters */}
        <div style={{
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: 'rgba(18, 24, 41, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          gap: '18px'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <DollarSign style={{ color: '#60a5fa', width: '20px', height: '20px' }} />
            {isRo ? 'Parametri Financiar Produs' : 'Product Financial Parameters'}
          </h3>

          {/* Category Dropdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
              {isRo ? 'Categorie eMAG (Auto-Comision)' : 'eMAG Category (Auto-Commission)'}
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              style={{
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '13.5px',
                outline: 'none'
              }}
            >
              {Object.keys(commissions).map((cat) => (
                <option key={cat} value={cat} style={{ backgroundColor: '#111522', color: '#fff' }}>
                  {cat} ({commissions[cat]}%)
                </option>
              ))}
            </select>
          </div>

          {/* Dual Inputs: Price Supplier & Sale Price */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
                {isRo ? 'Preț Achiziție Furnizor (RON)' : 'Supplier Buy Price (RON)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={(priceSupplier / 100).toString()}
                onChange={(e) => setPriceSupplier(Math.round((parseFloat(e.target.value) || 0) * 100))}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  color: '#60a5fa',
                  fontSize: '15px',
                  fontWeight: '800',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>
                {isRo ? 'Preț Vânzare eMAG (incl. TVA)' : 'Selling Price eMAG (incl. VAT)'}
              </label>
              <input
                type="number"
                step="0.1"
                value={(priceSale / 100).toString()}
                onChange={(e) => setPriceSale(Math.round((parseFloat(e.target.value) || 0) * 100))}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  color: '#34d399',
                  fontSize: '15px',
                  fontWeight: '800',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Rates Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>TVA (%)</label>
              <input
                type="number"
                value={vatRate}
                onChange={(e) => setVatRate(parseFloat(e.target.value) || 0)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: '700', color: '#94a3b8' }}>{isRo ? 'Comision eMAG (%)' : 'eMAG Commission (%)'}</label>
              <input
                type="number"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#ffffff',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          {/* Operational Costs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>Transport (RON)</label>
              <input
                type="number"
                step="0.5"
                value={(shippingSupplier / 100).toString()}
                onChange={(e) => setShippingSupplier(Math.round((parseFloat(e.target.value) || 0) * 100))}
                style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>Ambalare (RON)</label>
              <input
                type="number"
                step="0.5"
                value={(packagingCost / 100).toString()}
                onChange={(e) => setPackagingCost(Math.round((parseFloat(e.target.value) || 0) * 100))}
                style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '11px', fontWeight: '700', color: '#94a3b8' }}>Marketing (RON)</label>
              <input
                type="number"
                step="0.5"
                value={(marketingCost / 100).toString()}
                onChange={(e) => setMarketingCost(Math.round((parseFloat(e.target.value) || 0) * 100))}
                style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px', outline: 'none' }}
              />
            </div>
          </div>

        </div>

        {/* Right Card: Live Unit Economics Simulation Results */}
        <div style={{
          padding: '24px',
          borderRadius: '24px',
          backgroundColor: 'rgba(18, 24, 41, 0.8)',
          backgroundImage: 'linear-gradient(145deg, rgba(255, 255, 255, 0.04) 0%, rgba(255, 255, 255, 0.01) 100%)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(16, 185, 129, 0.1)',
          backdropFilter: 'blur(20px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          gap: '20px'
        }}>
          <div>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <PieChart style={{ color: '#34d399', width: '20px', height: '20px' }} />
              {isRo ? 'Rezultat Simulare Profit Net' : 'Net Profit Simulation Results'}
            </h3>

            {/* Profit Hero Box */}
            <div style={{
              padding: '20px',
              borderRadius: '18px',
              backgroundColor: profitLei >= 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
              border: profitLei >= 0 ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)',
              textAlign: 'center',
              boxShadow: profitLei >= 0 ? '0 0 25px rgba(16, 185, 129, 0.25)' : '0 0 25px rgba(239, 68, 68, 0.25)'
            }}>
              <span style={{ fontSize: '12px', fontWeight: '800', color: profitLei >= 0 ? '#a7f3d0' : '#fca5a5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                {isRo ? 'ESTIMARE PROFIT NET PE BUCATĂ' : 'ESTIMATED NET PROFIT PER ITEM'}
              </span>
              <h2 style={{ margin: '6px 0 0 0', fontSize: '32px', fontWeight: '900', color: profitLei >= 0 ? '#34d399' : '#f87171' }}>
                {formatBani(getProfit())}
              </h2>
            </div>
          </div>

          {/* Metrics breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>{isRo ? 'Marjă Netă' : 'Net Margin'}</span>
              <strong style={{ fontSize: '20px', color: marginVal >= 25 ? '#34d399' : (marginVal >= 15 ? '#fbbf24' : '#f87171') }}>
                {marginVal.toFixed(1)}%
              </strong>
            </div>

            <div style={{ padding: '14px', borderRadius: '14px', backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8', display: 'block' }}>ROI (%)</span>
              <strong style={{ fontSize: '20px', color: roiVal >= 40 ? '#34d399' : (roiVal >= 20 ? '#fbbf24' : '#f87171') }}>
                {roiVal.toFixed(1)}%
              </strong>
            </div>
          </div>

          {/* Breakdown Items List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12.5px', color: '#cbd5e1' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Total Cost Achiziție + Ambalare:</span>
              <strong>{formatBani(getTotalCost())}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Comision eMAG ({commissionRate}%):</span>
              <strong>{formatBani(getEmagCommission())}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>TVA Colectat eMAG:</span>
              <strong>{formatBani(getVatValueSale())}</strong>
            </div>
          </div>

          {/* ROI Recommendation Footer Callout */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '12px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            color: '#60a5fa',
            fontSize: '11.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Info style={{ width: '16px', height: '16px', flexShrink: 0 }} />
            <span>
              {isRo 
                ? 'Sfat eMAG: Vânzătorii cu experiență țintesc produse cu ROI peste 35% pentru acoperirea retururilor.'
                : 'eMAG Tip: Experienced sellers target products with ROI over 35% to cover potential return risks.'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
