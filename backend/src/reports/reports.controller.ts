import {
  Controller,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { QueryParamsDto } from './dto/query-params.dto';
// Importa *todos* os tipos de resultado
import type {
  KpiResult,
  RevenueOverTimePoint,
  TopProductResult,
  StoreComparisonResult,
  ChannelResult, // <-- V2 ADICIONADO
  StoreResult, // <-- V2 ADICIONADO
} from './reports.service';

@Controller('reports') // Define o prefixo da rota: /api/v1/reports
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  /**
   * Etapa 3: Endpoint para KPIs
   * Rota: GET /api/v1/reports/kpis
   */
  @Get('kpis')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getKpis(@Query() queryParams: QueryParamsDto): Promise<KpiResult> {
    console.log(`Recebida requisição para /kpis com params:`, queryParams);
    return this.reportsService.getKpis(queryParams);
  }

  /**
   * Etapa 4: Endpoint para Faturamento ao Longo do Tempo
   * Rota: GET /api/v1/reports/revenue-over-time
   */
  @Get('revenue-over-time')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getRevenueOverTime(
    @Query() queryParams: QueryParamsDto,
  ): Promise<RevenueOverTimePoint[]> {
    console.log(
      `Recebida requisição para /revenue-over-time com params:`,
      queryParams,
    );
    return this.reportsService.getRevenueOverTime(queryParams);
  }

  /**
   * ETAPA 5: Endpoint para Top 10 Produtos
   * Rota: GET /api/v1/reports/top-products
   */
  @Get('top-products')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getTopProducts(
    @Query() queryParams: QueryParamsDto,
  ): Promise<TopProductResult[]> {
    console.log(
      `Recebida requisição para /top-products com params:`,
      queryParams,
    );
    return this.reportsService.getTopProducts(queryParams);
  }

  /**
   * ETAPA 6: Endpoint para Comparativo de Lojas
   * Rota: GET /api/v1/reports/store-comparison
   */
  @Get('store-comparison')
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStoreComparison(
    @Query() queryParams: QueryParamsDto,
  ): Promise<StoreComparisonResult[]> {
    console.log(
      `Recebida requisição para /store-comparison com params:`,
      queryParams,
    );
    return this.reportsService.getStoreComparison(queryParams);
  }

  // --- NOVOS ENDPOINTS V2 (Para os filtros) ---

  /**
   * V2 - Endpoint para buscar os Canais
   * Rota: GET /api/v1/reports/channels
   */
  @Get('channels')
  async getChannels(): Promise<ChannelResult[]> {
    console.log('Recebida requisição para /channels');
    return this.reportsService.getChannels();
  }

  /**
   * V2 - Endpoint para buscar as Lojas
   * Rota: GET /api/v1/reports/stores
   */
  @Get('stores')
  async getStores(): Promise<StoreResult[]> {
    console.log('Recebida requisição para /stores');
    return this.reportsService.getStores();
  }
}

