import type { StoreComparison } from "../../types"; // CORREÇÃO: Caminho relativo
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
} from "recharts";

interface StoreComparisonChartProps {
  data: StoreComparison[];
}

// Formata o valor do eixo X (horizontal) para R$
const formatCurrency = (value: number) => {
  if (typeof value !== "number") return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

// Função para encurtar nomes de lojas se forem muito longos
const formatStoreName = (name: string) => {
  // Aumentado para 30 caracteres
  return name.length > 30 ? name.substring(0, 30) + "..." : name;
};

export function StoreComparisonChart({ data }: StoreComparisonChartProps) {
  // Encontra o valor máximo para definir o domínio do eixo Y
  const maxValue = Math.max(...data.map((item) => item.value));

  // CORREÇÃO VISUAL: Voltando para o layout horizontal
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical" // Gráfico de barras horizontal
        margin={{
          top: 5,
          right: 30,
          // CORREÇÃO VISUAL: Aumentado MUITO para caber nomes longos
          left: 30,
          bottom: 20,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis
          type="number"
          tickFormatter={formatCurrency}
          domain={[0, maxValue * 1.1]} // Dá 10% de espaço no topo
        />
        <YAxis
          type="category"
          dataKey="name"
          // CORREÇÃO VISUAL: Aumentado MUITO para caber nomes longos
          width={250} // Aumenta a largura do eixo para os nomes
          tickFormatter={formatStoreName} // Encurta nomes longos
          interval={0} // Garante que todos os nomes apareçam
          dx={-5} // Puxa o label para perto do eixo
        />
        <Tooltip
          formatter={(value: number, name: string, props) => [
            formatCurrency(value),
            // Mostra o nome completo da loja no tooltip
            `Faturamento (${props.payload.name})`,
          ]}
          labelFormatter={() => ""} // Remove o label duplicado do tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "10px",
          }}
        />
        <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

