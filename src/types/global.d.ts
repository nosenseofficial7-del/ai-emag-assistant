export interface DbStatus {
  success: boolean;
  dbPath: string;
  userDataPath: string;
  record: {
    id: number;
    test_key: string;
    test_value: string;
    run_count: number;
    updated_at: string;
  };
}

export interface ElectronAPI {
  getDbStatus: () => Promise<DbStatus>;
  getDbStats: () => Promise<any>;
  getSettings: (key: string) => Promise<any>;
  saveSettings: (key: string, value: any) => Promise<any>;
  getSuppliers: () => Promise<any>;
  updateSupplierStatus: (id: string, enabled: boolean) => Promise<any>;
  addSupplier: (name: string, website?: string, currency: string) => Promise<any>;
  getProducts: (filters: any) => Promise<any>;
  getProductDetails: (id: string) => Promise<any>;
  addOrUpdateProduct: (product: any) => Promise<any>;
  deleteProduct: (id: string) => Promise<any>;
  saveResearch: (productId: string, research: any) => Promise<any>;
  getPortfolio: () => Promise<any>;
  addOrUpdatePortfolioItem: (item: any) => Promise<any>;
  deletePortfolioItem: (id: string) => Promise<any>;
  getWatchlist: () => Promise<any>;
  toggleWatchlist: (productId: string) => Promise<any>;
  backupDatabase: (destPath: string) => Promise<any>;
  restoreDatabase: (srcPath: string) => Promise<any>;
  openLogsFolder: () => Promise<any>;
  showSaveDialog: (options: any) => Promise<any>;
  showOpenDialog: (options: any) => Promise<any>;
  searchEmag: (query: string) => Promise<any>;
  saveRealtimeResearch: (productId: string, research: any) => Promise<any>;
  askAi: (question: string) => Promise<any>;
  searchSuppliersLive: (query: string) => Promise<any>;
  getAlerts: () => Promise<any>;
  markAlertRead: (id: string) => Promise<any>;
  testEmagConnection: (config: any) => Promise<any>;
  syncEmagProducts: (config: any) => Promise<any>;
  exportProductsExcel: (products: any[]) => Promise<any>;
  exportProductsXml: (products: any[]) => Promise<any>;
  onBackgroundAlert: (callback: (alert: any) => void) => () => void;
  checkActivation: () => Promise<any>;
  activateApp: (key: string) => Promise<any>;
}

declare global {
  interface Window {
    api: ElectronAPI;
  }
}
