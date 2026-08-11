const { contextBridge, ipcRenderer } = require('electron');

// Expose secure, whitelisted IPC channels to the React UI
contextBridge.exposeInMainWorld('api', {
  getDbStats: () => ipcRenderer.invoke('get-db-stats'),
  getSettings: (key) => ipcRenderer.invoke('get-settings', key),
  saveSettings: (key, value) => ipcRenderer.invoke('save-settings', key, value),
  getSuppliers: () => ipcRenderer.invoke('get-suppliers'),
  updateSupplierStatus: (id, enabled) => ipcRenderer.invoke('update-supplier-status', id, enabled),
  addSupplier: (name, website, currency) => ipcRenderer.invoke('add-supplier', name, website, currency),
  getProducts: (filters) => ipcRenderer.invoke('get-products', filters),
  getProductDetails: (id) => ipcRenderer.invoke('get-product-details', id),
  addOrUpdateProduct: (product) => ipcRenderer.invoke('add-or-update-product', product),
  deleteProduct: (id) => ipcRenderer.invoke('delete-product', id),
  saveResearch: (productId, research) => ipcRenderer.invoke('save-research', productId, research),
  getPortfolio: () => ipcRenderer.invoke('get-portfolio'),
  addOrUpdatePortfolioItem: (item) => ipcRenderer.invoke('add-or-update-portfolio-item', item),
  deletePortfolioItem: (id) => ipcRenderer.invoke('delete-portfolio-item', id),
  getWatchlist: () => ipcRenderer.invoke('get-watchlist'),
  toggleWatchlist: (productId) => ipcRenderer.invoke('toggle-watchlist', productId),
  backupDatabase: (destPath) => ipcRenderer.invoke('backup-database', destPath),
  restoreDatabase: (srcPath) => ipcRenderer.invoke('restore-database', srcPath),
  openLogsFolder: () => ipcRenderer.invoke('open-logs-folder'),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  searchEmag: (query) => ipcRenderer.invoke('search-emag', query),
  saveRealtimeResearch: (productId, research) => ipcRenderer.invoke('save-realtime-research', productId, research),
  askAi: (question) => ipcRenderer.invoke('ask-ai', question),
  searchSuppliersLive: (query) => ipcRenderer.invoke('search-suppliers-live', query),
  getAlerts: () => ipcRenderer.invoke('get-alerts'),
  markAlertRead: (id) => ipcRenderer.invoke('mark-alert-read', id),
  testEmagConnection: (config) => ipcRenderer.invoke('test-emag-connection', config),
  syncEmagProducts: (config) => ipcRenderer.invoke('sync-emag-products', config),
  exportProductsExcel: (products) => ipcRenderer.invoke('export-products-excel', products),
  exportProductsXml: (products) => ipcRenderer.invoke('export-products-xml', products),
  onBackgroundAlert: (callback) => {
    const subscription = (event, value) => callback(value);
    ipcRenderer.on('background-alert', subscription);
    return () => ipcRenderer.removeListener('background-alert', subscription);
  },
  checkActivation: () => ipcRenderer.invoke('check-activation'),
  activateApp: (key) => ipcRenderer.invoke('activate-app', key),
  deactivateApp: () => ipcRenderer.invoke('deactivate-app'),
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadAndInstallUpdate: (url) => ipcRenderer.invoke('download-and-install-update', url),
  onUpdateProgress: (callback) => {
    const subscription = (event, value) => callback(value);
    ipcRenderer.on('update-progress', subscription);
    return () => ipcRenderer.removeListener('update-progress', subscription);
  }
});
