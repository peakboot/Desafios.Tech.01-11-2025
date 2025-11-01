import type { RevenueOverTimePoint } from "../../types"; // CORREÇÃO: Caminho relativo
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  CartesianGrid,
} from "recharts";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RevenueChartProps {
  data: RevenueOverTimePoint[];
}

// Formata o valor do eixo Y (vertical) para R$
const formatCurrency = (value: number) => {
  if (typeof value !== "number") return "R$ 0,00";
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
};

// Formata a data do eixo X (horizontal)
const formatDate = (dateString: string) => {
  try {
    // Tenta formatar a data ISO (ex: "2025-10-10T03:00:00Z")
    const date = parseISO(dateString);
    return format(date, "dd/MM", { locale: ptBR });
  } catch (error) {
    // Se falhar (ex: "10/10"), retorna a string original
    return dateString;
  }
};

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 20,
          // CORREÇÃO VISUAL: Aumentado para 60 para caber o label de R$
          left: 60,
          // CORREÇÃO VISUAL: Aumentado para 20 para caber o label da data
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatDate}
          dy={10} // Desce o label da data
          interval="preserveStartEnd"
          minTickGap={20} // Garante espaço entre os ticks
        />
        <YAxis
          tickFormatter={formatCurrency}
          // CORREÇÃO VISUAL: Ajustado para não cortar
          dx={-10}
          width={80} // Define uma largura fixa para o eixo Y
          domain={["auto", "auto"]}
        />
        <Tooltip
          formatter={(value: number) => [
            formatCurrency(value),
            "Faturamento",
          ]}
          labelFormatter={(label: string) => {
            try {
              // Tenta formatar a data ISO
              return format(parseISO(label), "PPP", { locale: ptBR });
            } catch {
              // Se falhar (ex: "10/10"), retorna o label original
              return label;
            }
          }}
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#8884d8"
          strokeWidth={2}
          activeDot={{ r: 8 }}
          dot={{ r: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

