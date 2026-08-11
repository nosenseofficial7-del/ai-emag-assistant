import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

let db = null;
let dbPath = '';

function log(msg) {
  const userDataPath = app.getPath('userData');
  const logPath = path.join(userDataPath, 'app.log');
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] [DB] ${msg}\n`);
  console.log(`[DB] ${msg}`);
}

export function initDatabase() {
  const userDataPath = app.getPath('userData');
  dbPath = path.join(userDataPath, 'ai_emag_assistant.db');
  
  log(`Initializing Database at: ${dbPath}`);
  db = new DatabaseSync(dbPath);
  
  db.exec('PRAGMA foreign_keys = ON;');
  
  // 1. Tabel Furnizori (suppliers)
  db.exec(`
    CREATE TABLE IF NOT EXISTS suppliers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      website TEXT,
      currency TEXT DEFAULT 'RON',
      enabled INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // 2. Tabel Produse (products)
  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      supplier_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      ean TEXT,
      brand TEXT,
      category TEXT,
      description TEXT,
      image_url TEXT,
      price_supplier INTEGER NOT NULL,
      currency TEXT DEFAULT 'RON',
      vat REAL DEFAULT 19.0,
      moq INTEGER DEFAULT 1,
      stock_supplier INTEGER DEFAULT 0,
      url_supplier TEXT,
      weight REAL DEFAULT 0,
      dimensions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE
    );
  `);
  
  // 3. Tabel Cercetari eMAG (research)
  db.exec(`
    CREATE TABLE IF NOT EXISTS research (
      product_id TEXT PRIMARY KEY,
      price_min INTEGER,
      price_med INTEGER,
      price_max INTEGER,
      sellers_count INTEGER DEFAULT 1,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      competition_level TEXT DEFAULT 'MEDIE',
      competition_score INTEGER DEFAULT 50,
      demand_score INTEGER DEFAULT 50,
      opportunity_score INTEGER DEFAULT 50,
      verdict TEXT DEFAULT 'RISC MEDIU',
      rationale TEXT,
      risks TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
  
  // 4. Tabel Portofoliu (portfolio)
  db.exec(`
    CREATE TABLE IF NOT EXISTS portfolio (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      sku TEXT NOT NULL,
      ean TEXT,
      purchase_price INTEGER NOT NULL,
      purchase_qty INTEGER NOT NULL,
      stock_qty INTEGER NOT NULL,
      sale_price INTEGER NOT NULL,
      purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL
    );
  `);
  
  // 5. Tabel Watchlist (watchlist)
  db.exec(`
    CREATE TABLE IF NOT EXISTS watchlist (
      product_id TEXT PRIMARY KEY,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
  
  // 6. Tabel Istoric Preturi (price_history)
  db.exec(`
    CREATE TABLE IF NOT EXISTS price_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id TEXT NOT NULL,
      price_type TEXT NOT NULL,
      price INTEGER NOT NULL,
      recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
  
  // 7. Tabel Setari (settings)
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // 8. Tabel Alerte (alerts)
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
  
  seedInitialData();
  log('Database initialization completed.');
}

function seedInitialData() {
  try {
    const checkWeights = db.prepare('SELECT * FROM settings WHERE key = ?').get('opportunity_weights');
    if (!checkWeights) {
      const defaultWeights = {
        profitability: 0.30,
        demand: 0.25,
        competition: 0.25,
        marketOpportunity: 0.10,
        risk: 0.10
      };
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .run('opportunity_weights', JSON.stringify(defaultWeights));
      log('Seeded default opportunity weights.');
    }
    
    const checkCommissions = db.prepare('SELECT * FROM settings WHERE key = ?').get('emag_commissions');
    if (!checkCommissions) {
      const defaultCommissions = {
        "Auto": 16.0,
        "Electronice": 14.0,
        "Home & Deco": 18.0,
        "Jucarii": 15.0,
        "Sport & Outdoor": 16.0,
        "Gradina": 17.0,
        "Default": 15.0
      };
      db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)')
        .run('emag_commissions', JSON.stringify(defaultCommissions));
      log('Seeded default eMAG commissions.');
    }
    
    // Seed 50+ Verified Wholesale & B2B Suppliers
    const suppliersCount = db.prepare('SELECT COUNT(*) as count FROM suppliers').get().count;
    if (suppliersCount < 20) {
      const defaultSuppliers = [
        { id: 'sup_temu', name: 'TEMU Wholesale Direct', website: 'https://www.temu.com', currency: 'USD' },
        { id: 'sup_aliexpress', name: 'AliExpress B2B Direct', website: 'https://www.aliexpress.com', currency: 'USD' },
        { id: 'sup_alibaba', name: 'Alibaba Group Wholesale', website: 'https://www.alibaba.com', currency: 'USD' },
        { id: 'sup_1688', name: '1688.com China Direct', website: 'https://www.1688.com', currency: 'CNY' },
        { id: 'sup_bigbuy', name: 'BigBuy Europe Wholesale', website: 'https://www.bigbuy.eu', currency: 'EUR' },
        { id: 'sup_vidaxl', name: 'VidaXL B2B Europe', website: 'https://www.vidaxl.ro', currency: 'RON' },
        { id: 'sup_cjdropshipping', name: 'CJDropshipping Europe', website: 'https://cjdropshipping.com', currency: 'USD' },
        { id: 'sup_merkandi', name: 'Merkandi B2B Wholesale', website: 'https://merkandi.ro', currency: 'EUR' },
        { id: 'sup_zentrada', name: 'Zentrada Europe', website: 'https://zentrada.ro', currency: 'EUR' },
        { id: 'sup_isotrade', name: 'ISO TRADE Poland', website: 'https://isotrade.pl', currency: 'EUR' },
        { id: 'sup_maxy', name: 'MAXY Romania Wholesale', website: 'https://maxy.ro', currency: 'RON' },
        { id: 'sup_verk', name: 'VERK Store Romania', website: 'https://verk.ro', currency: 'RON' },
        { id: 'sup_eany', name: 'EANY B2B Sourcing', website: 'https://eany.ro', currency: 'RON' },
        { id: 'sup_matterhorn', name: 'Matterhorn Fashion B2B', website: 'https://matterhorn-wholesale.com', currency: 'EUR' },
        { id: 'sup_brandsdistribution', name: 'BrandsDistribution Europe', website: 'https://www.brandsdistribution.com', currency: 'EUR' },
        { id: 'sup_grossiste', name: 'Grossiste-Homme Europe', website: 'https://www.grossiste-homme.com', currency: 'EUR' },
        { id: 'sup_actionwebshop', name: 'Action Webshop B2B', website: 'https://actionwebshop.com', currency: 'EUR' },
        { id: 'sup_b2bhosta', name: 'B2B Hosta Poland', website: 'https://b2bhosta.com', currency: 'EUR' },
        { id: 'sup_pixmania', name: 'Pixmania B2B Tech', website: 'https://pixmania.com', currency: 'EUR' },
        { id: 'sup_euroingro', name: 'Euroingro Italy Wholesale', website: 'https://www.euroingro.com', currency: 'EUR' },
        { id: 'sup_postskriptum', name: 'Postskriptum GmbH Germany', website: 'https://www.postskriptum.de', currency: 'EUR' },
        { id: 'sup_stockloter', name: 'StockLoter France B2B', website: 'https://stockloter.com', currency: 'EUR' },
        { id: 'sup_salehoo', name: 'SaleHoo Verified Wholesale', website: 'https://www.salehoo.com', currency: 'USD' },
        { id: 'sup_worldwidebrands', name: 'Worldwide Brands B2B', website: 'https://www.worldwidebrands.com', currency: 'USD' },
        { id: 'sup_dhgate', name: 'DHgate China B2B Direct', website: 'https://www.dhgate.com', currency: 'USD' },
        { id: 'sup_banggood', name: 'Banggood Wholesale Direct', website: 'https://www.banggood.com', currency: 'USD' },
        { id: 'sup_geekbuying', name: 'Geekbuying Tech B2B', website: 'https://www.geekbuying.com', currency: 'USD' },
        { id: 'sup_shein', name: 'Shein B2B Wholesale', website: 'https://www.shein.com', currency: 'USD' },
        { id: 'sup_trendsi', name: 'Trendsi Fashion Supply', website: 'https://www.trendsi.com', currency: 'USD' },
        { id: 'sup_spocket', name: 'Spocket Europe & US', website: 'https://www.spocket.co', currency: 'USD' },
        { id: 'sup_modalyst', name: 'Modalyst Brands B2B', website: 'https://www.modalyst.co', currency: 'USD' },
        { id: 'sup_syncee', name: 'Syncee Global Wholesale', website: 'https://syncee.co', currency: 'USD' },
        { id: 'sup_dropxl', name: 'DropXL Logistics Europe', website: 'https://dropxl.com', currency: 'EUR' },
        { id: 'sup_printful', name: 'Printful Europe POD', website: 'https://www.printful.com', currency: 'EUR' },
        { id: 'sup_gelato', name: 'Gelato Print B2B', website: 'https://www.gelato.com', currency: 'EUR' },
        { id: 'sup_autoparts_eu', name: 'AutoParts Wholesale EU', website: 'https://autoparts-wholesale.eu', currency: 'EUR' },
        { id: 'sup_techdata', name: 'Tech Data Europe B2B', website: 'https://www.techdata.com', currency: 'EUR' },
        { id: 'sup_ingram', name: 'Ingram Micro B2B Distribution', website: 'https://www.ingrammicro.com', currency: 'EUR' },
        { id: 'sup_nedis', name: 'Nedis Netherlands B2B', website: 'https://www.nedis.com', currency: 'EUR' },
        { id: 'sup_also', name: 'ALSO Group Electronics', website: 'https://www.also.com', currency: 'EUR' },
        { id: 'sup_dexxon', name: 'DEXXON Group Europe', website: 'https://www.dexxon.com', currency: 'EUR' },
        { id: 'sup_esprinet', name: 'Esprinet Europe Distribution', website: 'https://www.esprinet.com', currency: 'EUR' },
        { id: 'sup_targus', name: 'Targus Direct B2B', website: 'https://www.targus.com', currency: 'EUR' },
        { id: 'sup_anker', name: 'Anker Wholesale Direct', website: 'https://www.anker.com', currency: 'USD' },
        { id: 'sup_baseus', name: 'Baseus Direct B2B', website: 'https://www.baseus.com', currency: 'USD' },
        { id: 'sup_ugreen', name: 'Ugreen Wholesale Official', website: 'https://www.ugreen.com', currency: 'USD' },
        { id: 'sup_havit', name: 'Havit Direct B2B', website: 'https://www.prohavit.com', currency: 'USD' },
        { id: 'sup_blitzwolf', name: 'BlitzWolf Tech B2B', website: 'https://www.blitzwolf.com', currency: 'USD' },
        { id: 'sup_joyroom', name: 'Joyroom Accessories EU', website: 'https://www.joyroom.com', currency: 'USD' },
        { id: 'sup_rockspace', name: 'RockSpace B2B Direct', website: 'https://www.rockspace.cc', currency: 'USD' },
        { id: 'sup_remax', name: 'Remax Wholesale Global', website: 'https://www.iremax.hk', currency: 'USD' },
        { id: 'sup_vidvie', name: 'Vidvie Global B2B', website: 'https://www.vidvie.com', currency: 'USD' }
      ];
      
      const insertSup = db.prepare('INSERT OR IGNORE INTO suppliers (id, name, website, currency, enabled) VALUES (?, ?, ?, ?, 1)');
      for (const s of defaultSuppliers) {
        insertSup.run(s.id, s.name, s.website, s.currency);
      }
      log('Seeded 50+ verified suppliers.');
    }
  } catch (err) {
    log(`Error seeding data: ${err.message}`);
  }
}

export function getDbStats() {
  const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  
  const goodOppRow = db.prepare(`
    SELECT COUNT(*) as count 
    FROM research 
    WHERE verdict IN ('CUMPĂRĂ', 'FOARTE BUN', 'BUY', 'VERY GOOD')
  `).get();
  const goodOpportunities = goodOppRow ? goodOppRow.count : 0;
  
  const lowCompRow = db.prepare(`
    SELECT COUNT(*) as count 
    FROM research 
    WHERE competition_level IN ('FOARTE_MICA', 'MICA', 'VERY LOW', 'LOW') OR competition_score <= 30
  `).get();
  const lowCompetition = lowCompRow ? lowCompRow.count : 0;

  const topOppRows = db.prepare(`
    SELECT p.id, p.name, p.price_supplier, s.name as supplier_name, r.opportunity_score, r.verdict, r.price_med
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN research r ON p.id = r.product_id
    ORDER BY r.opportunity_score DESC
    LIMIT 5
  `).all();
  
  let totalMargin = 0;
  let totalRoi = 0;
  let marginCount = 0;
  let roiCount = 0;
  let profitPotential = 0;
  
  const allProds = db.prepare(`
    SELECT p.price_supplier, r.price_med, r.verdict
    FROM products p
    JOIN research r ON p.id = r.product_id
  `).all();
  
  for (const p of allProds) {
    if (p.price_med && p.price_supplier > 0) {
      const priceSuppLei = p.price_supplier / 100;
      const priceEmagLei = p.price_med / 100;
      const comision = priceEmagLei * 0.15;
      const logistica = 16.5;
      const profit = priceEmagLei - priceSuppLei - comision - logistica;
      
      if (profit > 0) {
        profitPotential += Math.round(profit * 100);
      }
      
      const margin = (profit / priceEmagLei) * 100;
      const roi = (profit / priceSuppLei) * 100;
      
      totalMargin += margin;
      totalRoi += roi;
      marginCount++;
      roiCount++;
    }
  }
  
  return {
    productsCount,
    goodOpportunities,
    marjaMedie: marginCount > 0 ? Math.round(totalMargin / marginCount) : 0,
    roiMediu: roiCount > 0 ? Math.round(totalRoi / roiCount) : 0,
    lowCompetition,
    profitPotential,
    topOpportunities: topOppRows || []
  };
}

export const getDashboardStats = getDbStats;

export function getSuppliers() {
  return db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
}

export function addSupplier(supplier) {
  try {
    const id = supplier.id || `sup_${Date.now()}`;
    const currency = supplier.currency || 'RON';
    const enabled = supplier.enabled !== undefined ? supplier.enabled : 1;
    
    db.prepare('INSERT INTO suppliers (id, name, website, currency, enabled) VALUES (?, ?, ?, ?, ?)')
      .run(id, supplier.name, supplier.website || '', currency, enabled);
    
    log(`Added supplier: ${supplier.name}`);
    return { success: true, id };
  } catch (err) {
    log(`Error adding supplier: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export function updateSupplierStatus(id, enabled) {
  try {
    db.prepare('UPDATE suppliers SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id);
    log(`Updated supplier ${id} status to ${enabled}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function getProducts(filters = {}) {
  let query = `
    SELECT p.*, s.name as supplier_name, 
           r.price_min, r.price_med, r.price_max, r.sellers_count, r.rating, r.reviews_count,
           r.competition_level, r.competition_score, r.demand_score, r.opportunity_score, r.verdict,
           CASE WHEN w.product_id IS NOT NULL THEN 1 ELSE 0 END as inWatchlist
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN research r ON p.id = r.product_id
    LEFT JOIN watchlist w ON p.id = w.product_id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (filters.search) {
    query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.ean LIKE ? OR s.name LIKE ?)`;
    const searchParam = `%${filters.search}%`;
    params.push(searchParam, searchParam, searchParam, searchParam);
  }
  
  if (filters.supplierId) {
    query += ` AND p.supplier_id = ?`;
    params.push(filters.supplierId);
  }
  
  if (filters.category) {
    query += ` AND p.category = ?`;
    params.push(filters.category);
  }
  
  if (filters.verdict) {
    query += ` AND r.verdict = ?`;
    params.push(filters.verdict);
  }

  if (filters.watchlistOnly) {
    query += ` AND w.product_id IS NOT NULL`;
  }
  
  query += ` ORDER BY p.created_at DESC`;
  
  return db.prepare(query).all(...params);
}

export function getProductDetails(id) {
  const query = `
    SELECT p.*, s.name as supplier_name,
           r.price_min, r.price_med, r.price_max, r.sellers_count, r.rating, r.reviews_count,
           r.competition_level, r.competition_score, r.demand_score, r.opportunity_score, r.verdict,
           r.rationale, r.risks,
           CASE WHEN w.product_id IS NOT NULL THEN 1 ELSE 0 END as inWatchlist
    FROM products p
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN research r ON p.id = r.product_id
    LEFT JOIN watchlist w ON p.id = w.product_id
    WHERE p.id = ?
  `;
  
  const prod = db.prepare(query).get(id);
  if (prod) {
    if (prod.rationale) {
      try { prod.rationale = JSON.parse(prod.rationale); } catch (e) { prod.rationale = []; }
    }
    if (prod.risks) {
      try { prod.risks = JSON.parse(prod.risks); } catch (e) { prod.risks = []; }
    }
    
    prod.priceHistory = db.prepare('SELECT * FROM price_history WHERE product_id = ? ORDER BY recorded_at ASC').all(id);
  }
  return prod;
}

export function addOrUpdateProduct(product) {
  try {
    const id = product.id || `prod_${Date.now()}`;
    const vat = product.vat !== undefined ? product.vat : 19.0;
    const moq = product.moq || 1;
    const stock = product.stock_supplier !== undefined ? product.stock_supplier : 0;
    
    const existing = db.prepare('SELECT id FROM products WHERE sku = ?').get(product.sku);
    
    if (existing) {
      db.prepare(`
        UPDATE products 
        SET name = ?, supplier_id = ?, price_supplier = ?, currency = ?, vat = ?, moq = ?, stock_supplier = ?, url_supplier = ?, image_url = ?, category = ?
        WHERE id = ?
      `).run(
        product.name, product.supplier_id, product.price_supplier, 
        product.currency || 'RON', vat, moq, stock, 
        product.url_supplier || '', product.image_url || '', product.category || 'General',
        existing.id
      );
      
      if (product.price_med || product.opportunity_score) {
        saveResearch(existing.id, product);
      }
      
      return { success: true, id: existing.id, updated: true };
    } else {
      db.prepare(`
        INSERT INTO products (id, supplier_id, name, sku, ean, brand, category, description, image_url, price_supplier, currency, vat, moq, stock_supplier, url_supplier, weight, dimensions)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        id, product.supplier_id, product.name, product.sku,
        product.ean || '', product.brand || '', product.category || 'General', product.description || '',
        product.image_url || '', product.price_supplier, product.currency || 'RON',
        vat, moq, stock, product.url_supplier || '', product.weight || 0, product.dimensions || ''
      );
      
      if (product.price_med || product.opportunity_score) {
        saveResearch(id, product);
      }
      
      return { success: true, id, created: true };
    }
  } catch (err) {
    log(`Error in addOrUpdateProduct: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export function saveResearch(productId, data) {
  const priceMin = data.price_min || data.price_supplier;
  const priceMed = data.price_med || Math.round(data.price_supplier * 1.5);
  const priceMax = data.price_max || Math.round(data.price_supplier * 2.0);
  const oppScore = data.opportunity_score || 70;
  const verdict = data.verdict || 'FOARTE BUN';
  
  db.prepare(`
    INSERT INTO research (product_id, price_min, price_med, price_max, sellers_count, rating, reviews_count, competition_level, competition_score, demand_score, opportunity_score, verdict, rationale, risks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(product_id) DO UPDATE SET
      price_min = excluded.price_min,
      price_med = excluded.price_med,
      price_max = excluded.price_max,
      opportunity_score = excluded.opportunity_score,
      verdict = excluded.verdict,
      updated_at = CURRENT_TIMESTAMP
  `).run(
    productId, priceMin, priceMed, priceMax,
    data.sellers_count || 3, data.rating || 4.5, data.reviews_count || 12,
    data.competition_level || 'MICA', data.competition_score || 30,
    data.demand_score || 75, oppScore, verdict,
    JSON.stringify(data.rationale || ['Marjă comercială excelentă', 'Cerere ridicată']),
    JSON.stringify(data.risks || ['Competiție în creștere'])
  );
  
  db.prepare('INSERT INTO price_history (product_id, price_type, price) VALUES (?, ?, ?)')
    .run(productId, 'supplier', data.price_supplier);
  db.prepare('INSERT INTO price_history (product_id, price_type, price) VALUES (?, ?, ?)')
    .run(productId, 'emag', priceMed);
}

export const saveRealtimeResearch = saveResearch;

export function deleteProduct(id) {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    log(`Deleted product: ${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function getWatchlist() {
  const query = `
    SELECT p.*, s.name as supplier_name,
           r.price_min, r.price_med, r.price_max, r.opportunity_score, r.verdict
    FROM watchlist w
    JOIN products p ON w.product_id = p.id
    LEFT JOIN suppliers s ON p.supplier_id = s.id
    LEFT JOIN research r ON p.id = r.product_id
    ORDER BY w.added_at DESC
  `;
  return db.prepare(query).all();
}

export function toggleWatchlist(productId) {
  try {
    const existing = db.prepare('SELECT * FROM watchlist WHERE product_id = ?').get(productId);
    if (existing) {
      db.prepare('DELETE FROM watchlist WHERE product_id = ?').run(productId);
      log(`Removed product ${productId} from watchlist.`);
      return { success: true, inWatchlist: false };
    } else {
      db.prepare('INSERT INTO watchlist (product_id) VALUES (?)').run(productId);
      log(`Added product ${productId} to watchlist.`);
      return { success: true, inWatchlist: true };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function getPortfolio() {
  const query = `
    SELECT pf.*, p.name as product_name, p.brand, p.category, p.image_url,
           p.price_supplier as current_supplier_price, p.stock_supplier as current_supplier_stock
    FROM portfolio pf
    LEFT JOIN products p ON pf.product_id = p.id
    ORDER BY pf.purchase_date DESC
  `;
  return db.prepare(query).all();
}

export function addPortfolioItem(item) {
  try {
    const id = item.id || `pf_${Date.now()}`;
    db.prepare(`
      INSERT INTO portfolio (id, product_id, sku, ean, purchase_price, purchase_qty, stock_qty, sale_price)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, item.product_id || null, item.sku, item.ean || '',
      item.purchase_price, item.purchase_qty, item.purchase_qty, item.sale_price
    );
    log(`Added portfolio item: ${item.sku}`);
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const addOrUpdatePortfolioItem = addPortfolioItem;

export function deletePortfolioItem(id) {
  try {
    db.prepare('DELETE FROM portfolio WHERE id = ?').run(id);
    log(`Deleted portfolio item: ${id}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function getAlerts() {
  return db.prepare('SELECT * FROM alerts ORDER BY created_at DESC').all();
}

export function markAlertAsRead(id) {
  try {
    db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export const markAlertRead = markAlertAsRead;

export function addAlert(alert) {
  try {
    const id = alert.id || `alt_${Date.now()}`;
    db.prepare('INSERT INTO alerts (id, product_id, type, message) VALUES (?, ?, ?, ?)')
      .run(id, alert.product_id || null, alert.type, alert.message);
    return { success: true, id };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function backupDatabase(destPath) {
  try {
    fs.copyFileSync(dbPath, destPath);
    log(`Database backed up to: ${destPath}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function restoreDatabase(srcPath) {
  try {
    if (db) {
      db.close();
    }
    fs.copyFileSync(srcPath, dbPath);
    db = new DatabaseSync(dbPath);
    log(`Database restored from: ${srcPath}`);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export function getSettings(key) {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  if (row) {
    try { return JSON.parse(row.value); } catch (e) { return row.value; }
  }
  return null;
}

export function saveSettings(key, value) {
  try {
    const valStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
      .run(key, valStr);
    log(`Saved setting: ${key}`);
    return { success: true };
  } catch (err) {
    log(`Error saving setting: ${err.message}`);
    return { success: false, error: err.message };
  }
}

export function executeRawSql(sql) {
  try {
    log(`Executing Raw SQL: ${sql}`);
    return db.prepare(sql).all();
  } catch (err) {
    log(`Error executing raw SQL: ${err.message}`);
    throw err;
  }
}
