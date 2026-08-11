import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { app } from 'electron';

let db = null;
let dbPath = '';

// Logger simplu
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
  
  // Activează suportul pentru Foreign Keys în SQLite
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
      price_supplier INTEGER NOT NULL, -- Stocat in bani (ex: 109.99 lei -> 10999 bani)
      currency TEXT DEFAULT 'RON',
      vat REAL DEFAULT 19.0,
      moq INTEGER DEFAULT 1,
      stock_supplier INTEGER DEFAULT 0,
      url_supplier TEXT,
      weight REAL DEFAULT 0,
      dimensions TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE CASCADE,
      UNIQUE(supplier_id, sku)
    );
  `);
  
  // Creare index pe EAN pentru cautare rapida
  db.exec('CREATE INDEX IF NOT EXISTS idx_products_ean ON products(ean);');
  
  // 3. Tabel Cercetare eMAG (emag_research)
  db.exec(`
    CREATE TABLE IF NOT EXISTS emag_research (
      product_id TEXT PRIMARY KEY,
      price_min INTEGER, -- Stocat in bani
      price_med INTEGER, -- Stocat in bani
      price_max INTEGER, -- Stocat in bani
      sellers_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 0,
      reviews_count INTEGER DEFAULT 0,
      competition_level TEXT DEFAULT 'MEDIE', -- FOARTE_MICA, MICA, MEDIE, MARE, FOARTE_MARE
      competition_score INTEGER DEFAULT 50, -- 0 - 100
      demand_score INTEGER DEFAULT 50, -- 0 - 100
      opportunity_score INTEGER DEFAULT 50, -- 0 - 100
      verdict TEXT DEFAULT 'MERITĂ ANALIZAT', -- CUMPĂRĂ, FOARTE BUN, RISC MEDIU, NU MERITĂ
      rationale TEXT, -- JSON String
      risks TEXT, -- JSON String
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );
  `);
  
  // 4. Tabel Portofoliu Produse (my_portfolio)
  db.exec(`
    CREATE TABLE IF NOT EXISTS my_portfolio (
      id TEXT PRIMARY KEY,
      product_id TEXT,
      sku TEXT NOT NULL,
      ean TEXT,
      purchase_price INTEGER NOT NULL, -- Stocat in bani
      purchase_qty INTEGER NOT NULL,
      stock_qty INTEGER NOT NULL,
      sale_price INTEGER NOT NULL, -- Stocat in bani
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
      price_type TEXT NOT NULL, -- 'supplier' sau 'emag'
      price INTEGER NOT NULL, -- Stocat in bani
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
      type TEXT NOT NULL, -- 'buybox_loss', 'stock_critical'
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
  // Seed settings daca nu exista
  try {
    // 1. Ponderi Scorul de Oportunitate
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
    
    // 2. Comisioane eMAG pe categorii
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
    
    // Seed furnizori standard (Zentrada, Maxy, Verk, Eany, Iso Trade)
    const suppliersCount = db.prepare('SELECT COUNT(*) as count FROM suppliers').get().count;
    if (suppliersCount === 0) {
      const defaultSuppliers = [
        { id: 'sup_maxy', name: 'MAXY', website: 'https://maxy.ro', currency: 'RON' },
        { id: 'sup_verk', name: 'VERK', website: 'https://verk.ro', currency: 'RON' },
        { id: 'sup_eany', name: 'EANY', website: 'https://eany.ro', currency: 'RON' },
        { id: 'sup_isotrade', name: 'ISO TRADE', website: 'https://isotrade.pl', currency: 'EUR' },
        { id: 'sup_zentrada', name: 'Zentrada', website: 'https://zentrada.ro', currency: 'EUR' }
      ];
      
      const insertSup = db.prepare('INSERT INTO suppliers (id, name, website, currency, enabled) VALUES (?, ?, ?, ?, ?)');
      for (const s of defaultSuppliers) {
        insertSup.run(s.id, s.name, s.website, s.currency, 1);
      }
      log('Seeded default suppliers.');
      
      // Inserare cateva produse demo pentru Faza 1
      const defaultProducts = [
        {
          id: 'prod_demo_1',
          supplier_id: 'sup_maxy',
          name: 'Lampa LED monitor dual-light',
          sku: 'LED-MON-01',
          ean: '5949000112233',
          brand: 'MaxyLight',
          category: 'Electronice',
          description: 'Lampa LED premium cu montare pe monitor, lumina calda/rece reglabila, alimentare USB.',
          image_url: '',
          price_supplier: 4200, // 42.00 RON
          currency: 'RON',
          vat: 19.0,
          moq: 5,
          stock_supplier: 120,
          url_supplier: 'https://maxy.ro/lampa-led-monitor',
          weight: 0.45,
          dimensions: '45x5x2 cm'
        },
        {
          id: 'prod_demo_2',
          supplier_id: 'sup_verk',
          name: 'Aspirator auto portabil HEPA',
          sku: 'ASP-CAR-12V',
          ean: '5901234567890',
          brand: 'VerkTools',
          category: 'Auto',
          description: 'Aspirator auto portabil, alimentare 12V bricheta, filtru HEPA lavabil, putere 120W.',
          image_url: '',
          price_supplier: 3500, // 35.00 RON
          currency: 'RON',
          vat: 19.0,
          moq: 10,
          stock_supplier: 450,
          url_supplier: 'https://verk.ro/aspirator-auto',
          weight: 0.85,
          dimensions: '30x10x8 cm'
        },
        {
          id: 'prod_demo_3',
          supplier_id: 'sup_eany',
          name: 'Organizator auto bancheta premium',
          sku: 'ORG-CAR-05',
          ean: '6421234567890',
          brand: 'EanyTravel',
          category: 'Auto',
          description: 'Organizator din piele ecologica pentru spatele scaunului, buzunare multiple si suport tableta.',
          image_url: '',
          price_supplier: 2900, // 29.00 RON
          currency: 'RON',
          vat: 19.0,
          moq: 2,
          stock_supplier: 15,
          url_supplier: 'https://eany.ro/organizator-auto',
          weight: 0.60,
          dimensions: '60x40x5 cm'
        }
      ];
      
      const insertProd = db.prepare(`
        INSERT INTO products (
          id, supplier_id, name, sku, ean, brand, category, description, image_url,
          price_supplier, currency, vat, moq, stock_supplier, url_supplier, weight, dimensions
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (const p of defaultProducts) {
        insertProd.run(
          p.id, p.supplier_id, p.name, p.sku, p.ean, p.brand, p.category, p.description, p.image_url,
          p.price_supplier, p.currency, p.vat, p.moq, p.stock_supplier, p.url_supplier, p.weight, p.dimensions
        );
      }
      
      // Seed research demo
      const insertResearch = db.prepare(`
        INSERT INTO emag_research (
          product_id, price_min, price_med, price_max, sellers_count, rating, reviews_count,
          competition_level, competition_score, demand_score, opportunity_score, verdict, rationale, risks
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      // Lampa LED
      insertResearch.run(
        'prod_demo_1',
        9900, // min: 99.00 RON
        11900, // med: 119.00 RON
        14900, // max: 149.00 RON
        12,
        4.3,
        45,
        'MEDIE',
        40,
        73,
        84, // Opportunity Score
        'FOARTE BUN',
        JSON.stringify(['Marjă profitabilă ridicată', 'Cerere solidă', 'Concurență medie controlabilă']),
        JSON.stringify(['Risc de concurență pe preț', 'Produs ușor de importat de alți selleri'])
      );
      
      // Aspirator auto
      insertResearch.run(
        'prod_demo_2',
        7500, // min: 75.00 RON
        9500, // med: 95.00 RON
        12000, // max: 120.00 RON
        28,
        4.1,
        156,
        'MARE',
        75,
        80,
        91, // Opportunity Score (e.g. calculated)
        'CUMPĂRĂ',
        JSON.stringify(['Cerere extrem de mare în sezon', 'ROI excelent']),
        JSON.stringify(['Concurență ridicată pe platformă', 'Rată ridicată de retur la electronice ieftine'])
      );
      
      // Organizator auto
      insertResearch.run(
        'prod_demo_3',
        4900,
        6500,
        7900,
        5,
        4.6,
        12,
        'MICĂ',
        25,
        52,
        54, // Opportunity Score
        'RISC MEDIU',
        JSON.stringify(['Competiție foarte scăzută', 'Recenzii bune']),
        JSON.stringify(['Cerere moderată', 'Stoc furnizor limitat'])
      );
      
      // Seed My Portfolio demo
      db.prepare(`
        INSERT INTO my_portfolio (id, product_id, sku, ean, purchase_price, purchase_qty, stock_qty, sale_price)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run('port_1', 'prod_demo_1', 'LED-MON-01', '5949000112233', 4200, 20, 15, 10999);
      
      log('Seeded initial products, research and portfolio demo data.');
    }
  } catch (err) {
    log(`Seeding Error: ${err.message}`);
  }
}

// === EXPORTATE PENTRU IPC COMMANDS ===

// SETARI
export function getSettings(key) {
  try {
    const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
    return row ? JSON.parse(row.value) : null;
  } catch (e) {
    log(`getSettings Error: ${e.message}`);
    return null;
  }
}

export function saveSettings(key, value) {
  try {
    const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');
    stmt.run(key, JSON.stringify(value));
    return { success: true };
  } catch (e) {
    log(`saveSettings Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}

// FURNIZORI (SUPPLIERS)
export function getSuppliers() {
  try {
    return db.prepare('SELECT * FROM suppliers ORDER BY name ASC').all();
  } catch (e) {
    log(`getSuppliers Error: ${e.message}`);
    return [];
  }
}

export function updateSupplierStatus(id, enabled) {
  try {
    db.prepare('UPDATE suppliers SET enabled = ? WHERE id = ?').run(enabled ? 1 : 0, id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function addSupplier(name, website, currency) {
  try {
    const id = 'sup_' + Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO suppliers (id, name, website, currency, enabled) VALUES (?, ?, ?, ?, 1)')
      .run(id, name, website, currency);
    return { success: true, id };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// PRODUSE & OPPORTUNITY CALCULATIONS
export function getProducts(filters = {}) {
  try {
    let query = `
      SELECT p.*, s.name as supplier_name,
             r.price_min, r.price_med, r.price_max, r.sellers_count, r.rating, r.reviews_count,
             r.competition_level, r.competition_score, r.demand_score, r.opportunity_score, r.verdict
      FROM products p
      JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN emag_research r ON p.id = r.product_id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.search) {
      query += ` AND (p.name LIKE ? OR p.sku LIKE ? OR p.ean LIKE ? OR s.name LIKE ?)`;
      const searchWild = `%${filters.search}%`;
      params.push(searchWild, searchWild, searchWild, searchWild);
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
    
    query += ` ORDER BY p.created_at DESC`;
    
    const stmt = db.prepare(query);
    return stmt.all(...params);
  } catch (e) {
    log(`getProducts Error: ${e.message}`);
    return [];
  }
}

export function getProductDetails(id) {
  try {
    const product = db.prepare(`
      SELECT p.*, s.name as supplier_name
      FROM products p
      JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?
    `).get(id);
    
    if (!product) return null;
    
    const research = db.prepare('SELECT * FROM emag_research WHERE product_id = ?').get(id);
    const watchlist = db.prepare('SELECT 1 FROM watchlist WHERE product_id = ?').get(id);
    const priceHistory = db.prepare('SELECT * FROM price_history WHERE product_id = ? ORDER BY recorded_at ASC').all();
    
    return {
      ...product,
      research: research || null,
      inWatchlist: !!watchlist,
      priceHistory: priceHistory || []
    };
  } catch (e) {
    log(`getProductDetails Error: ${e.message}`);
    return null;
  }
}

export function deleteProduct(id) {
  try {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function addOrUpdateProduct(productData) {
  try {
    const id = productData.id || 'prod_' + Math.random().toString(36).substr(2, 9);
    
    const stmt = db.prepare(`
      INSERT INTO products (
        id, supplier_id, name, sku, ean, brand, category, description, image_url,
        price_supplier, currency, vat, moq, stock_supplier, url_supplier, weight, dimensions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(supplier_id, sku) DO UPDATE SET
        name = excluded.name,
        ean = COALESCE(excluded.ean, ean),
        brand = COALESCE(excluded.brand, brand),
        category = COALESCE(excluded.category, category),
        description = COALESCE(excluded.description, description),
        image_url = COALESCE(excluded.image_url, image_url),
        price_supplier = excluded.price_supplier,
        currency = excluded.currency,
        vat = excluded.vat,
        moq = excluded.moq,
        stock_supplier = excluded.stock_supplier,
        url_supplier = COALESCE(excluded.url_supplier, url_supplier),
        weight = COALESCE(excluded.weight, weight),
        dimensions = COALESCE(excluded.dimensions, dimensions)
    `);
    
    stmt.run(
      id,
      productData.supplier_id,
      productData.name,
      productData.sku,
      productData.ean || null,
      productData.brand || null,
      productData.category || null,
      productData.description || null,
      productData.image_url || null,
      productData.price_supplier, // in bani
      productData.currency || 'RON',
      productData.vat !== undefined ? productData.vat : 19.0,
      productData.moq !== undefined ? productData.moq : 1,
      productData.stock_supplier !== undefined ? productData.stock_supplier : 0,
      productData.url_supplier || null,
      productData.weight || 0,
      productData.dimensions || null
    );
    
    // Daca s-a specificat si cercetare, o salvam
    if (productData.research) {
      saveResearch(id, productData.research);
    }
    
    // Inregistram pretul in istoric
    db.prepare('INSERT INTO price_history (product_id, price_type, price) VALUES (?, ?, ?)')
      .run(id, 'supplier', productData.price_supplier);
      
    return { success: true, id };
  } catch (e) {
    log(`addOrUpdateProduct Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}

export function saveResearch(productId, r) {
  try {
    const stmt = db.prepare(`
      INSERT INTO emag_research (
        product_id, price_min, price_med, price_max, sellers_count, rating, reviews_count,
        competition_level, competition_score, demand_score, opportunity_score, verdict, rationale, risks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        price_min = excluded.price_min,
        price_med = excluded.price_med,
        price_max = excluded.price_max,
        sellers_count = excluded.sellers_count,
        rating = excluded.rating,
        reviews_count = excluded.reviews_count,
        competition_level = excluded.competition_level,
        competition_score = excluded.competition_score,
        demand_score = excluded.demand_score,
        opportunity_score = excluded.opportunity_score,
        verdict = excluded.verdict,
        rationale = excluded.rationale,
        risks = excluded.risks,
        updated_at = CURRENT_TIMESTAMP
    `);
    
    stmt.run(
      productId,
      r.price_min,
      r.price_med,
      r.price_max,
      r.sellers_count,
      r.rating,
      r.reviews_count,
      r.competition_level,
      r.competition_score,
      r.demand_score,
      r.opportunity_score,
      r.verdict,
      JSON.stringify(r.rationale || []),
      JSON.stringify(r.risks || [])
    );
    
    // Salvam pretul eMAG in istoric
    if (r.price_med) {
      db.prepare('INSERT INTO price_history (product_id, price_type, price) VALUES (?, ?, ?)')
        .run(productId, 'emag', r.price_med);
    }
    
    return { success: true };
  } catch (e) {
    log(`saveResearch Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}

// PORTOFOLIU (MY PRODUCTS)
export function getPortfolio() {
  try {
    return db.prepare(`
      SELECT m.*, p.name as product_name, p.brand, p.category, p.image_url,
             p.price_supplier as current_supplier_price, p.stock_supplier as current_supplier_stock
      FROM my_portfolio m
      LEFT JOIN products p ON m.product_id = p.id
      ORDER BY m.purchase_date DESC
    `).all();
  } catch (e) {
    log(`getPortfolio Error: ${e.message}`);
    return [];
  }
}

export function addOrUpdatePortfolioItem(item) {
  try {
    const id = item.id || 'port_' + Math.random().toString(36).substr(2, 9);
    
    const stmt = db.prepare(`
      INSERT INTO my_portfolio (id, product_id, sku, ean, purchase_price, purchase_qty, stock_qty, sale_price, purchase_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURRENT_TIMESTAMP))
      ON CONFLICT(id) DO UPDATE SET
        product_id = excluded.product_id,
        sku = excluded.sku,
        ean = excluded.ean,
        purchase_price = excluded.purchase_price,
        purchase_qty = excluded.purchase_qty,
        stock_qty = excluded.stock_qty,
        sale_price = excluded.sale_price,
        purchase_date = COALESCE(excluded.purchase_date, purchase_date)
    `);
    
    stmt.run(
      id,
      item.product_id || null,
      item.sku,
      item.ean || null,
      item.purchase_price, // stocat in bani
      item.purchase_qty,
      item.stock_qty,
      item.sale_price, // stocat in bani
      item.purchase_date || null
    );
    
    return { success: true, id };
  } catch (e) {
    log(`addOrUpdatePortfolioItem Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}

export function deletePortfolioItem(id) {
  try {
    db.prepare('DELETE FROM my_portfolio WHERE id = ?').run(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// WATCHLIST
export function getWatchlist() {
  try {
    return db.prepare(`
      SELECT w.added_at, p.*, s.name as supplier_name,
             r.price_min, r.price_med, r.price_max, r.sellers_count, r.rating, r.reviews_count,
             r.competition_score, r.demand_score, r.opportunity_score, r.verdict
      FROM watchlist w
      JOIN products p ON w.product_id = p.id
      JOIN suppliers s ON p.supplier_id = s.id
      LEFT JOIN emag_research r ON p.id = r.product_id
      ORDER BY w.added_at DESC
    `).all();
  } catch (e) {
    log(`getWatchlist Error: ${e.message}`);
    return [];
  }
}

export function toggleWatchlist(productId) {
  try {
    const existing = db.prepare('SELECT 1 FROM watchlist WHERE product_id = ?').get(productId);
    if (existing) {
      db.prepare('DELETE FROM watchlist WHERE product_id = ?').run(productId);
      return { success: true, inWatchlist: false };
    } else {
      db.prepare('INSERT INTO watchlist (product_id) VALUES (?)').run(productId);
      return { success: true, inWatchlist: true };
    }
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// DASHBOARD KPI STATS
export function getDashboardStats() {
  try {
    const productsCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
    const goodOpportunities = db.prepare(`
      SELECT COUNT(*) as count 
      FROM emag_research 
      WHERE verdict IN ('CUMPĂRĂ', 'FOARTE BUN')
    `).get().count;
    
    // Calculeaza marja medie si ROI mediu din portofoliul propriu
    const portfolio = db.prepare('SELECT purchase_price, sale_price, stock_qty FROM my_portfolio').all();
    let totalCost = 0;
    let totalRevenue = 0;
    let totalItems = 0;
    
    portfolio.forEach(item => {
      // In bani
      const cost = item.purchase_price * item.stock_qty;
      const rev = item.sale_price * item.stock_qty;
      totalCost += cost;
      totalRevenue += rev;
      totalItems += item.stock_qty;
    });
    
    const profitBrut = totalRevenue - totalCost;
    const marjaMedie = totalRevenue > 0 ? (profitBrut / totalRevenue) * 100 : 0;
    const roiMediu = totalCost > 0 ? (profitBrut / totalCost) * 100 : 0;
    
    // Produse cu concurenta mica
    const lowCompetition = db.prepare(`
      SELECT COUNT(*) as count 
      FROM emag_research 
      WHERE competition_level IN ('FOARTE MICĂ', 'MICĂ')
    `).get().count;
    
    // Top 5 Oportunitati (Opportunity Score maxim)
    const topOpportunities = db.prepare(`
      SELECT p.id, p.name, p.price_supplier, s.name as supplier_name,
             r.opportunity_score, r.verdict, r.price_med
      FROM products p
      JOIN suppliers s ON p.supplier_id = s.id
      JOIN emag_research r ON p.id = r.product_id
      ORDER BY r.opportunity_score DESC
      LIMIT 5
    `).all();
    
    return {
      productsCount,
      goodOpportunities,
      marjaMedie: parseFloat(marjaMedie.toFixed(2)),
      roiMediu: parseFloat(roiMediu.toFixed(2)),
      lowCompetition,
      profitPotential: profitBrut, // in bani
      topOpportunities
    };
  } catch (e) {
    log(`getDashboardStats Error: ${e.message}`);
    return {
      productsCount: 0,
      goodOpportunities: 0,
      marjaMedie: 0,
      roiMediu: 0,
      lowCompetition: 0,
      profitPotential: 0,
      topOpportunities: []
    };
  }
}

// BACKUP & RESTORE DATABASE
export function backupDatabase(destPath) {
  try {
    fs.copyFileSync(dbPath, destPath);
    log(`Backup created successfully at: ${destPath}`);
    return { success: true };
  } catch (e) {
    log(`Backup Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}

export function restoreDatabase(srcPath) {
  try {
    if (!fs.existsSync(srcPath)) {
      return { success: false, error: 'Fișierul de backup nu există.' };
    }
    
    // Inchide conexiunea curenta
    if (db) {
      db.close();
    }
    
    // Face restore prin copiere peste db path
    fs.copyFileSync(srcPath, dbPath);
    
    // Redeschide database
    db = new DatabaseSync(dbPath);
    db.exec('PRAGMA foreign_keys = ON;');
    
    log(`Database restored successfully from: ${srcPath}`);
    return { success: true };
  } catch (e) {
    log(`Restore Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}

export function saveRealtimeResearch(productId, r) {
  try {
    // 1. Gasim produsul pentru a-i afla pretul de achizitie si categoria
    const product = db.prepare('SELECT price_supplier, category FROM products WHERE id = ?').get(productId);
    if (!product) {
      return { success: false, error: 'Produsul nu a fost găsit în baza de date.' };
    }

    const purchasePrice = product.price_supplier; // in bani

    // 2. Extragem ponderile setate din settings
    const weightsRow = db.prepare("SELECT value FROM settings WHERE key = 'opportunity_weights'").get();
    const weights = weightsRow ? JSON.parse(weightsRow.value) : {
      profitability: 0.30,
      demand: 0.25,
      competition: 0.25,
      marketOpportunity: 0.10,
      risk: 0.10
    };

    // 3. Extragem comisionul eMAG pe categorii din settings
    const commsRow = db.prepare("SELECT value FROM settings WHERE key = 'emag_commissions'").get();
    const comms = commsRow ? JSON.parse(commsRow.value) : {};
    const commissionPercent = comms[product.category] || comms['Default'] || 15;

    // Convertim preturile eMAG primite din lei in bani
    const priceMinBani = Math.round(r.price_min * 100);
    const priceMedBani = Math.round(r.price_med * 100);
    const priceMaxBani = Math.round(r.price_max * 100);
    const sellersCount = parseInt(r.sellers_count) || 3;
    const rating = parseFloat(r.rating) || 0;
    const reviewsCount = parseInt(r.reviews_count) || 0;

    // 4. Calcul Scor CERE (Demand Score - D)
    let demandScore = Math.min(100, Math.round(Math.log10(reviewsCount + 1) * 40));
    if (rating > 0) {
      demandScore = Math.min(100, Math.round(demandScore * (rating / 5)));
    }

    // 5. Calcul Scor COMPETIȚIE (Competition Score - C)
    const competitionScore = Math.min(100, (sellersCount * 10) + 10);
    const competitionLevel = sellersCount <= 2 ? 'FOARTE MICĂ' : 
                             (sellersCount <= 4 ? 'MICĂ' : 
                             (sellersCount <= 7 ? 'MEDIE' : 'MARE'));

    // 6. Calcul Scor PROFITABILITATE (Profitability Score - P)
    // ROI = (Profit / Pret Achizitie) * 100
    // Profit = Pret Vanzare (fara TVA 19% si fara comision eMAG) - Pret Achizitie - Alte costuri estimative (ex: 15 RON transport + 1.5 RON ambalaj)
    const tvaVanzare = Math.round((priceMedBani * 19) / 119); // 19% TVA din pretul brut
    const comisionEmag = Math.round((priceMedBani * commissionPercent) / 100);
    const costuriLogistice = 1500 + 150; // 15 RON transport + 1.5 RON ambalaj
    
    // Profit brut in bani
    const estimatedProfit = priceMedBani - purchasePrice - comisionEmag - tvaVanzare - costuriLogistice;
    const roi = purchasePrice > 0 ? (estimatedProfit / purchasePrice) * 100 : 0;
    
    let profitabilityScore = 0;
    if (roi >= 50) profitabilityScore = 100;
    else if (roi >= 35) profitabilityScore = 85;
    else if (roi >= 20) profitabilityScore = 60;
    else if (roi >= 5) profitabilityScore = 30;
    else profitabilityScore = 0;

    // 7. Calcul Oportunitate de Piață (Market Opportunity - M)
    const priceSpread = priceMinBani > 0 ? ((priceMaxBani - priceMinBani) / priceMinBani) * 100 : 0;
    const marketOpportunity = Math.min(100, Math.max(10, Math.round(priceSpread)));

    // 8. Calcul Scor RISC (Risk Score - R)
    let riskScore = 20; // risc de baza
    if (rating > 0 && rating < 4.2) riskScore += 30;
    if (sellersCount > 5) riskScore += 20;
    if (roi < 15) riskScore += 30;
    riskScore = Math.min(100, Math.max(10, riskScore));

    // 9. Calcul Scor OPORTUNITATE GLOBAL
    const opportunityScore = Math.round(
      demandScore * weights.demand +
      (100 - competitionScore) * weights.competition +
      profitabilityScore * weights.profitability +
      marketOpportunity * weights.marketOpportunity +
      (100 - riskScore) * weights.risk
    );

    // 10. Verdict
    let verdict = 'NU MERITĂ';
    if (opportunityScore >= 75) verdict = 'CUMPĂRĂ';
    else if (opportunityScore >= 60) verdict = 'FOARTE BUN';
    else if (opportunityScore >= 45) verdict = 'RISC MEDIU';

    // 11. Generare Argumente & Riscuri
    const rationales = [];
    if (roi > 30) rationales.push(`Rentabilitate excelentă cu un ROI estimat de ${Math.round(roi)}%.`);
    if (demandScore > 65) rationales.push("Cerere puternică pe eMAG bazată pe recenzii active ale clienților.");
    if (sellersCount <= 3) rationales.push(`Competiție redusă pe eMAG (doar ${sellersCount} vânzători activi).`);
    if (rating >= 4.5) rationales.push(`Satisfacție ridicată a clienților pentru acest produs (${rating} ⭐).`);
    if (rationales.length === 0) rationales.push("Produs cu marjă de profit stabilă.");

    const risks = [];
    if (rating > 0 && rating < 4.2) risks.push(`Calitate slabă semnalată de clienți (${rating} ⭐). Risc crescut de retur.`);
    if (sellersCount >= 8) risks.push(`Piață aglomerată cu ${sellersCount} competitori. Risc ridicat de război al prețurilor.`);
    if (roi < 15) risks.push("Marjă de siguranță mică. Orice cost neprevăzut poate anula profitul.");
    if (risks.length === 0) risks.push("Nu s-au detectat riscuri majore pe piața eMAG.");

    // 12. Salvare în baza de date emag_research
    const stmt = db.prepare(`
      INSERT INTO emag_research (
        product_id, price_min, price_med, price_max, sellers_count, rating, reviews_count,
        competition_level, competition_score, demand_score, opportunity_score, verdict, rationale, risks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(product_id) DO UPDATE SET
        price_min = excluded.price_min,
        price_med = excluded.price_med,
        price_max = excluded.price_max,
        sellers_count = excluded.sellers_count,
        rating = excluded.rating,
        reviews_count = excluded.reviews_count,
        competition_level = excluded.competition_level,
        competition_score = excluded.competition_score,
        demand_score = excluded.demand_score,
        opportunity_score = excluded.opportunity_score,
        verdict = excluded.verdict,
        rationale = excluded.rationale,
        risks = excluded.risks,
        updated_at = CURRENT_TIMESTAMP
    `);

    stmt.run(
      productId,
      priceMinBani,
      priceMedBani,
      priceMaxBani,
      sellersCount,
      rating,
      reviewsCount,
      competitionLevel,
      competitionScore,
      demandScore,
      opportunityScore,
      verdict,
      JSON.stringify(rationales),
      JSON.stringify(risks)
    );

    // Inregistram pretul mediu eMAG in istoricul de preturi
    db.prepare('INSERT INTO price_history (product_id, price_type, price) VALUES (?, ?, ?)')
      .run(productId, 'emag', priceMedBani);

    log(`Realtime research saved for product ID: ${productId}. Opportunity Score: ${opportunityScore}, Verdict: ${verdict}`);
    return { success: true, opportunityScore, verdict };
  } catch (e) {
    log(`saveRealtimeResearch Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}

export function executeRawSql(sql) {
  try {
    return db.prepare(sql).all();
  } catch (e) {
    log(`executeRawSql Error: ${e.message}`);
    throw e;
  }
}

export function getAlerts() {
  try {
    return db.prepare('SELECT a.*, p.name as product_name FROM alerts a LEFT JOIN products p ON a.product_id = p.id ORDER BY a.created_at DESC').all();
  } catch (e) {
    log(`getAlerts Error: ${e.message}`);
    return [];
  }
}

export function markAlertAsRead(id) {
  try {
    db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(id);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

export function addAlert(productId, type, message) {
  try {
    const id = 'alert_' + Math.random().toString(36).substr(2, 9);
    db.prepare('INSERT INTO alerts (id, product_id, type, message) VALUES (?, ?, ?, ?)')
      .run(id, productId, type, message);
    return { success: true, id };
  } catch (e) {
    log(`addAlert Error: ${e.message}`);
    return { success: false, error: e.message };
  }
}
