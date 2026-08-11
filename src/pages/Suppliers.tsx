import { useState, useEffect } from 'react';
import { Truck, Search, Plus, Globe } from 'lucide-react';
import type { Supplier } from '../types';

interface SuppliersProps {
  t: any;
}

export default function Suppliers({ t }: SuppliersProps) {
  const isRo = t.navDashboard === 'Panou Control';

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // New Supplier Form
  const [newSupName, setNewSupName] = useState('');
  const [newSupWebsite, setNewSupWebsite] = useState('');
  const [newSupCurrency, setNewSupCurrency] = useState('RON');
  const [savingSup, setSavingSup] = useState(false);
  const [msgSup, setMsgSup] = useState('');

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      if (window.api && window.api.getSuppliers) {
        const sups = await window.api.getSuppliers();
        setSuppliers(sups);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStatus = async (id: string, currentEnabled: boolean) => {
    try {
      if (window.api && window.api.updateSupplierStatus) {
        await window.api.updateSupplierStatus(id, !currentEnabled);
        setSuppliers(prev => prev.map(s => s.id === id ? { ...s, enabled: !currentEnabled ? 1 : 0 } : s));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddSupplier = async () => {
    if (!newSupName.trim()) return;
    setSavingSup(true);
    try {
      if (window.api && window.api.addSupplier) {
        const res = await window.api.addSupplier({
          id: `sup_${Date.now()}`,
          name: newSupName.trim(),
          website: newSupWebsite.trim(),
          currency: newSupCurrency,
          enabled: 1
        });

        if (res.success) {
          setMsgSup(isRo ? 'Furnizor adăugat cu succes!' : 'Supplier added successfully!');
          setNewSupName('');
          setNewSupWebsite('');
          loadSuppliers();
          setTimeout(() => setMsgSup(''), 3000);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingSup(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.website && s.website.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="fade-in-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Header Row */}
      <div className="page-header-row">
        <div>
          <h2 className="page-title">
            <Truck style={{ color: '#3b82f6', width: '26px', height: '26px' }} />
            {isRo ? 'Gestionare Furnizori B2B Verificați' : 'Verified B2B Suppliers Management'}
          </h2>
          <p className="page-subtitle">
            {isRo 
              ? `Catalog activ cu ${suppliers.length} furnizori comerciali conectați (Temu, AliExpress, Alibaba, BigBuy, VidaXL, Maxy, Verk, etc.).`
              : `Active catalog with ${suppliers.length} connected commercial suppliers (Temu, AliExpress, Alibaba, BigBuy, VidaXL, Maxy, Verk, etc.).`}
          </p>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder={isRo ? "Caută furnizor..." : "Search supplier..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px 10px 40px',
              borderRadius: '14px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              color: '#ffffff',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Main Table Glass Container */}
      <div style={{
        borderRadius: '24px',
        backgroundColor: 'rgba(18, 24, 41, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        overflow: 'hidden'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', color: '#94a3b8', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.5px' }}>
              <th style={{ padding: '16px 20px' }}>{isRo ? 'Nume Furnizor' : 'Supplier Name'}</th>
              <th style={{ padding: '16px 20px' }}>{isRo ? 'Site Web' : 'Website'}</th>
              <th style={{ padding: '16px 20px' }}>{isRo ? 'Monedă' : 'Currency'}</th>
              <th style={{ padding: '16px 20px' }}>{isRo ? 'Stare' : 'Status'}</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {filteredSuppliers.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background-color 0.2s' }}>
                <td style={{ padding: '16px 20px', fontWeight: '800', color: '#ffffff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', backgroundColor: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '12px' }}>
                      {s.name.substring(0, 2).toUpperCase()}
                    </div>
                    <span>{s.name}</span>
                  </div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  {s.website ? (
                    <a href={s.website} target="_blank" rel="noreferrer" style={{ color: '#60a5fa', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                      <Globe style={{ width: '14px', height: '14px' }} />
                      <span>{s.website.replace('https://', '').replace('http://', '').replace('www.', '')}</span>
                    </a>
                  ) : (
                    <span style={{ color: '#64748b' }}>N/A</span>
                  )}
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.06)', color: '#cbd5e1', fontWeight: '700', fontSize: '11.5px' }}>
                    {s.currency || 'RON'}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    backgroundColor: s.enabled ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    color: s.enabled ? '#34d399' : '#f87171',
                    fontSize: '11px',
                    fontWeight: '800',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: s.enabled ? '#34d399' : '#f87171' }} />
                    {s.enabled ? (isRo ? 'ACTIV' : 'ACTIVE') : (isRo ? 'INACTIV' : 'INACTIVE')}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button
                    onClick={() => handleToggleStatus(s.id, Boolean(s.enabled))}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '10px',
                      backgroundColor: s.enabled ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                      border: s.enabled ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
                      color: s.enabled ? '#f87171' : '#34d399',
                      fontSize: '12px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {s.enabled ? (isRo ? 'Dezactivează' : 'Disable') : (isRo ? 'Activează' : 'Enable')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Supplier Card */}
      <div style={{
        padding: '24px',
        borderRadius: '24px',
        backgroundColor: 'rgba(18, 24, 41, 0.8)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(20px)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Plus style={{ color: '#10b981', width: '20px', height: '20px' }} />
          {isRo ? 'Adaugă Furnizor Nou în Catalog' : 'Add New Supplier to Catalog'}
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr auto', gap: '14px', alignItems: 'center' }}>
          <input 
            type="text" 
            placeholder={isRo ? "Nume Furnizor (ex: Temu Europe)" : "Supplier Name (e.g. Temu Europe)"}
            value={newSupName}
            onChange={(e) => setNewSupName(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '13px', outline: 'none' }}
          />

          <input 
            type="text" 
            placeholder={isRo ? "Site Web (ex: https://temu.com)" : "Website (e.g. https://temu.com)"}
            value={newSupWebsite}
            onChange={(e) => setNewSupWebsite(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '13px', outline: 'none' }}
          />

          <select
            value={newSupCurrency}
            onChange={(e) => setNewSupCurrency(e.target.value)}
            style={{ padding: '12px 16px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '13px', outline: 'none' }}
          >
            <option value="RON" style={{ backgroundColor: '#111522' }}>RON (Lei)</option>
            <option value="EUR" style={{ backgroundColor: '#111522' }}>EUR (€)</option>
            <option value="USD" style={{ backgroundColor: '#111522' }}>USD ($)</option>
            <option value="CNY" style={{ backgroundColor: '#111522' }}>CNY (¥)</option>
          </select>

          <button
            onClick={handleAddSupplier}
            disabled={savingSup || !newSupName.trim()}
            style={{
              padding: '12px 22px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              border: 'none',
              fontWeight: '800',
              fontSize: '13px',
              cursor: (!newSupName.trim() || savingSup) ? 'not-allowed' : 'pointer',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)'
            }}
          >
            {isRo ? 'Salvează' : 'Save'}
          </button>
        </div>

        {msgSup && <span style={{ fontSize: '13px', color: '#34d399', fontWeight: '700' }}>{msgSup}</span>}
      </div>

    </div>
  );
}
