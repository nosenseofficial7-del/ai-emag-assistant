export interface TranslationSet {
  // Navigation / Sidebar
  navDashboard: string;
  navProducts: string;
  navHunter: string;
  navSuppliers: string;
  navEmag: string;
  navPortfolio: string;
  navWatchlist: string;
  navAi: string;
  navImport: string;
  navCalculator: string;
  navSettings: string;
  navChangelog: string;
  statusOnline: string;
  statusOffline: string;
  versionLabel: string;
  storageLabel: string;
  copyrightLabel: string;

  // Dashboard
  dashTitle: string;
  dashSubtitle: string;
  statTotalProducts: string;
  statGoodOpp: string;
  statAvgMargin: string;
  statAvgRoi: string;
  statLowComp: string;
  statPotentialProfit: string;
  statTopOpp: string;
  statNoResearch: string;
  oppScoreLabel: string;

  // Products
  prodTitle: string;
  prodSubtitle: string;
  btnImportCatalog: string;
  btnExportExcel: string;
  btnExportXml: string;
  filterTitle: string;
  filterSearch: string;
  filterSupplier: string;
  filterCategory: string;
  filterVerdict: string;
  filterAllSuppliers: string;
  filterAllCategories: string;
  filterAllVerdicts: string;
  tableColWatch: string;
  tableColName: string;
  tableColSku: string;
  tableColEan: string;
  tableColSupplier: string;
  tableColBuy: string;
  tableColSell: string;
  tableColRoi: string;
  tableColOpp: string;
  tableColVerdict: string;
  tableColActions: string;
  badgeNoResearch: string;
  actionDetails: string;
  actionDelete: string;

  // Product Details
  detailsBack: string;
  detailsSupplierLink: string;
  detailsDescription: string;
  detailsMoq: string;
  detailsStockSupp: string;
  detailsOppRationale: string;
  detailsOppRisks: string;
  detailsNoRationale: string;
  detailsNoRisks: string;
  detailsCalcTitle: string;
  detailsCalcDesc: string;
  detailsInputCost: string;
  detailsInputSell: string;
  detailsInputVat: string;
  detailsInputComm: string;
  detailsInputSuppShip: string;
  detailsInputClientShip: string;
  detailsInputPack: string;
  detailsInputMark: string;
  detailsInputOther: string;
  detailsInputReturn: string;
  detailsOutVatSale: string;
  detailsOutVatSupp: string;
  detailsOutProfit: string;
  detailsOutMargin: string;
  detailsOutRoi: string;
  detailsQuickAddTitle: string;
  detailsQuickAddQty: string;
  detailsQuickAddBtn: string;
  detailsPriceTrendTitle: string;
  detailsPriceTrendDesc: string;
  detailsPriceTrendEmag: string;
  detailsPriceTrendSupp: string;

  // Portfolio
  portTitle: string;
  portSubtitle: string;
  btnSyncEmag: string;
  msgSyncing: string;
  alertStockTitle: string;
  alertStockDesc: string;
  alertDeadTitle: string;
  alertDeadDesc: string;
  alertBuyboxTitle: string;
  alertB2BStockTitle: string;
  btnHide: string;
  tableColTotalInvest: string;
  tableColQty: string;
  tableColDate: string;
  badgeGoodStock: string;
  badgeLowStock: string;

  // AI Assistant
  aiTitle: string;
  aiSubtitle: string;
  aiEngineLabel: string;
  aiWelcome: string;
  aiSuggestedTitle: string;
  aiInfoTitle: string;
  aiInfoDesc: string;
  aiSettingsTip: string;
  aiPlaceholder: string;
  aiThinking: string;
  btnShowSql: string;
  btnHideSql: string;
  btnImportSourced: string;
  badgeImported: string;

  // Settings
  setWeightsTitle: string;
  setWeightsDesc: string;
  setWeightsProfit: string;
  setWeightsDemand: string;
  setWeightsComp: string;
  setWeightsMarket: string;
  setWeightsRisk: string;
  btnSaveWeights: string;
  setCommTitle: string;
  setCommDesc: string;
  setCommColCat: string;
  setCommColVal: string;
  setCommColAct: string;
  setCommNewCatPlace: string;
  btnSaveComm: string;
  setAiTitle: string;
  setAiDesc: string;
  setAiProvider: string;
  setAiKey: string;
  setAiEndpoint: string;
  setAiModel: string;
  btnSaveAi: string;
  setEmagTitle: string;
  setEmagDesc: string;
  setEmagUrl: string;
  setEmagUser: string;
  setEmagPass: string;
  btnSaveEmag: string;
  btnTestEmag: string;
  setDbTitle: string;
  setDbDesc: string;
  setDbBackupTitle: string;
  setDbBackupDesc: string;
  btnDbBackup: string;
  setDbRestoreTitle: string;
  setDbRestoreDesc: string;
  btnDbRestore: string;
  setDbLogsTitle: string;
  setDbLogsDesc: string;
  btnDbLogs: string;

  // Changelog
  changelogTitle: string;
  changelogDesc: string;

  // Activation
  actTitle: string;
  actDesc: string;
  actLabel: string;
  actBtn: string;
  actErrorLen: string;
  actErrorInvalid: string;
}

export const translations: Record<'ro' | 'en', TranslationSet> = {
  ro: {
    navDashboard: "Tablou de Bord",
    navProducts: "Produse & Analiza",
    navHunter: "Product Hunter",
    navSuppliers: "Furnizori",
    navEmag: "Cercetare eMAG",
    navPortfolio: "Produsele mele",
    navWatchlist: "Watchlist",
    navAi: "AI Assistant",
    navImport: "Import Excel/CSV",
    navCalculator: "Calculator Profit",
    navSettings: "Setari",
    navChangelog: "Jurnal Schimbari",
    statusOnline: "ONLINE",
    statusOffline: "OFFLINE",
    versionLabel: "Versiunea 1.7.4 (RO/EN)",
    storageLabel: "Stocare Locala SQLite",
    copyrightLabel: "Copyright: NoSense 2026",

    dashTitle: "Tablou de Bord (Dashboard)",
    dashSubtitle: "Prezentare generala a activitatii comerciale eMAG si oportunitatilor B2B.",
    statTotalProducts: "Total Produse Catalog",
    statGoodOpp: "Oportunitati Excelente",
    statAvgMargin: "Marja Medie Portofoliu",
    statAvgRoi: "ROI Mediu Portofoliu",
    statLowComp: "Competitie Scazuta",
    statPotentialProfit: "Profit Potential Estimat",
    statTopOpp: "Top 5 Oportunitati de Achizitie",
    statNoResearch: "Fara analiza realizata",
    oppScoreLabel: "Scor Oportunitate",

    prodTitle: "Catalog Produse & Analiza",
    prodSubtitle: "Gestioneaza produsele importate din cataloage si vizualizeaza rapoartele de oportunitate.",
    btnImportCatalog: "+ Importa Catalog",
    btnExportExcel: "Exporta Excel eMAG",
    btnExportXml: "Exporta XML Feed",
    filterTitle: "Filtreaza Rezultatele",
    filterSearch: "Cautare locala",
    filterSupplier: "Furnizor",
    filterCategory: "Categorie",
    filterVerdict: "Verdict AI",
    filterAllSuppliers: "Toti furnizorii",
    filterAllCategories: "Toate categoriile",
    filterAllVerdicts: "Toate verdictele",
    tableColWatch: "Urm.",
    tableColName: "Denumire Produs",
    tableColSku: "SKU",
    tableColEan: "EAN",
    tableColSupplier: "Furnizor",
    tableColBuy: "Pret Achiz.",
    tableColSell: "Pret eMAG",
    tableColRoi: "ROI",
    tableColOpp: "Opp Score",
    tableColVerdict: "Verdict",
    tableColActions: "Actiuni",
    badgeNoResearch: "Fara Analiza",
    actionDetails: "Detalii & Analiza",
    actionDelete: "Sterge",

    detailsBack: "Inapoi la lista",
    detailsSupplierLink: "Vezi produs la furnizor",
    detailsDescription: "Descriere:",
    detailsMoq: "MOQ",
    detailsStockSupp: "Stoc Furnizor",
    detailsOppRationale: "De ce merita cumparat? (Argumente)",
    detailsOppRisks: "Riscuri identificate",
    detailsNoRationale: "Date indisponibile pentru argumentare.",
    detailsNoRisks: "Nu au fost detectate riscuri majore.",
    detailsCalcTitle: "Calculator Profit Personalizat",
    detailsCalcDesc: "Efectueaza simulari logistice exacte in bani. Toate calculele sunt 100% sigure impotriva erorilor de precizie.",
    detailsInputCost: "Pret Achizitie (fara TVA):",
    detailsInputSell: "Pret Vanzare pe eMAG (cu TVA):",
    detailsInputVat: "Rata TVA produs (%):",
    detailsInputComm: "Comision eMAG Marketplace (%):",
    detailsInputSuppShip: "Cost transport la tine (RON/buc):",
    detailsInputClientShip: "Cost transport la client (Fulfillment/buc):",
    detailsInputPack: "Cost ambalaj/consumabile (RON/buc):",
    detailsInputMark: "Cost marketing/reclama (RON/buc):",
    detailsInputOther: "Alte costuri operationale (RON/buc):",
    detailsInputReturn: "Rata estimata de retur a produsului (%):",
    detailsOutVatSale: "TVA Vanzare colectata:",
    detailsOutVatSupp: "TVA Achizitie deductibila:",
    detailsOutProfit: "Profit Brut Estimativ / bucata:",
    detailsOutMargin: "Marja",
    detailsOutRoi: "ROI",
    detailsQuickAddTitle: "Adauga in Portofoliu (Produsele mele)",
    detailsQuickAddQty: "Cantitate:",
    detailsQuickAddBtn: "Adauga in Portofoliu",
    detailsPriceTrendTitle: "Istoric Evolutie Preturi (eMAG vs Furnizor)",
    detailsPriceTrendDesc: "Urmareste modificarile in timp ale pretului de achizitie de la furnizor si ale pretului mediu eMAG.",
    detailsPriceTrendEmag: "Pret Mediu eMAG (RON)",
    detailsPriceTrendSupp: "Pret Achizitie Furnizor (RON)",

    portTitle: "Produsele mele (Portofoliu)",
    portSubtitle: "Inventarul tau achizitionat. Urmareste profitul real, ratele de marja si stocul blocat.",
    btnSyncEmag: "Sincronizeaza cu eMAG Partner",
    msgSyncing: "Se conecteaza la eMAG Marketplace...",
    alertStockTitle: "Alerte Stoc Critic Local (Reaprovizionare):",
    alertStockDesc: "Urmatoarele produse necesita reaprovizionare imediata (stoc <= 3 buc):",
    alertDeadTitle: "Stoc Blocat / Dead Stock (>60 zile):",
    alertDeadDesc: "Capital blocat in produse cu vanzari lente (stoc nesoldat dupa 60+ zile):",
    alertBuyboxTitle: "Alerta eMAG Buybox pierdut:",
    alertB2BStockTitle: "Alerta Stoc Critic B2B Furnizor:",
    btnHide: "Ascunde",
    tableColTotalInvest: "Total Investit",
    tableColQty: "Cantitate (Initial / Stoc)",
    tableColDate: "Data Achizitie",
    badgeGoodStock: "ramase",
    badgeLowStock: "ramase",

    aiTitle: "Asistent Inteligenta Artificiala (Live RAG)",
    aiSubtitle: "Modulul conectat live la internet si la baza locala SQLite. AI-ul ruleaza interogari SQL reale pe datele tale.",
    aiEngineLabel: "Motor AI",
    aiWelcome: "Salut! Sunt asistentul tau AI eMAG. Am acces direct la baza de date locala SQLite si la internet pentru cautari live.\n\nAdreseaza-mi intrebari despre stocuri, oportunitati sau cere-mi sa caut produse noi in timp real! (ex: *\"Ce produse au profit peste 40 lei?\"* sau *\"cauta live casti wireless\"*).",
    aiSuggestedTitle: "Intrebari Sugerate:",
    aiInfoTitle: "Sistem AI RAG Activat",
    aiInfoDesc: "Asistentul utilizeaza interogari SQL automate transmise motorului de baza de date SQLite locala. Nicio data comerciala nu paraseste calculatorul tau, asigurand confidentialitatea datelor.",
    aiSettingsTip: "Sfat: Configureaza-ti o cheie API personalizata in ecranul Setari pentru a debloca modele LLM premium live.",
    aiPlaceholder: "Intreaba AI-ul (ex: Care sunt produsele cele mai recomandate?)...",
    aiThinking: "Asistentul AI traduce intrebarea in SQL si analizeaza datele...",
    btnShowSql: "Vezi interogare SQLite rulata",
    btnHideSql: "Ascunde interogare SQLite",
    btnImportSourced: "Importa",
    badgeImported: "Importat",

    setWeightsTitle: "Ponderi Scorul de Oportunitate",
    setWeightsDesc: "Ajusteaza importanta fiecarui factor in formula de calcul a scorului de oportunitate (suma trebuie sa fie exact 100%).",
    setWeightsProfit: "Profitabilitate (ROI) - Implicit: 30%",
    setWeightsDemand: "Cerere (Volum Review-uri) - Implicit: 25%",
    setWeightsComp: "Competitie (Numar Selleri) - Implicit: 25%",
    setWeightsMarket: "Oportunitate Piata - Implicit: 10%",
    setWeightsRisk: "Risc Scazut (Low Risk) - Implicit: 10%",
    btnSaveWeights: "Salveaza Ponderi Scor",
    setCommTitle: "Comisioane eMAG pe Categorie",
    setCommDesc: "Seteaza comisionul standard perceput de eMAG pentru calculele automate din Simulatorul de Profit.",
    setCommColCat: "Categorie",
    setCommColVal: "Comision (%)",
    setCommColAct: "Actiune",
    setCommNewCatPlace: "Categorie noua (ex: Gradina)",
    btnSaveComm: "Salveaza Comisioane",
    setAiTitle: "Setari Conector Asistent AI",
    setAiDesc: "Configureaza motorul LLM pentru Chat-ul RAG si cautarile automate in timp real.",
    setAiProvider: "Provider AI",
    setAiKey: "Cheie API (Secret Key)",
    setAiEndpoint: "Endpoint URL local Ollama",
    setAiModel: "Nume Model AI",
    btnSaveAi: "Salveaza Setari AI",
    setEmagTitle: "Configurare eMAG Partner API",
    setEmagDesc: "Sincronizeaza portofoliul si stocurile active direct din contul tau eMAG Marketplace.",
    setEmagUrl: "Endpoint API URL",
    setEmagUser: "API Username (de la eMAG Marketplace)",
    setEmagPass: "API Password",
    btnSaveEmag: "Salveaza Setari eMAG",
    btnTestEmag: "Testeaza Conexiune",
    setDbTitle: "Mentenanta & Date (SQLite Local)",
    setDbDesc: "Creeaza backup-uri periodice pentru a preveni pierderea datelor. Baza de date este complet salvata local.",
    setDbBackupTitle: "Backup Date",
    setDbBackupDesc: "Exporta baza de date locala SQLite intr-un fisier separat pentru siguranta.",
    btnDbBackup: "Creeaza Backup (.db)",
    setDbRestoreTitle: "Restaurare Date",
    setDbRestoreDesc: "Restaureaza un backup anterior. Actiunea va suprascrie datele actuale.",
    btnDbRestore: "Restaureaza Backup",
    setDbLogsTitle: "Log-uri Sistem",
    setDbLogsDesc: "Vizualizeaza istoricul operatiunilor, importurilor si erorilor bazei de date local.",
    btnDbLogs: "Deschide folderul de log-uri",

    changelogTitle: "Jurnal Actualizari (Update Logs)",
    changelogDesc: "Istoricul versiunilor si functionalitatilor implementate in AI eMAG Assistant.",

    actTitle: "Activare AI eMAG Assistant",
    actDesc: "Aceasta aplicatie este protejata de licenta comerciala. Te rugam sa introduci codul de acces primit de la dezvoltator (format: XXXX-XXXX-XXXX-XXXX).",
    actLabel: "Cod de Acces Licenta (Product Key)",
    actBtn: "Valideaza si Activeaza",
    actErrorLen: "Te rugam sa introduci un cod de activare complet de 16 caractere.",
    actErrorInvalid: "Codul de activare este invalid sau corupt."
  },
  en: {
    navDashboard: "Dashboard",
    navProducts: "Products & Analysis",
    navHunter: "Product Hunter",
    navSuppliers: "Suppliers",
    navEmag: "eMAG Research",
    navPortfolio: "My Portfolio",
    navWatchlist: "Watchlist",
    navAi: "AI Assistant",
    navImport: "Excel/CSV Import",
    navCalculator: "Profit Calculator",
    navSettings: "Settings",
    navChangelog: "Changelog",
    statusOnline: "ONLINE",
    statusOffline: "OFFLINE",
    versionLabel: "Version 1.7.4 (RO/EN)",
    storageLabel: "Local SQLite Storage",
    copyrightLabel: "Copyright: NoSense 2026",

    dashTitle: "Commercial Dashboard",
    dashSubtitle: "General overview of your active eMAG marketplace sales and B2B opportunities.",
    statTotalProducts: "Total Catalog Products",
    statGoodOpp: "Excellent Opportunities",
    statAvgMargin: "Average Portfolio Margin",
    statAvgRoi: "Average Portfolio ROI",
    statLowComp: "Low Competition Listings",
    statPotentialProfit: "Estimated Potential Profit",
    statTopOpp: "Top 5 Sourcing Opportunities",
    statNoResearch: "No analysis performed yet",
    oppScoreLabel: "Opportunity Score",

    prodTitle: "Product Catalog & Analysis",
    prodSubtitle: "Manage imported catalogs and view calculated opportunity scoring reports.",
    btnImportCatalog: "+ Import Catalog",
    btnExportExcel: "Export eMAG Excel",
    btnExportXml: "Export XML Feed",
    filterTitle: "Filter Results",
    filterSearch: "Local search",
    filterSupplier: "Supplier",
    filterCategory: "Category",
    filterVerdict: "AI Verdict",
    filterAllSuppliers: "All suppliers",
    filterAllCategories: "All categories",
    filterAllVerdicts: "All verdicts",
    tableColWatch: "Watch",
    tableColName: "Product Title",
    tableColSku: "SKU",
    tableColEan: "EAN",
    tableColSupplier: "Supplier",
    tableColBuy: "Buy Price",
    tableColSell: "eMAG Price",
    tableColRoi: "ROI",
    tableColOpp: "Opp Score",
    tableColVerdict: "Verdict",
    tableColActions: "Actions",
    badgeNoResearch: "No Research",
    actionDetails: "Details & Analysis",
    actionDelete: "Delete",

    detailsBack: "Back to catalog",
    detailsSupplierLink: "View product at supplier",
    detailsDescription: "Description:",
    detailsMoq: "MOQ",
    detailsStockSupp: "Supplier Stock",
    detailsOppRationale: "Sourcing Rationale (Pros)",
    detailsOppRisks: "Identified Sourcing Risks",
    detailsNoRationale: "Data unavailable for rationale.",
    detailsNoRisks: "No major risks detected.",
    detailsCalcTitle: "Custom Profit Calculator",
    detailsCalcDesc: "Perform exact logistic simulations in cents. All calculations are 100% protected against floating-point errors.",
    detailsInputCost: "Purchase Price (excl. VAT):",
    detailsInputSell: "eMAG Retail Price (incl. VAT):",
    detailsInputVat: "Product VAT Rate (%):",
    detailsInputComm: "eMAG Marketplace Commission (%):",
    detailsInputSuppShip: "Inbound shipping (RON/unit):",
    detailsInputClientShip: "Outbound shipping (Fulfillment/unit):",
    detailsInputPack: "Packaging cost (RON/unit):",
    detailsInputMark: "Marketing/advertising cost (RON/unit):",
    detailsInputOther: "Other operational costs (RON/unit):",
    detailsInputReturn: "Estimated product return rate (%):",
    detailsOutVatSale: "Collected Output VAT:",
    detailsOutVatSupp: "Deductible Input VAT:",
    detailsOutProfit: "Estimated Gross Profit / unit:",
    detailsOutMargin: "Margin",
    detailsOutRoi: "ROI",
    detailsQuickAddTitle: "Add to Portfolio (My Products)",
    detailsQuickAddQty: "Quantity:",
    detailsQuickAddBtn: "Add to Portfolio",
    detailsPriceTrendTitle: "Price Evolution History (eMAG vs Supplier)",
    detailsPriceTrendDesc: "Track changes over time in supplier purchase costs and average eMAG retail prices.",
    detailsPriceTrendEmag: "Average eMAG Price (RON)",
    detailsPriceTrendSupp: "Supplier Cost (RON)",

    portTitle: "My Portfolio (My Products)",
    portSubtitle: "Your purchased active inventory. Track real profits, margin rates, and stagnant stock.",
    btnSyncEmag: "Sync with eMAG Partner",
    msgSyncing: "Connecting to eMAG Marketplace...",
    alertStockTitle: "Local Critical Stock Alerts (Restock):",
    alertStockDesc: "The following items require immediate restock (stock <= 3 units):",
    alertDeadTitle: "Dead Stock Alerts (>60 days):",
    alertDeadDesc: "Capital tied up in slow-moving inventory (unsold after 60+ days):",
    alertBuyboxTitle: "eMAG Buybox Lost Alert:",
    alertB2BStockTitle: "B2B Supplier Critical Stock Alert:",
    btnHide: "Hide",
    tableColTotalInvest: "Total Invested",
    tableColQty: "Quantity (Initial / Stock)",
    tableColDate: "Purchase Date",
    badgeGoodStock: "left",
    badgeLowStock: "left",

    aiTitle: "Artificial Intelligence Assistant (Live RAG)",
    aiSubtitle: "Connected live to the internet and your local SQLite database. The AI translates questions into real SQL queries.",
    aiEngineLabel: "AI Engine",
    aiWelcome: "Hello! I am your eMAG AI Assistant. I have direct access to your local SQLite database and the web for live sourcing searches.\n\nAsk me about stocks, margins, or instruct me to search for new products in real-time! (e.g. *\"Which products have profits over 40 lei?\"* or *\"search live for wireless headphones\"*).",
    aiSuggestedTitle: "Suggested Questions:",
    aiInfoTitle: "Active AI RAG System",
    aiInfoDesc: "The assistant automatically writes and executes SQL queries against your local SQLite database engine. Commercial data never leaves your computer, ensuring absolute privacy.",
    aiSettingsTip: "Tip: Add your custom API key in the Settings page to unlock premium LLM engines.",
    aiPlaceholder: "Ask the AI (e.g. Which products are most recommended?)...",
    aiThinking: "AI is translating question to SQL and analyzing database...",
    btnShowSql: "Show executed SQLite query",
    btnHideSql: "Hide SQLite query",
    btnImportSourced: "Import",
    badgeImported: "Imported",

    setWeightsTitle: "Opportunity Score Weights",
    setWeightsDesc: "Adjust the weight of each factor in the opportunity score algorithm (the sum must equal exactly 100%).",
    setWeightsProfit: "Profitability (ROI) - Default: 30%",
    setWeightsDemand: "Demand (Reviews volume) - Default: 25%",
    setWeightsComp: "Competition (Sellers count) - Default: 25%",
    setWeightsMarket: "Market Opportunity - Default: 10%",
    setWeightsRisk: "Low Risk - Default: 10%",
    btnSaveWeights: "Save Score Weights",
    setCommTitle: "eMAG Category Commissions",
    setCommDesc: "Set default commissions for each category to use in the profit calculator simulator.",
    setCommColCat: "Category",
    setCommColVal: "Commission (%)",
    setCommColAct: "Action",
    setCommNewCatPlace: "New Category (e.g. Garden)",
    btnSaveComm: "Save Commissions",
    setAiTitle: "AI Assistant Connector Settings",
    setAiDesc: "Configure the LLM engine for the RAG chat and real-time sourcing agents.",
    setAiProvider: "AI Provider",
    setAiKey: "API Key (Secret Key)",
    setAiEndpoint: "Ollama Local URL Endpoint",
    setAiModel: "AI Model Name",
    btnSaveAi: "Save AI Settings",
    setEmagTitle: "eMAG Partner API Configuration",
    setEmagDesc: "Synchronize active offers and stock levels directly from your eMAG Marketplace store account.",
    setEmagUrl: "Endpoint API URL",
    setEmagUser: "API Username (from eMAG Marketplace)",
    setEmagPass: "API Password",
    btnSaveEmag: "Save eMAG Settings",
    btnTestEmag: "Test Connection",
    setDbTitle: "Maintenance & Data (Local SQLite)",
    setDbDesc: "Generate periodic backups to prevent data loss. The database is saved completely locally on your computer.",
    setDbBackupTitle: "Backup Database",
    setDbBackupDesc: "Export the local SQLite database into a separate backup file for safety.",
    btnDbBackup: "Create Backup (.db)",
    setDbRestoreTitle: "Restore Database",
    setDbRestoreDesc: "Restore a previous backup file. This action will overwrite your current database.",
    btnDbRestore: "Restore Backup",
    setDbLogsTitle: "System Logs",
    setDbLogsDesc: "Open and view system operation logs, import reports, and SQLite errors locally.",
    btnDbLogs: "Open Logs Folder",

    changelogTitle: "Jurnal Actualizari (Update Logs)",
    changelogDesc: "Version history and features implemented in AI eMAG Assistant.",

    actTitle: "AI eMAG Assistant Activation",
    actDesc: "This application is protected by a commercial license. Please enter the access code received from the developer (format: XXXX-XXXX-XXXX-XXXX).",
    actLabel: "License Access Code (Product Key)",
    actBtn: "Validate and Activate",
    actErrorLen: "Please enter a complete 16-character activation code.",
    actErrorInvalid: "The activation code is invalid or corrupted."
  }
};
