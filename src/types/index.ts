export interface Supplier {
  id: string;
  name: string;
  website?: string;
  currency: string;
  enabled: number;
  created_at: string;
}

export interface Product {
  id: string;
  supplier_id: string;
  supplier_name?: string;
  name: string;
  sku: string;
  ean?: string;
  brand?: string;
  category?: string;
  description?: string;
  image_url?: string;
  price_supplier: number; // in bani (RON/EUR)
  currency: string;
  vat: number;
  moq: number;
  stock_supplier: number;
  url_supplier?: string;
  weight: number;
  dimensions?: string;
  created_at: string;
  
  // Research (joint)
  price_min?: number; // in bani
  price_med?: number; // in bani
  price_max?: number; // in bani
  sellers_count?: number;
  rating?: number;
  reviews_count?: number;
  competition_level?: string;
  competition_score?: number;
  demand_score?: number;
  opportunity_score?: number;
  verdict?: string;
  research?: any;
  inWatchlist?: boolean;
  priceHistory?: any[];
}

export interface Research {
  product_id: string;
  price_min?: number; // in bani
  price_med?: number; // in bani
  price_max?: number; // in bani
  sellers_count: number;
  rating: number;
  reviews_count: number;
  competition_level: 'FOARTE_MICA' | 'MICA' | 'MEDIE' | 'MARE' | 'FOARTE_MARE';
  competition_score: number; // 0-100
  demand_score: number; // 0-100
  opportunity_score: number; // 0-100
  verdict: 'CUMPĂRĂ' | 'FOARTE BUN' | 'RISC MEDIU' | 'NU MERITĂ';
  rationale: string[];
  risks: string[];
  updated_at?: string;
}

export interface PortfolioItem {
  id: string;
  product_id?: string;
  sku: string;
  ean?: string;
  purchase_price: number; // in bani
  purchase_qty: number;
  stock_qty: number;
  sale_price: number; // in bani
  purchase_date: string;
  
  // Joint product details
  product_name?: string;
  brand?: string;
  category?: string;
  image_url?: string;
  current_supplier_price?: number;
  current_supplier_stock?: number;
}

export interface DashboardStats {
  productsCount: number;
  goodOpportunities: number;
  marjaMedie: number;
  roiMediu: number;
  lowCompetition: number;
  profitPotential: number; // in bani
  topOpportunities: {
    id: string;
    name: string;
    price_supplier: number; // in bani
    supplier_name: string;
    opportunity_score: number;
    verdict: string;
    price_med?: number; // in bani
  }[];
}

export interface OpportunityWeights {
  profitability: number;
  demand: number;
  competition: number;
  marketOpportunity: number;
  risk: number;
}

export interface CategoryCommissions {
  [category: string]: number;
}
