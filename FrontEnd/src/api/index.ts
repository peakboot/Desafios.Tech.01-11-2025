import axios from 'axios';
import type {
  KpiResponse,
  RevenueOverTimePoint,
  TopProduct,
  StoreComparison,
  Channel, // <-- V2: Importa o novo tipo
  Store, // <-- V2: Importa o novo tipo
} from '../types'; // Caminho relativo
import type { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

// --- V2: Interface para todos os filtros ---
// Isso combina o DateRange com os novos filtros de ID
export interface ReportFilters {
  date: DateRange | undefined;
  channelIds: number[] | undefined;
  storeIds: number[] | undefined;
  dayOfWeek: number[] | undefined;
}
// --- Fim da V2 ---

// Base URL da nossa API NestJS real
const API_URL = 'http://localhost:3000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
});

/**
 * V2 - Converte o objeto de Filtros (do frontend) em parâmetros de string
 * que o nosso backend (QueryParamsDto) espera.
 */
const filtersToParams = (filters: ReportFilters) => {
  const params = new URLSearchParams();

  // 1. Filtro de Data
  if (filters.date?.from) {
    params.append('startDate', format(filters.date.from, 'yyyy-MM-dd'));
  }
  if (filters.date?.to) {
    params.append('endDate', format(filters.date.to, 'yyyy-MM-dd'));
  }

  // 2. Filtro de Canal (ex: channelIds=1,2,3)
  if (filters.channelIds && filters.channelIds.length > 0) {
    params.append('channelIds', filters.channelIds.join(','));
  }

  // 3. Filtro de Loja
  if (filters.storeIds && filters.storeIds.length > 0) {
    params.append('storeIds', filters.storeIds.join(','));
  }

  // 4. Filtro de Dia da Semana
  if (filters.dayOfWeek && filters.dayOfWeek.length > 0) {
    params.append('dayOfWeek', filters.dayOfWeek.join(','));
  }

  return params;
};

/**
 * V2: Atualizado para aceitar todos os filtros
 */
export const getKpis = async (
  filters: ReportFilters,
): Promise<KpiResponse> => {
  console.log('Chamando API REAL para KPIs com filtros...', filters);
  const params = filtersToParams(filters);
  const response = await apiClient.get('/reports/kpis', { params });
  return response.data;
};

/**
 * V2: Atualizado para aceitar todos os filtros
 */
export const getRevenueOverTime = async (
  filters: ReportFilters,
): Promise<RevenueOverTimePoint[]> => {
  console.log('Chamando API REAL para Faturamento com filtros...', filters);
  const params = filtersToParams(filters);
  const response = await apiClient.get('/reports/revenue-over-time', {
    params,
  });
  return response.data;
};

/**
 * V2: Atualizado para aceitar todos os filtros
 */
export const getTopProducts = async (
  filters: ReportFilters,
): Promise<TopProduct[]> => {
  console.log('Chamando API REAL para Top Produtos com filtros...', filters);
  const params = filtersToParams(filters);
  const response = await apiClient.get('/reports/top-products', { params });
  return response.data;
};

/**
 * V2: Atualizado para aceitar todos os filtros
 */
export const getStoreComparison = async (
  filters: ReportFilters,
): Promise<StoreComparison[]> => {
  console.log('Chamando API REAL para Lojas com filtros...', filters);
  const params = filtersToParams(filters);
  const response = await apiClient.get('/reports/store-comparison', { params });
  return response.data;
};

// --- V2: Novas funções para buscar as listas de filtros ---

/**
 * V2 - Busca a lista de Canais
 */
export const getChannels = async (): Promise<Channel[]> => {
  console.log('Buscando lista de Canais...');
  const response = await apiClient.get('/reports/channels');
  return response.data;
};

/**
 * V2 - Busca a lista de Lojas
 */
export const getStores = async (): Promise<Store[]> => {
  console.log('Buscando lista de Lojas...');
  const response = await apiClient.get('/reports/stores');
  return response.data;
};

