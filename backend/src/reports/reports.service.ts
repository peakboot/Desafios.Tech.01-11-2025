import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { QueryParamsDto } from './dto/query-params.dto';

// --- Nossas Interfaces de Resultado ---
export interface KpiResult {
  totalRevenue: number;
  avgTicket: number;
  totalSales: number;
  cancelRate: number;
}
export interface RevenueOverTimePoint {
  date: string;
  revenue: number;
}
export interface TopProductResult {
  productId: number;
  name: string;
  totalSold: number;
  totalRevenue: number;
}
export interface StoreComparisonResult {
  storeId: number;
  name: string;
  value: number;
}
// --- Fim das Interfaces ---

// --- NOVAS INTERFACES V2 (Para os filtros) ---
export interface ChannelResult {
  id: number;
  name: string;
}

export interface StoreResult {
  id: number;
  name: string;
}
// --- Fim das Novas Interfaces ---

@Injectable()
export class ReportsService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  /**
   * CONSTRUTOR DE QUERIES DINÂMICAS (ATUALIZADO PARA V2 - CORREÇÃO $1, $2)
   *
   * Constrói a cláusula WHERE e os parâmetros como um ARRAY de valores.
   */
  private buildWhereClauses(
    queryParams: QueryParamsDto,
    alias: string = 's',
  ): [string[], any[]] {
    const whereClauses: string[] = [];
    const params: any[] = [];
    let paramIndex = 1; // Começa o contador de placeholders em $1

    // Filtro de Data
    if (queryParams.startDate) {
      whereClauses.push(`${alias}.created_at >= $${paramIndex++}`);
      params.push(`${queryParams.startDate} 00:00:00`);
    }
    if (queryParams.endDate) {
      whereClauses.push(`${alias}.created_at <= $${paramIndex++}`);
      params.push(`${queryParams.endDate} 23:59:59`);
    }

    // Filtro de Canal
    if (queryParams.channelIds && queryParams.channelIds.length > 0) {
      // CORREÇÃO: Usando $1, $2, etc. e passando um array de valores
      whereClauses.push(`${alias}.channel_id = ANY($${paramIndex++})`);
      params.push(queryParams.channelIds);
    }

    // Filtro de Loja
    if (queryParams.storeIds && queryParams.storeIds.length > 0) {
      whereClauses.push(`${alias}.store_id = ANY($${paramIndex++})`);
      params.push(queryParams.storeIds);
    }

    // Filtro de Dia da Semana
    if (queryParams.dayOfWeek && queryParams.dayOfWeek.length > 0) {
      whereClauses.push(
        `EXTRACT(DOW FROM ${alias}.created_at) = ANY($${paramIndex++})`,
      );
      params.push(queryParams.dayOfWeek);
    }

    return [whereClauses, params];
  }

  /**
   * Etapa 3: Lógica para buscar os KPIs (Atualizado para V2)
   */
  async getKpis(queryParams: QueryParamsDto): Promise<KpiResult> {
    // 1. Constrói os filtros
    const [whereClauses, params] = this.buildWhereClauses(queryParams, 's');

    // 2. Constrói a query SQL
    const query = `
      SELECT
        COALESCE(SUM(CASE WHEN s.sale_status_desc = 'COMPLETED' THEN s.total_amount ELSE 0 END), 0) AS "totalRevenue",
        COALESCE(AVG(CASE WHEN s.sale_status_desc = 'COMPLETED' THEN s.total_amount ELSE NULL END), 0) AS "avgTicket",
        COALESCE(COUNT(CASE WHEN s.sale_status_desc = 'COMPLETED' THEN 1 ELSE NULL END), 0) AS "totalSales",
        COALESCE(
          SUM(CASE WHEN s.sale_status_desc = 'CANCELED' THEN 1 ELSE 0 END)
          /
          NULLIF(COUNT(s.id), 0)::float,
        0) AS "cancelRate"
      FROM sales s
      ${whereClauses.length > 0 ? 'WHERE ' + whereClauses.join(' AND ') : ''}
    `;

    console.log('Executando Query de KPIs (V2):', query, params);

    // 3. Executa a query (passando o ARRAY de parâmetros)
    const result = await this.entityManager.query(query, params);

    const rawResult = result[0];
    return {
      totalRevenue: parseFloat(rawResult.totalRevenue),
      avgTicket: parseFloat(rawResult.avgTicket),
      totalSales: parseInt(rawResult.totalSales, 10),
      cancelRate: parseFloat(rawResult.cancelRate),
    };
  }

  /**
   * ETAPA 4: Faturamento ao Longo do Tempo (Atualizado para V2)
   */
  async getRevenueOverTime(
    queryParams: QueryParamsDto,
  ): Promise<RevenueOverTimePoint[]> {
    const { startDate, endDate } = queryParams;

    // 1. Define o período padrão
    const defaultInterval = '30 days';
    let dateParams: any[] = [];
    let dateIndex = 1;

    const startDateSql = queryParams.startDate
      ? `$${dateIndex++}`
      : `(NOW() - INTERVAL '${defaultInterval}')::date`;
    if (queryParams.startDate)
      dateParams.push(`${queryParams.startDate} 00:00:00`);

    const endDateSql = queryParams.endDate ? `$${dateIndex++}` : `NOW()::date`;
    if (queryParams.endDate)
      dateParams.push(`${queryParams.endDate} 23:59:59`);

    // 2. Constrói os filtros
    const [whereClauses, whereParams] = this.buildWhereClauses(queryParams, 's');
    whereClauses.push(`s.sale_status_desc = 'COMPLETED'`);

    // 3. Constrói a query SQL
    const query = `
      WITH AllDays AS (
        SELECT generate_series(
          (${startDateSql})::date,
          (${endDateSql})::date,
          '1 day'::interval
        )::date AS date
      ),
      DailyRevenue AS (
        SELECT
          DATE_TRUNC('day', s.created_at)::date AS date,
          SUM(s.total_amount) AS revenue
        FROM sales s
        -- CORREÇÃO: Os placeholders ($1, $2...) precisam ser ajustados
        -- A função buildWhereClauses agora recomeça em $1
        -- Precisamos somar o número de parâmetros de data
        WHERE ${whereClauses
          .map((clause) =>
            clause.replace(
              /\$(\d+)/g,
              (_, n) => `$${parseInt(n, 10) + dateParams.length}`,
            ),
          )
          .join(' AND ')}
        GROUP BY 1
      )
      SELECT
        TO_CHAR(ad.date, 'YYYY-MM-DD') AS date,
        COALESCE(dr.revenue, 0) AS revenue
      FROM AllDays ad
      LEFT JOIN DailyRevenue dr ON ad.date = dr.date
      ORDER BY ad.date ASC;
    `;

    // Combina os parâmetros de data com os parâmetros de filtro
    const allParams = [...dateParams, ...whereParams];

    console.log('Executando Query de Faturamento (V2):', query, allParams);

    // 4. Executa a query
    const result = await this.entityManager.query(query, allParams);
    return result.map((r: any) => ({
      date: r.date,
      revenue: parseFloat(r.revenue),
    }));
  }

  /**
   * ETAPA 5: Top 10 Produtos (Atualizado para V2)
   */
  async getTopProducts(
    queryParams: QueryParamsDto,
  ): Promise<TopProductResult[]> {
    // 1. Constrói os filtros
    const [whereClauses, params] = this.buildWhereClauses(queryParams, 's');
    whereClauses.push(`s.sale_status_desc = 'COMPLETED'`);

    // 2. Constrói a query SQL
    const query = `
      SELECT
        p.id AS "productId",
        p.name AS "name",
        SUM(ps.quantity) AS "totalSold",
        SUM(ps.total_price) AS "totalRevenue"
      FROM product_sales ps
      JOIN sales s ON s.id = ps.sale_id
      JOIN products p ON p.id = ps.product_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY p.id, p.name
      ORDER BY "totalRevenue" DESC
      LIMIT 10;
    `;

    console.log('Executando Query Top Produtos (V2):', query, params);

    // 3. Executa a query
    const result = await this.entityManager.query(query, params);
    return result.map((r: any) => ({
      ...r,
      totalSold: parseInt(r.totalSold, 10),
      totalRevenue: parseFloat(r.totalRevenue),
    }));
  }

  /**
   * ETAPA 6: Comparativo de Lojas (Atualizado para V2)
   */
  async getStoreComparison(
    queryParams: QueryParamsDto,
  ): Promise<StoreComparisonResult[]> {
    // 1. Constrói os filtros
    const [whereClauses, params] = this.buildWhereClauses(queryParams, 's');
    whereClauses.push(`s.sale_status_desc = 'COMPLETED'`);

    // 2. Constrói a query SQL
    const query = `
      SELECT
        st.id AS "storeId",
        st.name AS "name",
        SUM(s.total_amount) AS "value"
      FROM sales s
      JOIN stores st ON st.id = s.store_id
      WHERE ${whereClauses.join(' AND ')}
      GROUP BY st.id, st.name
      ORDER BY "value" DESC;
    `;

    console.log('Executando Query Comparativo Lojas (V2):', query, params);

    // 3. Executa a query
    const result = await this.entityManager.query(query, params);
    return result.map((r: any) => ({
      ...r,
      value: parseFloat(r.value),
    }));
  }

  // --- NOVOS MÉTODOS V2 (Para os filtros) ---

  /**
   * V2 - Busca todos os canais para popular o dropdown
   */
  async getChannels(): Promise<ChannelResult[]> {
    const query = `SELECT id, name FROM channels ORDER BY name ASC;`;
    console.log('Executando Query getChannels (V2):', query);
    return this.entityManager.query(query);
  }

  /**
   * V2 - Busca todas as lojas para popular o dropdown
   */
  async getStores(): Promise<StoreResult[]> {
    const query = `SELECT id, name FROM stores ORDER BY name ASC;`;
    console.log('Executando Query getStores (V2):', query);
    return this.entityManager.query(query);
  }
}

