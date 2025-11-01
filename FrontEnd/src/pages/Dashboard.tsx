import * as React from 'react';
// CORREÇÃO: Usando caminhos relativos
import { Button } from '../components/ui/button';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Download, XCircle } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { unparse } from 'papaparse'; // ETAPA 5: Importa o PapaParse

// --- Nossos componentes, tipos e API ---

// CORREÇÃO: Usando caminhos relativos
import type {
  KpiResponse,
  RevenueOverTimePoint,
  TopProduct,
  StoreComparison,
  Channel,
  Store,
} from '../types';
import type { ReportFilters } from '../api'; // V2: Importa a interface de filtros

// CORREÇÃO: Usando caminhos relativos
import {
  getKpis,
  getRevenueOverTime,
  getTopProducts,
  getStoreComparison,
  getChannels,
  getStores,
} from '../api';

// CORREÇÃO: Usando caminhos relativos
import { KpiCard } from '../components/KpiCard';
import { DateRangePicker } from '../components/DateRangePicker';
import { RevenueChart } from '../components/charts/RevenueChart';
import { TopProductsChart } from '../components/charts/TopProductsChart';
import { StoreComparisonChart } from '../components/charts/StoreComparisonChart';

export function Dashboard() {
  // --- V2: Estados dos Filtros ---
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });
  const [allChannels, setAllChannels] = React.useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = React.useState<string>();
  const [allStores, setAllStores] = React.useState<Store[]>([]);
  const [selectedStore, setSelectedStore] = React.useState<string>();

  // --- Estados de Dados e Loading (KPIs) ---
  const [kpis, setKpis] = React.useState<KpiResponse | null>(null);
  const [isLoadingKpis, setIsLoadingKpis] = React.useState(true);

  // --- Estados de Dados e Loading (Gráficos) ---
  const [revenueData, setRevenueData] = React.useState<
    RevenueOverTimePoint[] | null
  >(null);
  const [isLoadingRevenue, setIsLoadingRevenue] = React.useState(true);
  const [topProductsData, setTopProductsData] = React.useState<
    TopProduct[] | null
  >(null);
  const [isLoadingTopProducts, setIsLoadingTopProducts] = React.useState(true);
  const [storeComparisonData, setStoreComparisonData] = React.useState<
    StoreComparison[] | null
  >(null);
  const [isLoadingStoreComparison, setIsLoadingStoreComparison] =
    React.useState(true);

  // V2: Efeito para buscar as *listas* de filtros (Lojas e Canais)
  React.useEffect(() => {
    getChannels()
      .then(setAllChannels)
      .catch((err) =>
        console.error('Erro ao buscar lista de canais:', err),
      );
    getStores()
      .then(setAllStores)
      .catch((err) => console.error('Erro ao buscar lista de lojas:', err));
  }, []);

  // V2: Efeito principal para buscar os DADOS (KPIs e Gráficos)
  React.useEffect(() => {
    const filters: ReportFilters = {
      date: date,
      channelIds: selectedChannel ? [parseInt(selectedChannel, 10)] : undefined,
      storeIds: selectedStore ? [parseInt(selectedStore, 10)] : undefined,
      dayOfWeek: undefined,
    };

    setIsLoadingKpis(true);
    setIsLoadingRevenue(true);
    setIsLoadingTopProducts(true);
    setIsLoadingStoreComparison(true);

    getKpis(filters)
      .then(setKpis)
      .catch((err) => console.error('Erro ao buscar KPIs:', err))
      .finally(() => setIsLoadingKpis(false));

    getRevenueOverTime(filters)
      .then(setRevenueData)
      .catch((err) => console.error('Erro ao buscar Faturamento:', err))
      .finally(() => setIsLoadingRevenue(false));

    getTopProducts(filters)
      .then(setTopProductsData)
      .catch((err) => console.error('Erro ao buscar Top Produtos:', err))
      .finally(() => setIsLoadingTopProducts(false));

    getStoreComparison(filters)
      .then(setStoreComparisonData)
      .catch((err) => console.error('Erro ao buscar Lojas:', err))
      .finally(() => setIsLoadingStoreComparison(false));
  }, [date, selectedChannel, selectedStore]);

  // --- Funções de Formatação ---
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatPercentage = (value: number) => {
    return (value * 100).toFixed(1).replace('.', ',') + '%';
  };

  // --- V2: Funções para limpar os filtros ---
  const clearFilters = () => {
    setDate({
      from: addDays(new Date(), -30),
      to: new Date(),
    });
    setSelectedChannel(undefined);
    setSelectedStore(undefined);
  };
  const hasActiveFilters = selectedChannel || selectedStore;

  // --- ETAPA 5: Função de Exportar (Atualizada para V2) ---

  // Função auxiliar para o download
  // CORREÇÃO: Definida apenas UMA vez
  const downloadCSV = (csvContent: string, fileName: string) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Função principal de exportação
  const handleExport = () => {
    if (!kpis || !revenueData || !topProductsData || !storeComparisonData) {
      console.warn('Dados ainda carregando, exportação cancelada.');
      return;
    }

    const kpisData = [
      { Metrica: 'Faturamento Total', Valor: formatCurrency(kpis.totalRevenue) },
      { Metrica: 'Ticket Médio', Valor: formatCurrency(kpis.avgTicket) },
      { Metrica: 'Vendas Totais', Valor: kpis.totalSales },
      { Metrica: 'Taxa de Cancelamento', Valor: formatPercentage(kpis.cancelRate) },
    ];

    const revenueCsv = unparse(
      revenueData.map((item) => ({
        Data: item.date,
        Faturamento: item.revenue,
      })),
    );

    const productsCsv = unparse(
      topProductsData.map((item) => ({
        Produto: item.name,
        'Total Vendido': item.totalSold,
        'Faturamento Total': item.totalRevenue,
      })),
    );

    const storesCsv = unparse(
      storeComparisonData.map((item) => ({
        Loja: item.name,
        Faturamento: item.value,
      })),
    );

    const kpisCsv = unparse(kpisData);

    const csvContent = [
      'Relatorio de KPIs',
      kpisCsv,
      '\n',
      'Faturamento ao Longo do Tempo',
      revenueCsv,
      '\n',
      'Top 10 Produtos',
      productsCsv,
      '\n',
      'Comparativo de Lojas',
      storesCsv,
    ].join('\n');

    downloadCSV(csvContent, 'relatorio_dashboard.csv');
  };

  // Verifica se *algum* dado está carregando
  const isGlobalLoading =
    isLoadingKpis ||
    isLoadingRevenue ||
    isLoadingTopProducts ||
    isLoadingStoreComparison;

  return (
    <div className="flex-col md:flex p-4 md:p-8">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard (V2)</h1>
        <div className="flex flex-wrap items-center justify-end space-x-2 w-full md:w-auto">
          {/* --- V2: NOVOS FILTROS --- */}
          <DateRangePicker date={date} onDateChange={setDate} />

          <Select
            value={selectedChannel}
            onValueChange={setSelectedChannel}
          >
            <SelectTrigger className="w-full sm:w-[180px] mt-2 sm:mt-0">
              <SelectValue placeholder="Todos os Canais" />
            </SelectTrigger>
            <SelectContent>
              {allChannels.map((channel) => (
                <SelectItem key={channel.id} value={String(channel.id)}>
                  {channel.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStore} onValueChange={setSelectedStore}>
            <SelectTrigger className="w-full sm:w-[180px] mt-2 sm:mt-0">
              <SelectValue placeholder="Todas as Lojas" />
            </SelectTrigger>
            <SelectContent>
              {allStores.map((store) => (
                <SelectItem key={store.id} value={String(store.id)}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="icon"
              onClick={clearFilters}
              title="Limpar filtros"
              className="mt-2 sm:mt-0"
            >
              <XCircle className="h-4 w-4" />
            </Button>
          )}

          <Button
            className="w-full sm:w-auto mt-2 sm:mt-0"
            onClick={handleExport}
            disabled={isGlobalLoading}
          >
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Grid principal do dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        {/* Linha 1: KPIs */}
        <KpiCard
          title="Faturamento Total"
          isLoading={isLoadingKpis}
          value={kpis ? formatCurrency(kpis.totalRevenue) : '...'}
        />
        <KpiCard
          title="Ticket Médio"
          isLoading={isLoadingKpis}
          value={kpis ? formatCurrency(kpis.avgTicket) : '...'}
        />
        <KpiCard
          title="Vendas Totais"
          isLoading={isLoadingKpis}
          value={kpis ? kpis.totalSales.toString() : '...'}
        />
        <KpiCard
          title="Taxa de Cancelamento"
          isLoading={isLoadingKpis}
          value={kpis ? formatPercentage(kpis.cancelRate) : '...'}
        />

        {/* Linha 2: Gráfico Principal */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Faturamento ao Longo do Tempo</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isLoadingRevenue ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <RevenueChart data={revenueData || []} />
            )}
          </CardContent>
        </Card>

        {/* Linha 3: Relatórios (em Coluna - layout corrigido) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Top 10 Produtos</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            {isLoadingTopProducts ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <TopProductsChart data={topProductsData || []} />
            )}
          </CardContent>
        </Card>

        {/* Linha 4: Comparativo de Lojas (layout corrigido) */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Comparativo de Lojas</CardTitle>
          </CardHeader>
          <CardContent className="h-[900px]">
            {isLoadingStoreComparison ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <StoreComparisonChart data={storeComparisonData || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

