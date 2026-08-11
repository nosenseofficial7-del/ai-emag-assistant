import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Building2, Power, PowerOff } from 'lucide-react';
import type { Supplier } from '../types';

interface SuppliersProps {
  t: any;
}

export default function Suppliers({ t }: SuppliersProps) {
  const isRo = t.navDashboard === 'Panou Control';
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stari adaugare furnizor nou
  const [newName, setNewName] = useState('');
  const [newWebsite, setNewWebsite] = useState('');
  const [newCurrency, setNewCurrency] = useState('RON');
  
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    setLoading(true);
    if (window.api && window.api.getSuppliers) {
      window.api.getSuppliers()
        .then((data: any) => {
          setSuppliers(data);
          setLoading(false);
        })
        .catch((err: any) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const handleToggleStatus = (id: string, currentStatus: number) => {
    const nextStatus = currentStatus === 1 ? 0 : 1;
    if (window.api && window.api.updateSupplierStatus) {
      window.api.updateSupplierStatus(id, nextStatus === 1)
        .then((res: any) => {
          if (res.success) {
            loadSuppliers();
          } else {
            alert(`Error: ${res.error}`);
          }
        })
        .catch(console.error);
    }
  };

  const handleAddSupplier = (e: FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    if (window.api && window.api.addSupplier) {
      window.api.addSupplier(newName.trim(), newWebsite.trim() || undefined, newCurrency)
        .then((res: any) => {
          if (res.success) {
            setSuccessMsg(isRo ? 'Furnizor adăugat cu succes!' : 'Supplier added successfully!');
            setNewName('');
            setNewWebsite('');
            setNewCurrency('RON');
            loadSuppliers();
            setTimeout(() => setSuccessMsg(null), 3000);
          } else {
            alert(`Error: ${res.error}`);
          }
        })
        .catch(console.error);
    }
  };

  return (
    <div className="page-suppliers fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">{isRo ? 'Management Furnizori' : 'Supplier Management'}</h2>
          <p className="page-subtitle">{isRo ? 'Administrează catalogul de conectori pentru furnizori. Conectorii pot fi activați sau dezactivați oricând.' : 'Manage supplier connectors catalog. Connectors can be enabled or disabled anytime.'}</p>
        </div>
      </div>

      {successMsg && (
        <div className="alert alert-info">
          {successMsg}
        </div>
      )}

      <div className="settings-grid-layout">
        {/* Suppliers List */}
        <div className="settings-card flex-2">
          <h3><Building2 size={18} /> {isRo ? 'Furnizori Înregistrați (SQLite)' : 'Registered Suppliers (SQLite)'}</h3>
          <p className="card-desc">{isRo ? 'Cataloagele active sunt folosite pentru import și recomandări oportunistice.' : 'Active catalogs are used for import and opportunistic recommendations.'}</p>
          
          <div className="table-container">
            {loading ? (
              <div className="loading-state">{isRo ? 'Se încarcă furnizorii...' : 'Loading suppliers...'}</div>
            ) : suppliers.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{isRo ? 'Nume Furnizor' : 'Supplier Name'}</th>
                    <th>{isRo ? 'Site Web' : 'Website'}</th>
                    <th>{isRo ? 'Monedă Implicită' : 'Default Currency'}</th>
                    <th>Status</th>
                    <th style={{ width: '120px' }}>{isRo ? 'Acțiune' : 'Action'}</th>
                  </tr>
                </thead>
                <tbody>
                  {suppliers.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.name}</strong></td>
                      <td>
                        {s.website ? (
                          <a href={s.website} target="_blank" rel="noreferrer" className="supplier-link">
                            {s.website}
                          </a>
                        ) : <span>—</span>}
                      </td>
                      <td><code>{s.currency}</code></td>
                      <td>
                        <span className={`badge ${s.enabled === 1 ? 'badge-success' : 'badge-offline'}`}>
                          {s.enabled === 1 ? (isRo ? 'ACTIV' : 'ACTIVE') : (isRo ? 'INACTIV' : 'INACTIVE')}
                        </span>
                      </td>
                      <td>
                        <button 
                          className={`secondary-btn btn-sm ${s.enabled === 1 ? 'btn-danger-border' : 'btn-success-border'}`}
                          onClick={() => handleToggleStatus(s.id, s.enabled)}
                        >
                          {s.enabled === 1 ? <PowerOff size={14} /> : <Power size={14} />}
                          <span>{s.enabled === 1 ? (isRo ? 'Dezactivează' : 'Disable') : (isRo ? 'Activează' : 'Enable')}</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">{isRo ? 'Nu s-au găsit furnizori înregistrați.' : 'No registered suppliers found.'}</div>
            )}
          </div>
        </div>

        {/* Add Supplier Form */}
        <div className="settings-card">
          <h3>➕ {isRo ? 'Adaugă Furnizor Nou' : 'Add New Supplier'}</h3>
          <p className="card-desc">{isRo ? 'Extinde conectorii prin adăugarea unui nou canal logistic în baza de date locală.' : 'Extend connectors by adding a new logistic channel to your local database.'}</p>
          
          <form onSubmit={handleAddSupplier} className="settings-form">
            <div className="setting-control-group">
              <label>{isRo ? 'Nume Furnizor *' : 'Supplier Name *'}</label>
              <input 
                type="text" 
                placeholder="Ex: MAXY NEW" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="setting-control-group">
              <label>{isRo ? 'Website URL (Opțional)' : 'Website URL (Optional)'}</label>
              <input 
                type="url" 
                placeholder="https://example.com" 
                value={newWebsite} 
                onChange={(e) => setNewWebsite(e.target.value)}
              />
            </div>

            <div className="setting-control-group">
              <label>{isRo ? 'Monedă Decontare *' : 'Settlement Currency *'}</label>
              <select 
                value={newCurrency} 
                onChange={(e) => setNewCurrency(e.target.value)}
                className="filter-select w-full"
              >
                <option value="RON">RON (Lei)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="PLN">PLN (Polish Zloty)</option>
                <option value="USD">USD (Dollars)</option>
              </select>
            </div>

            <button type="submit" className="primary-btn mt-1 w-full">
              {isRo ? 'Salvează Furnizor' : 'Save Supplier'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
