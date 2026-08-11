import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import type { CategoryCommissions } from '../types';

interface ProfitCalculatorProps {
  t: any;
}

export default function ProfitCalculator({ t }: ProfitCalculatorProps) {
  const isRo = t.navDashboard === 'Panou Control';
  // Stari Calculator
  const [priceSupplier, setPriceSupplier] = useState<number>(5000); // 50.00 lei (bani)
  const [priceSale, setPriceSale] = useState<number>(12900); // 129.00 lei (bani)
  const [vatRate, setVatRate] = useState<number>(19); // Procent
  const [commissionRate, setCommissionRate] = useState<number>(15); // Procent
  const [shippingSupplier, setShippingSupplier] = useState<number>(0); // in bani
  const [shippingClient, setShippingClient] = useState<number>(0); // in bani
  const [packagingCost, setPackagingCost] = useState<number>(150); // 1.50 lei (bani)
  const [marketingCost, setMarketingCost] = useState<number>(0); // in bani
  const [otherCosts, setOtherCosts] = useState<number>(0); // in bani
  const [estimatedReturnRate, setEstimatedReturnRate] = useState<number>(2); // Procent
  
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

  // --- CALCULE FINANCIARE (IN BANI / INTEGER MINOR UNITS) ---
  
  // 1. TVA achizitie (pe bucata)
  const getVatValueSupplier = () => {
    return Math.round((priceSupplier * vatRate) / 100);
  };

  // 2. TVA vanzare (pe bucata) - extragem TVA din pretul brut
  const getVatValueSale = () => {
    return Math.round(priceSale - (priceSale / (1 + vatRate / 100)));
  };

  // 3. Comision eMAG (aplicat la pretul brut cu TVA)
  const getEmagCommission = () => {
    return Math.round((priceSale * commissionRate) / 100);
  };

  // 4. Costuri Logistica si Produs (pret achizitie + transport furnizor + ambalaj + marketing + alte costuri)
  const getTotalCost = () => {
    return priceSupplier + shippingSupplier + packagingCost + marketingCost + otherCosts;
  };

  // 5. Ajustare pentru rata de retur
  const getReturnCostBuffer = () => {
    // Estimam o pierdere medie din retururi (transport dus-intors + uzura) ca % din pretul de vanzare
    return Math.round((priceSale * estimatedReturnRate) / 100 * 0.15); // 15% uzura pe retur
  };

  // 6. Profit Brut Calculat
  const getProfit = () => {
    // Venit Net = Pret Vanzare - Comision eMAG - Cost Livrare Client - Cost Logistica Produs - Buffer Retururi
    const netRevenue = priceSale - getEmagCommission() - shippingClient;
    const totalCost = getTotalCost() + getReturnCostBuffer();
    return netRevenue - totalCost;
  };

  // 7. Marja de Profit (%)
  const getMargin = () => {
    if (priceSale === 0) return 0;
    return (getProfit() / priceSale) * 100;
  };

  // 8. ROI (%)
  const getRoi = () => {
    const totalCost = getTotalCost();
    if (totalCost === 0) return 0;
    return (getProfit() / totalCost) * 100;
  };

  const formatBani = (bani: number) => {
    return (bani / 100).toFixed(2) + ' RON';
  };

  return (
    <div className="page-calculator fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{isRo ? 'Calculator Profit & Unit Economics eMAG' : 'eMAG Profit & Unit Economics Calculator'}</h2>
          <p className="page-subtitle">{isRo ? 'Simulează marjele reale de profit luând în calcul comisioanele oficiale eMAG, TVA, ambalare și costurile logistice.' : 'Simulate real profit margins including official eMAG commissions, VAT, packaging, and logistics costs.'}</p>
        </div>
      </div>

      <div className="settings-card">
        <div className="calc-layout">
          {/* Inputs Column */}
          <div className="calc-inputs-column">
            <div className="calc-group">
              <label>{isRo ? 'Alege Categoria eMAG (pentru auto-comision)' : 'Choose eMAG Category (for auto-commission)'}</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="filter-select w-full"
              >
                {Object.keys(commissions).map(cat => (
                  <option key={cat} value={cat}>{cat} ({commissions[cat]}%)</option>
                ))}
              </select>
            </div>

            <div className="calc-group">
              <label>{isRo ? 'Preț Achiziție Furnizor (fără TVA)' : 'Supplier Buy Price (excl. VAT)'}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={(priceSupplier / 100).toFixed(2)}
                  onChange={(e) => setPriceSupplier(Math.round(parseFloat(e.target.value || '0') * 100))}
                  step="0.01"
                />
                <span>RON</span>
              </div>
            </div>

            <div className="calc-group">
              <label>{isRo ? 'Preț Vanzare Estimativ eMAG (TVA inclus)' : 'Estimated Selling Price eMAG (incl. VAT)'}</label>
              <div className="input-with-addon">
                <input 
                  type="number" 
                  value={(priceSale / 100).toFixed(2)}
                  onChange={(e) => setPriceSale(Math.round(parseFloat(e.target.value || '0') * 100))}
                  step="0.01"
                />
                <span>RON</span>
              </div>
            </div>

            <div className="calc-row-2">
              <div className="calc-group">
                <label>{isRo ? 'TVA (%)' : 'VAT (%)'}</label>
                <input 
                  type="number" 
                  value={vatRate}
                  onChange={(e) => setVatRate(parseFloat(e.target.value || '0'))}
                />
              </div>
              <div className="calc-group">
                <label>{isRo ? 'Comision eMAG (%)' : 'eMAG Commission (%)'}</label>
                <input 
                  type="number" 
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(parseFloat(e.target.value || '0'))}
                />
              </div>
            </div>

            <div className="calc-row-2">
              <div className="calc-group">
                <label>{isRo ? 'Transport Furnizor / bucată' : 'Supplier Shipping / item'}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(shippingSupplier / 100).toFixed(2)}
                    onChange={(e) => setShippingSupplier(Math.round(parseFloat(e.target.value || '0') * 100))}
                    step="0.01"
                  />
                  <span>RON</span>
                </div>
              </div>
              <div className="calc-group">
                <label>{isRo ? 'Transport Client (livrare)' : 'Customer Shipping (delivery)'}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(shippingClient / 100).toFixed(2)}
                    onChange={(e) => setShippingClient(Math.round(parseFloat(e.target.value || '0') * 100))}
                    step="0.01"
                  />
                  <span>RON</span>
                </div>
              </div>
            </div>

            <div className="calc-row-3">
              <div className="calc-group">
                <label>{isRo ? 'Ambalaj / buc' : 'Packaging / item'}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(packagingCost / 100).toFixed(2)}
                    onChange={(e) => setPackagingCost(Math.round(parseFloat(e.target.value || '0') * 100))}
                    step="0.01"
                  />
                </div>
              </div>
              <div className="calc-group">
                <label>{isRo ? 'Marketing / buc' : 'Marketing / item'}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(marketingCost / 100).toFixed(2)}
                    onChange={(e) => setMarketingCost(Math.round(parseFloat(e.target.value || '0') * 100))}
                    step="0.01"
                  />
                </div>
              </div>
              <div className="calc-group">
                <label>{isRo ? 'Alte Costuri / buc' : 'Other Costs / item'}</label>
                <div className="input-with-addon">
                  <input 
                    type="number" 
                    value={(otherCosts / 100).toFixed(2)}
                    onChange={(e) => setOtherCosts(Math.round(parseFloat(e.target.value || '0') * 100))}
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            <div className="calc-group">
              <label>{isRo ? 'Rată Estimat Retururi (%)' : 'Est. Return Rate (%)'}</label>
              <input 
                type="number" 
                value={estimatedReturnRate}
                onChange={(e) => setEstimatedReturnRate(parseFloat(e.target.value || '0'))}
              />
            </div>
          </div>

          {/* Outputs Column */}
          <div className="calc-outputs-column">
            <h4>{isRo ? 'Rezultate Simulare' : 'Simulation Results'}</h4>
            
            <div className="output-row">
              <span>{isRo ? 'Cost Total Logistica + Marfă:' : 'Total Cost Goods + Logistics:'}</span>
              <strong>{formatBani(getTotalCost())}</strong>
            </div>

            <div className="output-row">
              <span>{isRo ? 'Comision eMAG de plată:' : 'eMAG Commission Fee:'}</span>
              <strong>{formatBani(getEmagCommission())}</strong>
            </div>

            <div className="output-row">
              <span>{isRo ? 'TVA Vanzare (colectat):' : 'Output VAT (collected):'}</span>
              <strong>{formatBani(getVatValueSale())}</strong>
            </div>

            <div className="output-row">
              <span>{isRo ? 'TVA Achiziție (deductibil):' : 'Input VAT (deductible):'}</span>
              <strong>{formatBani(getVatValueSupplier())}</strong>
            </div>

            <div className="output-divider"></div>

            <div className="output-row highlight-row">
              <span>{isRo ? 'Profit Brut Estimativ:' : 'Est. Gross Profit:'}</span>
              <strong className={getProfit() >= 0 ? 'text-green' : 'text-danger'}>
                {formatBani(getProfit())}
              </strong>
            </div>

            <div className="output-kpi-box">
              <div className="kpi-mini">
                <span>{isRo ? 'Marjă' : 'Margin'}</span>
                <strong className={getMargin() >= 30 ? 'text-green' : 'text-orange'}>
                  {getMargin().toFixed(1)}%
                </strong>
              </div>
              <div className="kpi-mini">
                <span>ROI</span>
                <strong className={getRoi() >= 35 ? 'text-green' : 'text-orange'}>
                  {getRoi().toFixed(1)}%
                </strong>
              </div>
            </div>

            <div className="alert alert-info mt-1">
              <Info size={16} />
              <span><strong>{isRo ? 'Indicație ROI:' : 'ROI Advice:'}</strong> {isRo ? 'Comercianții eMAG experimentați vizează produse cu un ROI de peste 35% pentru a acoperi costurile adiacente neprevăzute.' : 'Experienced eMAG sellers target products with ROI over 35% to cover unforeseen operational expenses.'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
