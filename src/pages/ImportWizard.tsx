import { useState, useEffect, useRef } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { Upload, ArrowRight, Play, Pause, XCircle, CheckCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { Supplier } from '../types';

interface ImportWizardProps {
  setCurrentPage: (page: string) => void;
  t: any;
}

type WizardStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'complete';

export default function ImportWizard({ setCurrentPage, t }: ImportWizardProps) {
  const isRo = t.navDashboard === 'Panou Control';
  const [step, setStep] = useState<WizardStep>('upload');
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  
  // Stari Fisier
  const [fileName, setFileName] = useState('');
  const [sheetData, setSheetData] = useState<any[]>([]); // Toate randurile brute din sheet
  const [headers, setHeaders] = useState<string[]>([]);
  
  // Stari Mapare
  const [mapping, setMapping] = useState<{ [key: string]: string }>({
    name: '',
    sku: '',
    ean: '',
    brand: '',
    category: '',
    description: '',
    price: '',
    currency: '',
    stock: '',
    url: ''
  });

  // Stari Progress Import
  const [importProgress, setImportProgress] = useState(0);
  const [currentItemName, setCurrentItemName] = useState('');
  const [totalRowsToImport, setTotalRowsToImport] = useState(0);
  const [successCount, setSuccessCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  
  // Pause/Resume/Cancel Control Refs & States
  const [isPaused, setIsPaused] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const isPausedRef = useRef(false);
  const isCancelledRef = useRef(false);
  const importIndexRef = useRef(0);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = () => {
    if (window.api && window.api.getSuppliers) {
      window.api.getSuppliers()
        .then((data) => {
          setSuppliers(data);
          if (data.length > 0) {
            setSelectedSupplierId(data[0].id);
          }
        })
        .catch(console.error);
    }
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  // Procesare Excel / CSV
  const processFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return;
      
      const workbook = XLSX.read(data, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Extragem datele ca array of objects/arrays
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[];
      
      if (jsonData.length > 0) {
        const fileHeaders = jsonData[0].map((h: any) => String(h || '').trim());
        setHeaders(fileHeaders);
        
        // Convertim randurile urmatoare in obiecte pe baza index-ului
        const rows = jsonData.slice(1).filter(r => r.length > 0);
        setSheetData(rows);
        
        // Auto-detectare coloane
        autoDetectColumns(fileHeaders);
        setStep('mapping');
      }
    };
    
    reader.readAsBinaryString(file);
  };

  // Auto-detectare coloane pe baza de potriviri de text
  const autoDetectColumns = (fileHeaders: string[]) => {
    const newMapping = { ...mapping };
    const lowercaseHeaders = fileHeaders.map(h => h.toLowerCase());

    const findMatch = (keys: string[]) => {
      for (const key of keys) {
        const idx = lowercaseHeaders.findIndex(h => h.includes(key));
        if (idx !== -1) return fileHeaders[idx];
      }
      return '';
    };

    newMapping.name = findMatch(['product name', 'nume', 'denumire', 'title', 'produs']);
    newMapping.sku = findMatch(['sku', 'cod', 'reference', 'ref']);
    newMapping.ean = findMatch(['ean', 'bar code', 'barcode', 'cod bare']);
    newMapping.brand = findMatch(['brand', 'marca', 'producator']);
    newMapping.category = findMatch(['category', 'categorie']);
    newMapping.description = findMatch(['description', 'descriere']);
    newMapping.price = findMatch(['price', 'pret', 'valoare', 'achizitie']);
    newMapping.currency = findMatch(['currency', 'moneda', 'valuta']);
    newMapping.stock = findMatch(['stock', 'stoc', 'cantitate', 'qty']);
    newMapping.url = findMatch(['url', 'link', 'site']);

    setMapping(newMapping);
  };

  const handleMapChange = (field: string, value: string) => {
    setMapping({
      ...mapping,
      [field]: value
    });
  };

  // Pregateste import
  const handleProceedToPreview = () => {
    // Verificam mapari obligatorii (Name si SKU si Price sunt minime)
    if (!mapping.name || !mapping.sku || !mapping.price) {
      alert('Vă rugăm să mapați cel puțin coloanele obligatorii: Denumire Produs, SKU și Preț.');
      return;
    }
    setStep('preview');
  };

  // Executie Import cu Progress + Pause + Cancel
  const handleStartImport = async () => {
    setStep('importing');
    setTotalRowsToImport(sheetData.length);
    setImportProgress(0);
    setSuccessCount(0);
    setErrorCount(0);
    
    isPausedRef.current = false;
    isCancelledRef.current = false;
    setIsPaused(false);
    setIsCancelled(false);
    importIndexRef.current = 0;
    
    runImportLoop();
  };

  const runImportLoop = async () => {
    if (!window.api || !window.api.addOrUpdateProduct) return;
    
    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    const defaultCurrency = supplier?.currency || 'RON';
    
    const total = sheetData.length;
    
    while (importIndexRef.current < total) {
      // 1. Verificare Cancel
      if (isCancelledRef.current) {
        writeLog('Import cancelled by user.');
        setStep('complete');
        return;
      }
      
      // 2. Verificare Pause
      if (isPausedRef.current) {
        await new Promise(resolve => setTimeout(resolve, 500));
        continue;
      }
      
      const row = sheetData[importIndexRef.current];
      const index = importIndexRef.current;
      
      // Obtinem valoarea din row pe baza header index
      const getValueByHeader = (mappedHeader: string) => {
        if (!mappedHeader) return undefined;
        const hIdx = headers.indexOf(mappedHeader);
        return hIdx !== -1 ? row[hIdx] : undefined;
      };
      
      // Formatare valori
      const rawPrice = parseFloat(String(getValueByHeader(mapping.price) || '0').replace(/[^0-9.]/g, ''));
      const priceBani = Math.round(rawPrice * 100); // in bani
      const rawStock = parseInt(String(getValueByHeader(mapping.stock) || '0').replace(/[^0-9]/g, '')) || 0;
      const rawMoq = 1; // Default
      
      const productName = String(getValueByHeader(mapping.name) || `Produs fara nume ${index}`);
      setCurrentItemName(productName);
      
      const productObj = {
        supplier_id: selectedSupplierId,
        name: productName,
        sku: String(getValueByHeader(mapping.sku) || `SKU-${index}`),
        ean: getValueByHeader(mapping.ean) ? String(getValueByHeader(mapping.ean)) : undefined,
        brand: getValueByHeader(mapping.brand) ? String(getValueByHeader(mapping.brand)) : undefined,
        category: getValueByHeader(mapping.category) ? String(getValueByHeader(mapping.category)) : undefined,
        description: getValueByHeader(mapping.description) ? String(getValueByHeader(mapping.description)) : undefined,
        price_supplier: priceBani,
        currency: getValueByHeader(mapping.currency) ? String(getValueByHeader(mapping.currency)) : defaultCurrency,
        vat: 19.0,
        moq: rawMoq,
        stock_supplier: rawStock,
        url_supplier: getValueByHeader(mapping.url) ? String(getValueByHeader(mapping.url)) : undefined
      };
      
      try {
        const res = await window.api.addOrUpdateProduct(productObj);
        if (res.success) {
          setSuccessCount(prev => prev + 1);
        } else {
          setErrorCount(prev => prev + 1);
          console.error(`Import Row Error: ${res.error}`);
        }
      } catch (err) {
        setErrorCount(prev => prev + 1);
        console.error(err);
      }
      
      // Increment
      importIndexRef.current++;
      setImportProgress(Math.round((importIndexRef.current / total) * 100));
      
      // Mic delay pentru a nu bloca complet firele UI din React/Electron si a lasa state-ul sa faca render la progress
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    setStep('complete');
  };

  const handlePauseToggle = () => {
    const nextState = !isPaused;
    setIsPaused(nextState);
    isPausedRef.current = nextState;
  };

  const handleCancelImport = () => {
    if (confirm('Sigur doriți să opriți importul? Toate produsele introduse până acum vor rămâne salvate.')) {
      setIsCancelled(true);
      isCancelledRef.current = true;
    }
  };

  const writeLog = (msg: string) => {
    console.log(`[Import] ${msg}`);
  };

  return (
    <div className="page-import-wizard fade-in-page">
      <div className="page-header-row">
        <div>
          <h2 className="page-title">Universal Import Wizard (Excel / CSV)</h2>
          <p className="page-subtitle">Încarcă listele de produse de la MAXY, VERK, Zentrada sau orice alt format extern.</p>
        </div>
      </div>

      {/* Wizard Step Tracker */}
      <div className="wizard-tracker">
        <div className={`step-node ${step === 'upload' ? 'active' : ''} ${['mapping', 'preview', 'importing', 'complete'].includes(step) ? 'completed' : ''}`}>1. Încarcă fișier</div>
        <div className={`step-node ${step === 'mapping' ? 'active' : ''} ${['preview', 'importing', 'complete'].includes(step) ? 'completed' : ''}`}>2. Mapează coloane</div>
        <div className={`step-node ${step === 'preview' ? 'active' : ''} ${['importing', 'complete'].includes(step) ? 'completed' : ''}`}>3. Prevăizualizare</div>
        <div className={`step-node ${step === 'importing' ? 'active' : ''} ${step === 'complete' ? 'completed' : ''}`}>4. Importare date</div>
        <div className={`step-node ${step === 'complete' ? 'active' : ''}`}>5. Finalizat</div>
      </div>

      {/* STEP 1: UPLOAD */}
      {step === 'upload' && (
        <div className="import-step-card upload-step">
          <div 
            className="drag-drop-zone"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <Upload size={48} className="text-secondary" />
            <p>{isRo ? 'Trageți fișierul Excel sau CSV aici direct (Drag & Drop)' : 'Drag and drop your Excel or CSV file here directly'}</p>
            <span>{isRo ? 'sau' : 'or'}</span>
            <label className="file-input-label">
              {isRo ? 'Răsfoiește fișier local' : 'Browse local file'}
              <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
            </label>
            <span className="file-types-supported">{isRo ? 'Formate acceptate: .xlsx, .xls, .csv' : 'Supported formats: .xlsx, .xls, .csv'}</span>
          </div>
        </div>
      )}

      {/* STEP 2: MAPPING */}
      {step === 'mapping' && (
        <div className="import-step-card mapping-step">
          <h3>{isRo ? `Asociere Coloane Fișier cu Baza de Date (${fileName})` : `Map File Columns to Database (${fileName})`}</h3>
          <p className="step-description">{isRo ? 'Asociați coloanele detectate din Excel cu câmpurile noastre locale din SQLite. Câmpurile cu steluță (*) sunt obligatorii.' : 'Match detected Excel columns with local SQLite fields. Fields marked with (*) are required.'}</p>
          
          <div className="supplier-selection-row">
            <label><strong>{isRo ? 'Asociază acest catalog cu Furnizorul:*' : 'Associate catalog with Supplier:*'}</strong></label>
            <select 
              value={selectedSupplierId} 
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              className="supplier-import-select"
            >
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.currency})</option>)}
            </select>
          </div>

          <div className="mapping-grid">
            <div className="mapping-row">
              <span className="field-label">{isRo ? 'Denumire Produs *' : 'Product Name *'}</span>
              <select 
                value={mapping.name} 
                onChange={(e) => handleMapChange('name', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">SKU *</span>
              <select 
                value={mapping.sku} 
                onChange={(e) => handleMapChange('sku', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">EAN</span>
              <select 
                value={mapping.ean} 
                onChange={(e) => handleMapChange('ean', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">Brand</span>
              <select 
                value={mapping.brand} 
                onChange={(e) => handleMapChange('brand', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">{isRo ? 'Categorie' : 'Category'}</span>
              <select 
                value={mapping.category} 
                onChange={(e) => handleMapChange('category', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">{isRo ? 'Preț Achiziție *' : 'Buy Price *'}</span>
              <select 
                value={mapping.price} 
                onChange={(e) => handleMapChange('price', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">{isRo ? 'Monedă preț' : 'Price currency'}</span>
              <select 
                value={mapping.currency} 
                onChange={(e) => handleMapChange('currency', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">{isRo ? 'Stoc' : 'Stock'}</span>
              <select 
                value={mapping.stock} 
                onChange={(e) => handleMapChange('stock', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">{isRo ? 'Descriere' : 'Description'}</span>
              <select 
                value={mapping.description} 
                onChange={(e) => handleMapChange('description', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>

            <div className="mapping-row">
              <span className="field-label">{isRo ? 'URL Link Furnizor' : 'Supplier URL Link'}</span>
              <select 
                value={mapping.url} 
                onChange={(e) => handleMapChange('url', e.target.value)}
                className="mapping-select"
              >
                <option value="">{isRo ? 'Alege coloana...' : 'Choose column...'}</option>
                {headers.map(h => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>

          <div className="mapping-actions">
            <button className="secondary-btn" onClick={() => setStep('upload')}>
              {isRo ? 'Înapoi' : 'Back'}
            </button>
            <button className="primary-btn" onClick={handleProceedToPreview}>
              {isRo ? 'Continuă la previzualizare' : 'Continue to preview'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PREVIEW */}
      {step === 'preview' && (
        <div className="import-step-card preview-step">
          <h3>{isRo ? 'Previzualizare Import (Primele 3 randuri)' : 'Import Preview (First 3 rows)'}</h3>
          <p className="step-description">{isRo ? 'Verifică structura datelor mapate înainte de a porni procesarea bazei de date.' : 'Verify mapped data structure before starting database insertion.'}</p>
          
          <div className="table-container preview-table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{isRo ? 'Denumire Produs' : 'Product Name'}</th>
                  <th>SKU</th>
                  <th>EAN</th>
                  <th>{isRo ? 'Preț Achiz.' : 'Buy Price'}</th>
                  <th>{isRo ? 'Stoc' : 'Stock'}</th>
                  <th>{isRo ? 'Categorie' : 'Category'}</th>
                </tr>
              </thead>
              <tbody>
                {sheetData.slice(0, 3).map((row, idx) => {
                  const getValue = (field: string) => {
                    const h = mapping[field];
                    if (!h) return '';
                    const hIdx = headers.indexOf(h);
                    return hIdx !== -1 ? row[hIdx] : '';
                  };
                  
                  return (
                    <tr key={idx}>
                      <td><strong>{getValue('name')}</strong></td>
                      <td><code>{getValue('sku')}</code></td>
                      <td>{getValue('ean') || '—'}</td>
                      <td>{getValue('price')} {getValue('currency')}</td>
                      <td>{getValue('stock') || '0'}</td>
                      <td>{getValue('category') || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="alert alert-info">
            <strong>{isRo ? 'Notă:' : 'Note:'}</strong> {isRo ? `Fișierul ${fileName} conține un total de ${sheetData.length} rânduri valide de importat.` : `The file ${fileName} contains a total of ${sheetData.length} valid rows to import.`}
          </div>

          <div className="mapping-actions">
            <button className="secondary-btn" onClick={() => setStep('mapping')}>
              {isRo ? 'Înapoi' : 'Back'}
            </button>
            <button className="primary-btn green-btn" onClick={handleStartImport}>
              <Play size={16} /> {isRo ? 'Pornește Importul Real' : 'Start Import Process'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: IMPORTING PROGRESS */}
      {step === 'importing' && (
        <div className="import-step-card importing-step">
          <h3>{isRo ? 'Se importă produsele în SQLite local...' : 'Importing products to local SQLite...'}</h3>
          <p className="step-description">{isRo ? 'Vă rugăm să nu închideți aplicația. Datele sunt procesate direct pe hard-disk.' : 'Please do not close the application. Data is being processed directly to disk.'}</p>
          
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${importProgress}%` }}></div>
          </div>
          
          <div className="progress-numbers-row">
            <span>{isRo ? 'Progres:' : 'Progress:'} <strong>{importProgress}%</strong></span>
            <span>{importIndexRef.current} / {totalRowsToImport} {isRo ? 'produse' : 'products'}</span>
          </div>

          <div className="current-importing-item">
            <span>{isRo ? 'Produs curent:' : 'Current item:'}</span>
            <strong>{currentItemName || (isRo ? 'Procesare...' : 'Processing...')}</strong>
          </div>

          <div className="import-results-counter">
            <span className="text-green">{isRo ? 'Inserate cu succes:' : 'Successfully inserted:'} {successCount}</span>
            <span className="text-danger">{isRo ? 'Erori / Rânduri skipped:' : 'Errors / Skipped rows:'} {errorCount}</span>
          </div>

          <div className="import-controls">
            <button 
              className={`secondary-btn ${isPaused ? 'active-pause-btn' : ''}`}
              onClick={handlePauseToggle}
            >
              {isPaused ? <Play size={16} /> : <Pause size={16} />}
              {isPaused ? (isRo ? 'Reia' : 'Resume') : (isRo ? 'Pauză' : 'Pause')}
            </button>
            <button className="secondary-btn btn-danger-border" onClick={handleCancelImport}>
              <XCircle size={16} /> {isRo ? 'Anulează Importul' : 'Cancel Import'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: COMPLETE */}
      {step === 'complete' && (
        <div className="import-step-card complete-step">
          <CheckCircle size={64} className="text-green success-badge-icon" />
          <h3>{isCancelled ? (isRo ? 'Import Anulat' : 'Import Cancelled') : (isRo ? 'Import Finalizat cu succes!' : 'Import Completed Successfully!')}</h3>
          <p className="step-description">{isCancelled ? (isRo ? 'Procesul de încărcare a fost oprit de către utilizator.' : 'The import process was cancelled by the user.') : (isRo ? 'Procesul de încărcare a bazei de date s-a încheiat.' : 'Database import process completed successfully.')}</p>
          
          <div className="summary-stats-box">
            <div className="stat-node">
              <span>{isRo ? 'Produse procesate total:' : 'Total products processed:'}</span>
              <strong>{importIndexRef.current}</strong>
            </div>
            <div className="stat-node text-green">
              <span>{isRo ? 'Produse inserate/actualizate:' : 'Products inserted/updated:'}</span>
              <strong>{successCount}</strong>
            </div>
            <div className="stat-node text-danger">
              <span>{isRo ? 'Erori întâmpinate:' : 'Errors encountered:'}</span>
              <strong>{errorCount}</strong>
            </div>
          </div>

          <div className="complete-actions">
            <button className="primary-btn" onClick={() => setCurrentPage('products')}>
              {isRo ? 'Mergi la Catalog Produse' : 'Go to Product Catalog'}
            </button>
            <button className="secondary-btn" onClick={() => { setFileName(''); setStep('upload'); }}>
              {isRo ? 'Importă un alt fișier' : 'Import another file'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
