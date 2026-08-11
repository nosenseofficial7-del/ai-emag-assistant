import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Importă serviciile bazei de date
import {
  initDatabase,
  getSettings,
  saveSettings,
  getSuppliers,
  updateSupplierStatus,
  addSupplier,
  getProducts,
  getProductDetails,
  deleteProduct,
  addOrUpdateProduct,
  saveResearch,
  getPortfolio,
  addOrUpdatePortfolioItem,
  deletePortfolioItem,
  getWatchlist,
  toggleWatchlist,
  getDashboardStats,
  backupDatabase,
  restoreDatabase,
  saveRealtimeResearch,
  getAlerts,
  markAlertAsRead,
  addAlert
} from './database.js';

import { searchEmag, searchAllSuppliersLive } from './scraper.js';
import { askAi } from './ai.js';
import { testEmagConnection, syncEmagProducts } from './emagApi.js';
import { exportToExcel, exportToXml } from './exportService.js';
import { validateKey } from './activation.js';
import { checkForUpdates, downloadAndInstallUpdate } from './updater.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow = null;
const userDataPath = app.getPath('userData');
const logPath = path.join(userDataPath, 'app.log');

// Log logger local
function writeLog(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [MAIN] ${message}\n`;
  try {
    fs.appendFileSync(logPath, logMessage);
  } catch (e) {
    console.error('Failed to write log file:', e);
  }
  console.log(message);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "AI eMAG Assistant",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const isDev = !app.isPackaged;
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Previne titlul paginii web să suprascrie titlul ferestrei desktop
  mainWindow.on('page-title-updated', (e) => {
    e.preventDefault();
  });

  // Deschide link-urile externe (target="_blank") în browserul implicit al sistemului
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Înregistrare Handlers IPC
function registerIpcHandlers() {
  // Dashboard & Bază de date
  ipcMain.handle('get-db-stats', async () => {
    writeLog('IPC Call: get-db-stats');
    return getDashboardStats();
  });

  // Setări
  ipcMain.handle('get-settings', async (event, key) => {
    writeLog(`IPC Call: get-settings for key: ${key}`);
    return getSettings(key);
  });

  ipcMain.handle('save-settings', async (event, key, value) => {
    writeLog(`IPC Call: save-settings for key: ${key}`);
    return saveSettings(key, value);
  });

  // Furnizori
  ipcMain.handle('get-suppliers', async () => {
    writeLog('IPC Call: get-suppliers');
    return getSuppliers();
  });

  ipcMain.handle('update-supplier-status', async (event, id, enabled) => {
    writeLog(`IPC Call: update-supplier-status [id=${id}, enabled=${enabled}]`);
    return updateSupplierStatus(id, enabled);
  });

  ipcMain.handle('add-supplier', async (event, name, website, currency) => {
    writeLog(`IPC Call: add-supplier [name=${name}]`);
    return addSupplier(name, website, currency);
  });

  // Produse
  ipcMain.handle('get-products', async (event, filters) => {
    writeLog(`IPC Call: get-products with filters: ${JSON.stringify(filters)}`);
    return getProducts(filters);
  });

  ipcMain.handle('get-product-details', async (event, id) => {
    writeLog(`IPC Call: get-product-details [id=${id}]`);
    return getProductDetails(id);
  });

  ipcMain.handle('add-or-update-product', async (event, product) => {
    writeLog(`IPC Call: add-or-update-product [sku=${product.sku}]`);
    return addOrUpdateProduct(product);
  });

  ipcMain.handle('delete-product', async (event, id) => {
    writeLog(`IPC Call: delete-product [id=${id}]`);
    return deleteProduct(id);
  });

  ipcMain.handle('save-research', async (event, productId, research) => {
    writeLog(`IPC Call: save-research [productId=${productId}]`);
    return saveResearch(productId, research);
  });

  // Portofoliu
  ipcMain.handle('get-portfolio', async () => {
    writeLog('IPC Call: get-portfolio');
    return getPortfolio();
  });

  ipcMain.handle('add-or-update-portfolio-item', async (event, item) => {
    writeLog(`IPC Call: add-or-update-portfolio-item [sku=${item.sku}]`);
    return addOrUpdatePortfolioItem(item);
  });

  ipcMain.handle('delete-portfolio-item', async (event, id) => {
    writeLog(`IPC Call: delete-portfolio-item [id=${id}]`);
    return deletePortfolioItem(id);
  });

  // Watchlist
  ipcMain.handle('get-watchlist', async () => {
    writeLog('IPC Call: get-watchlist');
    return getWatchlist();
  });

  ipcMain.handle('toggle-watchlist', async (event, productId) => {
    writeLog(`IPC Call: toggle-watchlist [productId=${productId}]`);
    return toggleWatchlist(productId);
  });

  // Utilitare Windows (Backup, Restaurare, File Dialogs, Logs folder)
  ipcMain.handle('backup-database', async (event, destPath) => {
    writeLog(`IPC Call: backup-database to: ${destPath}`);
    return backupDatabase(destPath);
  });

  ipcMain.handle('restore-database', async (event, srcPath) => {
    writeLog(`IPC Call: restore-database from: ${srcPath}`);
    const result = restoreDatabase(srcPath);
    if (result.success && mainWindow) {
      // Reload window pentru a împrospăta datele în UI după restaurare
      mainWindow.reload();
    }
    return result;
  });

  ipcMain.handle('open-logs-folder', async () => {
    writeLog('IPC Call: open-logs-folder');
    try {
      await shell.openPath(userDataPath);
      return { success: true };
    } catch (e) {
      writeLog(`Error opening logs folder: ${e.message}`);
      return { success: false, error: e.message };
    }
  });

  // Dialogs
  ipcMain.handle('show-save-dialog', async (event, options) => {
    writeLog('IPC Call: show-save-dialog');
    return dialog.showSaveDialog(mainWindow, options);
  });

  ipcMain.handle('show-open-dialog', async (event, options) => {
    writeLog('IPC Call: show-open-dialog');
    return dialog.showOpenDialog(mainWindow, options);
  });

  // eMAG Scraper & Real-time research
  ipcMain.handle('search-emag', async (event, query) => {
    writeLog(`IPC Call: search-emag for query: ${query}`);
    try {
      const results = await searchEmag(query);
      return { success: true, results };
    } catch (e) {
      writeLog(`Error in search-emag: ${e.message}`);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('search-suppliers-live', async (event, query) => {
    writeLog(`IPC Call: search-suppliers-live for query: ${query}`);
    try {
      const results = await searchAllSuppliersLive(query);
      return { success: true, results };
    } catch (e) {
      writeLog(`Error in search-suppliers-live: ${e.message}`);
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('save-realtime-research', async (event, productId, research) => {
    writeLog(`IPC Call: save-realtime-research [productId=${productId}]`);
    return saveRealtimeResearch(productId, research);
  });

  ipcMain.handle('ask-ai', async (event, question) => {
    writeLog(`IPC Call: ask-ai question: ${question}`);
    return askAi(question);
  });

  ipcMain.handle('get-alerts', async () => {
    return getAlerts();
  });

  ipcMain.handle('mark-alert-read', async (event, id) => {
    return markAlertAsRead(id);
  });

  ipcMain.handle('test-emag-connection', async (event, config) => {
    return testEmagConnection(config);
  });

  ipcMain.handle('sync-emag-products', async (event, config) => {
    return syncEmagProducts(config);
  });

  ipcMain.handle('export-products-excel', async (event, products) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Exportă produse în format eMAG Excel',
      defaultPath: path.join(app.getPath('downloads'), 'catalog-emag.xlsx'),
      filters: [{ name: 'Excel Spreadsheets', extensions: ['xlsx'] }]
    });

    if (!filePath) return { success: false, error: 'Export anulat' };
    return exportToExcel(products, filePath);
  });

  ipcMain.handle('export-products-xml', async (event, products) => {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      title: 'Exportă feed produse XML',
      defaultPath: path.join(app.getPath('downloads'), 'feed-produse.xml'),
      filters: [{ name: 'XML Files', extensions: ['xml'] }]
    });

    if (!filePath) return { success: false, error: 'Export anulat' };
    return exportToXml(products, filePath);
  });

  ipcMain.handle('check-activation', async () => {
    try {
      const activation = await getSettings('activation_key');
      if (!activation) return { activated: false };
      const isValid = validateKey(activation.key);
      return { activated: isValid };
    } catch (e) {
      return { activated: false };
    }
  });

  ipcMain.handle('activate-app', async (event, key) => {
    try {
      const isValid = validateKey(key);
      if (!isValid) return { success: false, error: 'Codul de activare este invalid sau corupt.' };
      
      await saveSettings('activation_key', { key: key.trim().toUpperCase() });
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('deactivate-app', async () => {
    try {
      await saveSettings('activation_key', null);
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle('check-for-updates', async () => {
    try {
      return await checkForUpdates();
    } catch (e) {
      return { hasUpdate: false, error: e.message };
    }
  });

  ipcMain.handle('download-and-install-update', async (event, url, options) => {
    try {
      return await downloadAndInstallUpdate(mainWindow, url, options);
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
}

app.whenReady().then(() => {
  writeLog('=== MAIN PROCESS INITIATING ===');
  
  // Inițializează baza de date locală SQLite
  initDatabase();
  
  // Înregistrează canalele IPC
  registerIpcHandlers();
  
  // Creează fereastra principală
  createWindow();
  
  // Pornire daemon monitorizare fundal
  startBackgroundDaemon(mainWindow);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

let daemonInterval = null;

function startBackgroundDaemon(win) {
  if (daemonInterval) clearInterval(daemonInterval);

  // Prima rulare după 8 secunde, apoi din 5 în 5 minute
  setTimeout(() => runDaemonCheck(win), 8000);
  daemonInterval = setInterval(() => runDaemonCheck(win), 5 * 60 * 1000);
}

async function runDaemonCheck(win) {
  writeLog('Daemon: Pornesc scanarea de fundal pentru stocuri B2B și pierderi Buybox...');
  
  try {
    const portfolio = getPortfolio();
    if (!portfolio || portfolio.length === 0) {
      writeLog('Daemon: Portofoliu gol, nimic de verificat.');
      return;
    }

    for (const item of portfolio) {
      if (!item.product_id) continue;

      // 1. Verificare Buybox: Cere prețuri live de pe eMAG
      try {
        const emagRes = await searchEmag(item.product_name || item.sku);
        if (emagRes && emagRes.length > 0) {
          const lowestEmagPrice = Math.min(...emagRes.map(p => p.price));
          const lowestEmagCents = Math.round(lowestEmagPrice * 100);

          if (item.sale_price > lowestEmagCents) {
            const diff = (item.sale_price - lowestEmagCents) / 100;
            const existingAlerts = getAlerts();
            const hasDuplicate = existingAlerts.some(a => a.product_id === item.product_id && a.type === 'buybox_loss' && a.is_read === 0);
            
            if (!hasDuplicate) {
              const msg = `Ai pierdut Buybox-ul pentru produsul "${item.product_name}". Prețul tău este de ${(item.sale_price / 100).toFixed(2)} RON, dar cel mai ieftin competitor vinde cu ${lowestEmagPrice.toFixed(2)} RON (diferență: -${diff.toFixed(2)} RON).`;
              addAlert(item.product_id, 'buybox_loss', msg);
              writeLog(`Daemon Alert: Buybox pierdut pentru ${item.product_name}`);
              
              if (win && !win.isDestroyed()) {
                win.webContents.send('background-alert', { type: 'buybox_loss', product_name: item.product_name, message: msg });
              }
            }
          }
        }
      } catch (err) {
        writeLog(`Daemon Error verificare Buybox pentru ${item.sku}: ${err.message}`);
      }

      // 2. Verificare stoc critic B2B la furnizor
      try {
        if (item.sku) {
          const supplierRes = await searchMaxy(item.sku);
          if (supplierRes && supplierRes.length > 0) {
            const matched = supplierRes[0];
            
            // Daca stocul este 0, adaugam alerta de stoc critic
            if (matched.price_supplier === 0 || matched.price_supplier === undefined) {
              const existingAlerts = getAlerts();
              const hasDuplicate = existingAlerts.some(a => a.product_id === item.product_id && a.type === 'stock_critical' && a.is_read === 0);
              
              if (!hasDuplicate) {
                const msg = `Stoc critic la furnizorul B2B pentru produsul "${item.product_name}". Stocul a fost epuizat.`;
                addAlert(item.product_id, 'stock_critical', msg);
                
                if (win && !win.isDestroyed()) {
                  win.webContents.send('background-alert', { type: 'stock_critical', product_name: item.product_name, message: msg });
                }
              }
            }
          }
        }
      } catch (err) {
        writeLog(`Daemon Error verificare stoc B2B pentru ${item.sku}: ${err.message}`);
      }
    }
  } catch (e) {
    writeLog(`Daemon Check General Error: ${e.message}`);
  }
}

app.on('window-all-closed', () => {
  writeLog('=== WINDOWS CLOSED ===');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
