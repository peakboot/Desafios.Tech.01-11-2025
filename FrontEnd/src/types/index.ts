// --- Tipos do MVP (V1) ---

// Resposta para o endpoint GET /kpis
export interface KpiResponse {
  totalRevenue: number;
  avgTicket: number;
  totalSales: number;
  cancelRate: number;
}

// Resposta para o endpoint GET /reports/revenue-over-time
export interface RevenueOverTimePoint {
  date: string; // Formato YYYY-MM-DD
  revenue: number;
}

// Resposta para o endpoint GET /reports/top-products
export interface TopProduct {
  productId: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
}

// Resposta para o endpoint GET /reports/store-comparison
export interface StoreComparison {
  storeId: number;
  name: string;
  value: number; // O valor é o faturamento
}

// --- NOVOS Tipos da V2 (Para os Filtros) ---

// Resposta para o endpoint GET /reports/channels
export interface Channel {
  id: number;
  name: string;
}

// Resposta para o endpoint GET /reports/stores
export interface Store {
  id: number;
  name: string;
}

