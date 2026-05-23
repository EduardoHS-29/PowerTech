# PowerTech

Projeto desenvolvido para a disciplina **UPX III**, com o objetivo de aplicar na prática os conceitos de desenvolvimento web full-stack: modelagem de banco de dados relacional, arquitetura em camadas, autenticação segura, validação de dados e construção de interfaces funcionais.

O sistema simula uma plataforma real de gerenciamento de um parque eólico, onde técnicos e engenheiros podem cadastrar turbinas, registrar análises de manutenção e acompanhar o estado operacional dos equipamentos.

---

## Contexto e Problema

Parques eólicos possuem múltiplas turbinas que precisam de acompanhamento técnico periódico. Cada turbina tem componentes físicos (as pás do rotor) que passam por inspeções, e cada inspeção precisa ser registrada com responsável, data, resultado e status. Sem um sistema centralizado, esse controle seria feito em planilhas ou papéis, sujeito a erros e perda de informação.

O PowerTech resolve isso com uma aplicação web onde é possível:
- Manter o cadastro completo de cada turbina e suas pás
- Registrar e acompanhar análises técnicas vinculadas a cada turbina
- Visualizar rapidamente o estado do parque no dashboard

---

## Funcionalidades Implementadas

### Dashboard
- Contagem de turbinas agrupadas por status (Ativa, Inativa, Manutenção)
- Listagem das análises mais recentes com link direto para cada registro

### Turbinas
- Cadastro com nome, código único, fabricante, modelo, potência (kW), datas de instalação e fabricação, status operacional e observações
- Cada turbina possui exatamente **3 pás**, registradas com código, modelo e data da última análise
- Listagem com busca por texto livre, filtro por status e paginação
- Tela de visualização separada da tela de edição — o usuário acessa os dados e só abre o formulário quando quer editar
- Após salvar a edição, o sistema retorna automaticamente para a visualização

### Análises Técnicas
- Registro vinculado a uma turbina: título, descrição do procedimento, responsável, data, status e resultado
- Ciclo de vida do status: Pendente → Em Andamento → Concluída / Cancelada
- Listagem com busca, filtro por status e paginação
- Mesma separação visualização/edição aplicada nas turbinas

### Autenticação e Segurança
- Login com e-mail e senha (senha armazenada com hash bcrypt — nunca em texto puro)
- Sessão gerenciada via **JWT** armazenado em cookie `httpOnly` (não acessível por JavaScript no navegador, protegido contra XSS)
- Todas as rotas do dashboard são protegidas por um middleware (`proxy.ts`); sem sessão válida, o acesso é bloqueado e o usuário é redirecionado para o login

---

## Tecnologias Utilizadas e Por Que Foram Escolhidas

| Tecnologia | Função no projeto | Por que foi usada |
|---|---|---|
| **Next.js 16** | Framework principal (frontend + backend) | Linguagem de conforto dos membros do grupo e condiz com a proposta de simplicidade por eliminar a necessidade de criar um backend separado |
| **MySQL 8** | Banco de dados relacional | Escolha natural para banco de dados relacional e gratuito |
| **Prisma 6** | ORM (mapeamento objeto-relacional) | Permite escrever queries ao banco usando TypeScript em vez de SQL puro, com segurança de tipos e histórico de migrations |
| **Tailwind CSS v4** | Estilização | Framework utilitário que agiliza a estilização e reduz a necessidade de arquivos css em excesso |
| **React Hook Form + Zod** | Formulários e validação | Forma mais comum de aplicar validação no Next.js. O Zod define as regras de validação e o React Hook Form gerencia o estado do formulário; |
| **JWT + bcrypt** | Autenticação | JWT para criação de tokens de sessão sem precisar armazenar estado no servidor; bcrypt para proteger senhas com hash |

---

## Arquitetura: Separação em Camadas

Um dos conceitos centrais aplicados no projeto é a **separação de responsabilidades em camadas**. Cada camada tem uma função bem definida e não ultrapassa os seus limites:

```
Página / Server Action     — recebe a requisição, valida os dados com Zod, devolve resposta
  → Service                — aplica as regras de negócio (ex: "não pode haver dois códigos iguais")
    → Repository           — faz a query no banco de dados via Prisma
      → Banco de dados
```

**Por que isso importa?**

- Se a regra "código único" mudar, mexemos só no Service, sem tocar no banco ou na interface
- Se trocarmos de banco de dados, mexemos só no Repository
- Se a interface mudar, não quebramos a lógica de negócio

Além disso, o projeto usa **Server Actions** do Next.js para processar formulários: em vez de criar rotas de API manualmente (`POST /api/turbinas`), a função que grava no banco fica no próprio servidor e é chamada diretamente pelo formulário. Isso simplifica o código sem abrir mão da segurança, já que o código do servidor nunca é exposto ao navegador.

---

## Pré-requisitos

- **Node.js** v20.9 ou superior — [download](https://nodejs.org)
- **MySQL** 8 instalado e rodando localmente

---

## Como Rodar o Projeto Localmente

### 1. Clone o repositório

```bash
git clone https://github.com/EduardoHS-29/PowerTech.git
cd PowerTech
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo:

```bash
cp .env.example .env
```

Abra o `.env` e ajuste as credenciais do seu MySQL:

```env
# Formato: mysql://USUARIO:SENHA@HOST:PORTA/NOME_DO_BANCO
DATABASE_URL="mysql://root:root@localhost:3306/powertech"

# Chave secreta para assinar os tokens JWT (mínimo 32 caracteres)
AUTH_SECRET="powertech-super-secret-key-troque-em-producao-32ch"

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

Este comando instala as dependências, aplica as migrations (cria as tabelas) e insere os dados iniciais de exemplo:

```bash
npm run setup
```

### 5. Inicie o servidor

```bash
npm run dev
```

Acesse no navegador: [http://localhost:3000](http://localhost:3000)

### Credenciais de acesso

| Campo | Valor |
|---|---|
| E-mail | `admin@powertech.com` |
| Senha | `admin123` |

## Estrutura de Pastas

```
prisma/
  schema.prisma        # Definição dos modelos e relacionamentos do banco
  seed.ts              # Dados iniciais inseridos automaticamente no setup
  migrations/          # Histórico de alterações no banco (gerado pelo Prisma)

src/
  app/
    (auth)/login/      # Tela de login e lógica de autenticação
    (dashboard)/       # Todas as rotas que exigem login
      page.tsx         # Dashboard principal
      turbinas/        # Listagem, cadastro, visualização e edição de turbinas
      analises/        # Listagem, cadastro, visualização e edição de análises
  components/
    forms/             # Formulários com validação (React Hook Form)
    ui/                # Componentes reutilizáveis: botões, inputs, cards...
    tables/            # Tabelas de listagem com busca e paginação
    layouts/           # Estrutura da página: cabeçalho e menu lateral
  lib/
    services/          # Regras de negócio de cada entidade
    repositories/      # Acesso ao banco de dados (queries Prisma)
    validations/       # Schemas de validação Zod compartilhados entre front e back
    auth/              # Criação e leitura de tokens JWT
    errors/            # Classes de erro e tratamento padronizado nas actions
    constants/         # Rotas, textos e cores de status centralizados
  proxy.ts             # Middleware que protege todas as rotas do dashboard
```
