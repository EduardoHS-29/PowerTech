# PowerTech

Projeto desenvolvido para a disciplina **UPX III**, com o objetivo de aplicar na prática os conceitos de desenvolvimento web full-stack: modelagem de banco de dados relacional, arquitetura em camadas, autenticação segura, validação de dados e construção de interfaces funcionais.

O sistema simula uma plataforma real de gerenciamento de um parque eólico, onde técnicos e engenheiros podem cadastrar turbinas, registrar análises de manutenção, documentar ocorrências por pá e acompanhar o estado operacional dos equipamentos.

---

## Contexto e Problema

Parques eólicos possuem múltiplas turbinas que precisam de acompanhamento técnico periódico. Cada turbina tem componentes físicos (as pás do rotor) que passam por inspeções, e cada inspeção precisa ser registrada com responsável, data, ocorrências encontradas e status. Sem um sistema centralizado, esse controle seria feito em planilhas ou papéis, sujeito a erros e perda de informação.

O PowerTech resolve isso com uma aplicação web onde é possível:
- Manter o cadastro completo de cada turbina e suas pás
- Registrar análises técnicas vinculadas a cada turbina
- Documentar ocorrências por pá com tipo e nível de gravidade
- Visualizar rapidamente o estado do parque no dashboard com alertas de gravidade

---

## Funcionalidades Implementadas

### Dashboard
- Contagem de turbinas por status (Ativa, Inativa, Manutenção) e análises por status
- Listagem das análises mais recentes com badge de **gravidade máxima** (calculada a partir das ocorrências cadastradas), indo do verde ao vermelho para facilitar a tomada de decisão

### Turbinas
- Cadastro com nome, código único, fabricante, modelo, potência (kW), datas de instalação e fabricação, status operacional e observações
- Cada turbina possui exatamente **3 pás**, registradas com código, modelo e data da última análise — atualizada automaticamente ao cadastrar uma ocorrência
- Listagem com busca por texto livre, filtro por status e paginação
- Tela de visualização separada da tela de edição

### Análises Técnicas
- Registro vinculado a uma turbina: título, responsável, data e status
- Ciclo de vida: Pendente → Em Andamento → Concluída / Cancelada
- Listagem com busca, filtro por status e paginação

### Ocorrências
- Lista de ocorrências por análise, gerenciada dentro da tela de edição da análise
- Cada ocorrência registra: **tipo** (causas mais frequentes em pás + campo livre "Outras"), **pá afetada** e **gravidade** (1 a 5, com escala de cores verde→vermelho)
- Campo de descrição livre aparece apenas quando o tipo "Outras" é selecionado
- Ao salvar uma ocorrência, o campo `data da última análise` da pá afetada é atualizado automaticamente

### Autenticação e Segurança
- Login com e-mail e senha (armazenada com hash bcrypt)
- Sessão via **JWT** em cookie `httpOnly` (protegido contra XSS)
- Todas as rotas do dashboard protegidas por `proxy.ts`; sem sessão válida o usuário é redirecionado para o login

---

## Tecnologias Utilizadas

| Tecnologia | Função no projeto | Por que foi usada |
|---|---|---|
| **Next.js 16** | Framework principal (frontend + backend) | Elimina a necessidade de um backend separado com sua arquitetura de Server Components e Server Actions |
| **MySQL 8** | Banco de dados relacional | Gratuito, amplamente utilizado e adequado para dados relacionais estruturados |
| **Prisma 6** | ORM | Queries em TypeScript com segurança de tipos, migrations versionadas e geração automática de cliente |
| **Tailwind CSS v4** | Estilização | Framework utilitário que agiliza a estilização sem arquivos CSS adicionais |
| **React Hook Form + Zod** | Formulários e validação | Zod define as regras de validação compartilhadas entre front e back; React Hook Form gerencia o estado do formulário |
| **JWT + bcrypt** | Autenticação | JWT para tokens de sessão stateless; bcrypt para hashing seguro de senhas |

---

## Arquitetura: Separação em Camadas

```
Página / Server Action     — recebe a requisição, valida os dados com Zod, devolve resposta
  → Service                — aplica as regras de negócio
    → Repository           — faz a query no banco de dados via Prisma
      → Banco de dados
```

**Por que isso importa?**
- Se uma regra de negócio mudar, mexemos só no Service
- Se trocarmos de banco de dados, mexemos só no Repository
- Se a interface mudar, não quebramos a lógica de negócio

O projeto usa **Server Actions** para processar formulários: em vez de criar rotas de API manualmente, a função que grava no banco fica no servidor e é chamada diretamente pelo formulário — sem expor código ao navegador.

---

## Pré-requisitos

- **Node.js** v20.9 ou superior — [download](https://nodejs.org)
- **MySQL 8** instalado e rodando localmente

---

## Como Rodar o Projeto Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/EduardoHS-29/PowerTech.git
cd PowerTech/power-tech
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Abra o `.env` e ajuste as credenciais do MySQL:

```env
# Formato: mysql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
DATABASE_URL="mysql://root:root@localhost:3306/powertech"
AUTH_SECRET="powertech-super-secret-key-32cha"
AUTH_SESSION_MAX_AGE=86400
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Crie o banco de dados

Acesse o MySQL e execute:

```sql
CREATE DATABASE IF NOT EXISTS powertech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Execute o setup automático

```bash
npm run setup
```

Instala dependências, aplica as migrations e popula com dados de exemplo.

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse: [http://localhost:3000](http://localhost:3000)

### Credenciais de acesso

| Campo | Valor |
|---|---|
| E-mail | `admin@powertech.com` |
| Senha | `admin123` |

## Estrutura de Pastas

```
prisma/
  schema.prisma        # Modelos: User, Turbina, Pa, Analise, Ocorrencia
  seed.ts              # Dados de exemplo (turbinas, pás, análises, ocorrências)
  migrations/          # Uma migration inicial com o schema completo

src/
  app/
    (auth)/login/      # Tela de login
    (dashboard)/       # Rotas protegidas por autenticação
      page.tsx         # Dashboard com stats e análises recentes
      turbinas/        # CRUD de turbinas
      analises/        # CRUD de análises + gerenciamento de ocorrências
  components/
    forms/             # Formulários: turbina, análise, ocorrência
    ui/                # Componentes base: Button, Input, Select, Modal, Badge...
    tables/            # Tabelas: turbinas, análises, ocorrências
    dashboard/         # Widgets do dashboard
  lib/
    services/          # Regras de negócio (analise, turbina, ocorrencia)
    repositories/      # Queries Prisma (analise, turbina, ocorrencia)
    validations/       # Schemas Zod compartilhados
    auth/              # JWT: criação e leitura de sessão
    errors/            # Hierarquia de erros e ActionResult
    constants/         # ROUTES, labels, cores de status e gravidade
  proxy.ts             # Proteção de rotas autenticadas
```
