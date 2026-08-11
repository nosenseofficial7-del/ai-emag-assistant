import https from 'https';
import { addOrUpdateProduct, addOrUpdatePortfolioItem } from './database.js';

/**
 * Tests connection to the eMAG Marketplace Partner API.
 * @param {object} config API credentials (username, password, url)
 * @returns {Promise<object>} Connection success status
 */
export function testEmagConnection(config) {
  return new Promise((resolve) => {
    const username = config.username;
    const password = config.password;
    const apiUrl = config.url || 'https://marketplace-api.emag.ro/api-3/';

    // Demo Mode bypass
    if (!username || username.trim() === '' || username === 'demo') {
      return setTimeout(() => resolve({ success: true, mode: 'demo' }), 800);
    }

    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const urlObj = new URL(`${apiUrl.replace(/\/$/, '')}/product_offer/read`);

    const options = {
      method: 'POST',
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ success: true, mode: 'live' });
        } else {
          resolve({ success: false, error: `eMAG API returned status ${res.statusCode}: ${body.substring(0, 100)}` });
        }
      });
    });

    req.on('error', (e) => {
      resolve({ success: false, error: `Conexiune eșuată: ${e.message}` });
    });
    
    req.on('timeout', () => {
      req.destroy();
      resolve({ success: false, error: 'Conexiune expirată (Timeout 10s)' });
    });

    req.write(JSON.stringify({ limit: 1 }));
    req.end();
  });
}

/**
 * Syncs active products from eMAG Marketplace Partner account.
 * @param {object} config API credentials
 * @returns {Promise<object>} Sync stats and status
 */
export function syncEmagProducts(config) {
  return new Promise((resolve, reject) => {
    const username = config.username;
    const password = config.password;
    const apiUrl = config.url || 'https://marketplace-api.emag.ro/api-3/';

    // Fallback: Demo Mode Synchronization
    if (!username || username.trim() === '' || username === 'demo') {
      return setTimeout(() => {
        try {
          const demoOffers = [
            {
              name: "Casti Wireless Lenovo Thinkplus LP40 Pro",
              sku: "LEN-TH-LP40",
              ean: "6973038681122",
              brand: "Lenovo",
              category: "Electronice",
              price_supplier: 3500, // 35.00 RON
              sale_price: 9900, // 99.00 RON (eMAG price)
              stock: 45,
              imageUrl: "https://s13emagst.akamaized.net/products/42065/42064112/images/res_5694a12368c7b80f1de26acdc992bd09.png"
            },
            {
              name: "Ceas Smartwatch Xiaomi Redmi Watch 3 Active",
              sku: "XIA-RW-3",
              ean: "6941812727112",
              brand: "Xiaomi",
              category: "Electronice",
              price_supplier: 12000, // 120.00 RON
              sale_price: 29900, // 299.00 RON
              stock: 20,
              imageUrl: "https://s13emagst.akamaized.net/products/55940/55939223/images/res_a765fae81d7f70c2fbda666753b1a2ff.jpg"
            },
            {
              name: "Camera Supraveghere Wi-Fi Exterior PTZ Full HD",
              sku: "CAM-WIFI-OUT",
              ean: "5949000115566",
              brand: "OEM",
              category: "Home & Deco",
              price_supplier: 7500, // 75.00 RON
              sale_price: 18900, // 189.00 RON
              stock: 35,
              imageUrl: "https://s13emagst.akamaized.net/products/49112/49111342/images/res_26addb98c8361da5c12de3adc992bd09.png"
            },
            {
              name: "Incarcator Fast Charger USB-C 20W PD",
              sku: "CHG-20W-PD",
              ean: "5949000117788",
              brand: "OEM",
              category: "Electronice",
              price_supplier: 1200, // 12.00 RON
              sale_price: 4900, // 49.00 RON
              stock: 150,
              imageUrl: "https://s13emagst.akamaized.net/products/51123/51122112/images/res_eda574e48b1f10c5b86da5b04c2a35c8.jpg"
            }
          ];

          let count = 0;
          for (const offer of demoOffers) {
            // 1. Add as B2B product under "eMAG Store" supplier category
            const prodRes = addOrUpdateProduct({
              supplier_id: 'sup_maxy', // use maxy B2B supplier as fallback
              name: offer.name,
              sku: offer.sku,
              ean: offer.ean,
              brand: offer.brand,
              category: offer.category,
              price_supplier: offer.price_supplier,
              stock_supplier: offer.stock,
              image_url: offer.imageUrl,
              url_supplier: `https://maxy.ro/search?type=product&q=${offer.sku}`
            });

            if (prodRes.success && prodRes.id) {
              // 2. Add to seller's live portfolio
              addOrUpdatePortfolioItem({
                product_id: prodRes.id,
                sku: offer.sku,
                ean: offer.ean,
                purchase_price: offer.price_supplier,
                purchase_qty: offer.stock,
                stock_qty: offer.stock,
                sale_price: offer.sale_price
              });
              count++;
            }
          }

          resolve({ success: true, count, mode: 'demo' });
        } catch (e) {
          reject(e);
        }
      }, 1000);
    }

    // Live eMAG API Call
    const auth = Buffer.from(`${username}:${password}`).toString('base64');
    const urlObj = new URL(`${apiUrl.replace(/\/$/, '')}/product_offer/read`);

    const options = {
      method: 'POST',
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      timeout: 20000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode !== 200) {
          return reject(new Error(`eMAG API returned status ${res.statusCode}`));
        }

        try {
          const parsed = JSON.parse(body);
          const offers = parsed.results || [];
          let count = 0;

          for (const offer of offers) {
            // Map eMAG offer format to local schema
            // eMAG fields usually include: part_number (EAN/SKU), name, sale_price, stock (object containing active quantity)
            const sku = offer.id || offer.part_number || `EMG-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            const name = offer.name || `Produs eMAG Listing ${sku}`;
            const priceVal = Math.round((offer.sale_price || 0) * 100); // convert RON to cents
            const stockQty = offer.stock?.[0]?.quantity || 0;

            const prodRes = addOrUpdateProduct({
              supplier_id: 'sup_maxy', // Map B2B supplier
              name: name,
              sku: sku,
              ean: offer.ean || null,
              brand: offer.brand || 'Nespecificat',
              category: 'Electronice',
              price_supplier: Math.round(priceVal * 0.5), // estimate supplier price at 50% for initial catalog
              stock_supplier: stockQty + 10,
              image_url: ''
            });

            if (prodRes.success && prodRes.id) {
              addOrUpdatePortfolioItem({
                product_id: prodRes.id,
                sku: sku,
                ean: offer.ean || null,
                purchase_price: Math.round(priceVal * 0.5),
                purchase_qty: stockQty,
                stock_qty: stockQty,
                sale_price: priceVal
              });
              count++;
            }
          }

          resolve({ success: true, count, mode: 'live' });

        } catch (err) {
          reject(new Error(`Eroare parsare JSON eMAG API: ${err.message}`));
        }
      });
    });

    req.on('error', err => reject(err));
    req.write(JSON.stringify({ limit: 100 }));
    req.end();
  });
}
