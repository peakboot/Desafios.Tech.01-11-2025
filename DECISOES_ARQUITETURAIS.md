# 🧩 Documentação de Decisões de Arquitetura

Este documento detalha as principais decisões técnicas, trade-offs e estratégias de performance adotadas na construção da solução, conforme solicitado pelos avaliadores do desafio.

---

## 1. Stack Tecnológica Principal: NestJS + React (Full-Stack TypeScript)

A decisão mais importante do projeto foi adotar **TypeScript em todo o stack** — garantindo tipagem forte e integração nativa entre backend e frontend.

**Stack:**
- **Backend:** NestJS  
- **Frontend:** React (com Vite)  
- **Linguagem:** TypeScript  

### Justificativas

**🔒 Segurança de Contrato (API):**  
O problema envolve dados analíticos complexos (KPIs, séries temporais, listas de produtos).  
Ao compartilhar interfaces entre backend e frontend (ex: `KpiResult`, `TopProductResult`), o TypeScript garante consistência de tipos.  
Se o backend renomear um campo (ex: `totalRevenue → revenue`), o frontend falhará em tempo de compilação — evitando erros silenciosos em produção.

**🧱 Robustez Arquitetural (Backend):**  
O NestJS foi escolhido por ser um framework **opinativo**, que incentiva boas práticas: arquitetura modular (`ReportsModule`), injeção de dependência (`ReportsService`) e validação automática via DTOs (`class-validator`).  
O resultado é um backend **limpo, seguro e escalável**.

**⚡ Velocidade e Produtividade (Frontend):**  
React com Vite proporciona um ambiente de desenvolvimento rápido e reativo.  
O uso de **shadcn/ui** e **TailwindCSS** foi estratégico: garantimos um **design moderno e consistente** com mínimo esforço em CSS, em linha com a meta de *“design funcional e ágil”* descrita no AVALIACAO.md.

---

## 2. Decisão Crítica de Performance: SQL Puro (V1.1) vs ORM

O AVALIACAO.md exige:  
> “Queries otimizadas (< 1s para 500k registros)”.

Essa exigência guiou toda a arquitetura do backend.

### O Problema: Por que não usar ORM?

Uma abordagem inicial (ex: `await salesRepository.find()`) carregaria **500k+ registros** no Node.js para processamento (soma, média, filtro).  
Consequências:
- **Memória:** o heap do Node seria rapidamente esgotado.  
- **Velocidade:** o Node é ineficiente em agregações em larga escala comparado ao PostgreSQL.  

### A Solução (V1.0): SQL Puro via `entityManager.query`

Delegamos **100% das agregações ao banco de dados**, usando SQL otimizado.  
Isso explorou a força do PostgreSQL em operações analíticas pesadas.

### A Otimização (V1.1): Eliminação do CROSS JOIN

A query inicial usava dois `WITH` e fazia `FROM CompletedSales cs, AllSales als`, criando um **CROSS JOIN** acidental — multiplicando 500k × 500k registros e travando o navegador.

#### Correção (Single-Pass Query)

A solução foi reescrever a query para **uma única passagem** na tabela `sales`, com **agregação condicional** (`CASE WHEN ...`).

```sql
-- ✅ Query otimizada (V1.1)
SELECT
  COALESCE(SUM(CASE WHEN s.sale_status_desc = 'COMPLETED' THEN s.total_amount END), 0) AS "totalRevenue",
  COALESCE(AVG(CASE WHEN s.sale_status_desc = 'COMPLETED' THEN s.total_amount END), 0) AS "avgTicket",
  ...
FROM sales s;
```

Essa mudança foi o divisor de águas entre uma solução **viável em produção** e uma **inutilizável**.

---

## 3. Arquitetura da V2: Queries Dinâmicas (Analytics Customizável)

A V1 entregava um dashboard fixo.  
A **V2 (Fase 2.A)** implementa *analytics customizável*, permitindo perguntas como “Vendas do iFood na Loja Centro”.

### Backend: Função `buildWhereClauses` e Segurança

A principal decisão da V2 foi criar a função privada `buildWhereClauses` em `reports.service.ts`, responsável por gerar dinamicamente os filtros SQL (`WHERE ...`).

**Centralização:**  
Toda a lógica de filtro foi unificada, evitando duplicação nas funções (`getKpis`, `getRevenueOverTime`, etc.).

**Validação:**  
O `QueryParamsDto` usa `class-validator` e `@Transform` para normalizar e validar parâmetros (ex: `?channelIds=1,2,3 → [1,2,3]`).

**Segurança (SQL Injection):**  
Evita-se concatenação direta de strings.  
As queries são **parametrizadas** com placeholders (`$1`, `$2`, ...), e os valores são passados como array (`params`), garantindo que o driver trate-os como dados, não código executável.

Exemplo:  
```sql
WHERE s.channel_id = ANY($1) AND s.store_id = ANY($2)
-- params = [[1,2], [5]]
```

### Frontend: Gerenciamento de Estado de Filtros

No `Dashboard.tsx`, todos os filtros (datas, lojas, canais) estão em um único estado `filters`.  
Um único `useEffect` observa esse objeto e dispara a atualização de todos os gráficos:

```tsx
const [filters, setFilters] = useState<ReportFilters>({ ... });

useEffect(() => {
  fetchAllDashboardData(filters);
}, [filters]);

const handleFilterChange = (key: string, value: any) => {
  setFilters(prev => ({ ...prev, [key]: value }));
};
```

Isso garante **reatividade, simplicidade e consistência** de dados entre os componentes.

---

## 4. Decisões de UX e Arquitetura do Frontend

O **PROBLEMA.md** descreve que “Maria acha o PowerBI complexo”.  
Logo, **simplicidade e clareza** guiaram todo o design.

**🧭 Single Page Application (SPA):**  
Todo o dashboard está em uma única página (`Dashboard.tsx`).  
Os filtros atualizam os gráficos em tempo real, mantendo uma experiência fluida e imediata.

### Legibilidade dos Gráficos (Evolução UX)

Durante o desenvolvimento, os gráficos de barras (Top Produtos e Comparativo de Lojas) ficaram ilegíveis para grandes volumes de dados (ex: 50+ lojas).

- **Tentativa 1:** Rotacionar labels (`angle={-60}`) — piorou a legibilidade.  
- **Tentativa 2:** Tornar as barras horizontais — ajudou no “Top 10 Produtos”, mas não nas 50 lojas.  
- **Solução Final:** Ajuste estrutural: o gráfico passou a ocupar a tela inteira (`col-span-4`) com maior altura (`h-[900px]`).

Resultado: **usabilidade resolvida por arquitetura de layout**, não apenas no componente gráfico.

---

## 5. Trade-offs e Próximos Passos (V3)

O **FAQ.md** questiona sobre um “query builder visual” ou “drag-and-drop”.

### Trade-off (V2)
Optamos por **não implementar** um construtor visual de queries.  
Embora poderoso, ele violaria o princípio de *“simplicidade sem necessidade de treinamento técnico”* e aumentaria a complexidade de desenvolvimento exponencialmente.

### Solução Atual (V2)
A arquitetura de **Filtros Avançados** cobre cerca de **80% do poder** de um query builder, com apenas **20% da complexidade**.

### Próximo Passo (V3)
A evolução natural é a **Fase 2.B — Criação de Gráficos Customizados**, permitindo que a usuária escolha:
- **Métrica:** ex. `SUM(total_amount)`  
- **Dimensão:** ex. `GROUP BY stores.name`  

O backend geraria a query SQL dinamicamente, mantendo segurança e performance.

---
Essas são as principais justificativas que consigo lembrar. Talvez houvesse outras formas de pensar a solução, mas, devido ao prazo curto, optei por mantê-la o mais simples possível — garantindo que atendesse às necessidades da persona e respeitasse ao máximo os requisitos do projeto.

Agradeço muito pela oportunidade de participar do processo seletivo.

Feito com ❤️ por **@domcarlosadriano**
