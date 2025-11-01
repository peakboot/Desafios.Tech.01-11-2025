import type { TopProduct } from "../../types"; // CORREÇÃO: Caminho relativo
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  CartesianGrid,
} from "recharts";

interface TopProductsChartProps {
  data: TopProduct[];
}

// Formata o valor do eixo X (horizontal) para R$
const formatCurrency = (value: number) => {
  if (typeof value !== "number") return "R$ 0,00";
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0, // Remove centavos para economizar espaço
    maximumFractionDigits: 0,
  });
};

// Função para encurtar nomes de produtos se forem muito longos
const formatProductName = (name: string) => {
  return name.length > 20 ? name.substring(0, 20) + "..." : name;
};

export function TopProductsChart({ data }: TopProductsChartProps) {
  // Encontra o valor máximo para definir o domínio do eixo X
  const maxValue = Math.max(...data.map((item) => item.totalRevenue));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical" // Gráfico de barras horizontal
        margin={{
          top: 5,
          right: 30,
          // CORREÇÃO VISUAL: Aumentado para 150 para caber nomes de produtos
          left: 30,
          bottom: 20, // Aumentado para o caso de nomes no eixo X
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
          // CORREÇÃO VISUAL: Aumenta a largura e usa o formatador
          width={180} // Aumenta a largura do eixo para os nomes
          tickFormatter={formatProductName} // Encurta nomes longos
          interval={0} // Garante que todos os 10 nomes apareçam
          dx={-5} // Puxa o label para perto do eixo
        />
        <Tooltip
          formatter={(value: number, name: string, props) => [
            formatCurrency(value),
            // Mostra o nome completo do produto no tooltip
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
        <Bar dataKey="totalRevenue" fill="#8884d8" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

