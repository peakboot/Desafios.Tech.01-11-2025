# 🏆 Solução: DesafioTech God Level Coder - Analytics para Restaurantes

Esta é a submissão para o **"God Level Coder Challenge"**.

---

## 🎯 O Objetivo do Projeto

O objetivo deste projeto é resolver um problema de negócio real enfrentado por donos de restaurantes:  
eles estão sentados sobre uma montanha de dados (vendas, produtos, clientes),  
mas não conseguem usá-los para tomar decisões.

Ferramentas de BI genéricas como o Power BI são muito complexas,  
e dashboards fixos não respondem perguntas dinâmicas como:  
> “Qual produto vende mais na quinta à noite no iFood?”

Esta solução ataca esse problema diretamente.  
É uma **plataforma de analytics full-stack (React + NestJS)** construída especificamente para o domínio de restaurantes,  
permitindo que os usuários explorem seus dados de forma **rápida, visual e dinâmica**.

📄 Para uma descrição completa da persona, das dores de negócio e do contexto do desafio, consulte o arquivo **`PROBLEMA.md`**.

---

## ✨ O que a Solução Faz (Features)

Construímos uma **aplicação de página única (SPA)** que vai além do MVP,  
entregando também a **V2 de “Filtros Avançados”**.

### Dashboard de V1 (MVP)
- Visão imediata dos **4 KPIs centrais**: Faturamento, Ticket Médio, Vendas e Cancelamento.  
- **Gráfico de Faturamento ao Longo do Tempo** (com preenchimento de dias vazios).  
- **Gráfico de Top 10 Produtos** (layout otimizado para nomes longos).  
- **Gráfico de Comparativo de Lojas** (layout otimizado para 50+ lojas).  
- **Exportação completa** do dashboard (filtrado) para `.csv`.

### Analytics V2 (Filtros Avançados)
- O dashboard busca dinamicamente as **listas de Lojas e Canais** disponíveis no banco.  
- A usuária pode filtrar todos os gráficos e KPIs **em tempo real** por:
  - Período (Data)  
  - Canal Específico (ex: iFood, Rappi)  
  - Loja Específica  

O backend aplica os filtros dinamicamente usando **queries SQL otimizadas**  
(`CASE WHEN`, `ANY($1)`), garantindo **performance abaixo de 1 segundo em +500k registros**.

---

## 🚀 Como Rodar o Projeto (Guia de Setup)

### ✅ Pré-requisitos
Você precisará de **Node.js (v18+)**, **Docker** e **Git** instalados.

### **Passo 1: Clonar o Repositório**

```bash
git clone https://github.com/DomCarlosAdriano/Desafios.Tech.01-11-2025.git
cd Desafios.Tech.01-11-2025
```

---

### 🧱 **Passo 2: Rodar o Banco de Dados (Docker)**

Todo o nosso banco de dados (**PostgreSQL**) e o script de geração de dados rodam via **Docker Compose**.

Navegue até a pasta do banco de dados:

```bash
cd DataBase
```

Compile (Build) o Gerador de Dados:  
*(Este passo garante que o container do script está pronto para rodar)*

```bash
docker compose build --no-cache data-generator
```

Inicie o Banco de Dados:  
*(Este comando irá iniciar o PostgreSQL em background na porta 5432)*

```bash
docker compose up -d postgres
```

Gere os 500k+ Dados:  
*(Este comando executa o script e pode levar de 5 a 15 minutos)*

```bash
docker compose run --rm data-generator
```

---

### ⚙️ **Passo 3: Rodar o Backend (NestJS)**

O backend é a nossa **API**, que se conecta ao banco de dados. *(Requer um terminal separado.)*

Navegue até a pasta do backend (a partir da raiz):

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Configure as variáveis de ambiente:


```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=challenge
DB_PASSWORD="SENHA_AQUI"
DB_DATABASE=challenge_db
```

Inicie o servidor do backend:

```bash
npm run start:dev
```

O terminal deve mostrar:  
**Backend rodando na porta 3000.**

---

### 💻 **Passo 4: Rodar o Frontend (React)**

A interface do usuário. *(Requer um terceiro terminal.)*

Navegue até a pasta do frontend (a partir da raiz):

```bash
cd FrontEnd
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

---

### 🌐 **Passo 5: Acessar a Aplicação**

🎉 Parabéns! A stack completa está rodando.

Acesse o **Dashboard (Frontend)** em:  
👉 [http://localhost:5173](http://localhost:5173)


---

## 🛠️ Stack de Tecnologia

**Frontend:** React, TypeScript, Vite, TailwindCSS, Shadcn/ui (para componentes), Recharts (para gráficos), PapaParse (para CSV). 

**Backend:** NestJS, TypeScript, TypeORM (usando `entityManager` para queries SQL puras otimizadas, garantindo performance).  

**Banco de Dados:** PostgreSQL (rodando em Docker).



---

## 📝 Documentação Adicional (Para Avaliadores)
| Documento | Descrição |
|-----------|-----------|
| [PROBLEMA.md](./PROBLEMA.md) | Apresenta o contexto do desafio, a persona Maria e as principais dores e necessidades identificadas. |
| [README.md](./README.md) | Guia introdutório do sistema, com instruções de instalação e execução passo a passo. |
| [DataBase](./DataBase) | Contém a configuração do banco de dados e o docker-compose.yml responsável por subir o PostgreSQL e gerar os dados automaticamente. |
| [backend](./backend) | Código-fonte do backend (NestJS), incluindo regras de negócio, serviços e rotas da API REST. |
| [FrontEnd](./FAQ.md) | Código-fonte do frontend (React + Vite), onde o usuário interage com o sistema através da interface.|
| [DECISOES_ARQUITETURAIS.md](./DECISOES_ARQUITETURAIS.md) | Detalha as principais escolhas de arquitetura do projeto, abordando as justificativas das tecnologias e tecnicas adotadas. |



