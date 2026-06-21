# Tracking Automatic Web

Frontend do **Tracking Automatic**, uma aplicação web para consultar e acompanhar o histórico de objetos dos Correios.

A interface consome a API do projeto, apresenta o status atual da encomenda e organiza os eventos de rastreamento em uma linha do tempo responsiva.

## Aplicação em produção

[Acessar o Tracking Automatic](https://tracking-automatic-web.vercel.app)

> A primeira consulta pode demorar alguns segundos caso a API esteja inicializando o serviço de OCR.

## Funcionalidades

- consulta de até 20 objetos por vez, com códigos separados por vírgula;
- bloqueio de consultas por CPF ou CNPJ;
- navegação por abas entre os objetos consultados;
- exibição do status atual e do serviço postal;
- histórico completo dos eventos em formato de linha do tempo;
- lista das cinco consultas mais recentes no navegador;
- nova consulta a partir do histórico local;
- estados visuais de carregamento e erro;
- validação do formato da resposta recebida da API;
- layout responsivo para dispositivos móveis e desktop;
- suporte à preferência de movimento reduzido do sistema.

## Tecnologias

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vite.dev/)
- [ESLint](https://eslint.org/)
- CSS responsivo sem biblioteca de componentes

## Arquitetura

O frontend é uma aplicação de página única que se comunica com a API por HTTP.

```text
Navegador
   |
   | GET /tracking?code=<codigo1,codigo2>
   v
Tracking API
   |
   v
Correios + OCR de CAPTCHA
```

As consultas recentes são armazenadas no `localStorage`. Nenhum dado de rastreamento é persistido pelo frontend em banco de dados.

### Organização do código

| Diretório | Responsabilidade |
| --- | --- |
| `src/components/` | Layout e componentes das telas de busca e resultados. |
| `src/domain/` | Tipos e regras de validação dos códigos de rastreamento. |
| `src/services/` | Comunicação HTTP e validação do contrato da API. |
| `src/storage/` | Leitura e persistência das consultas recentes. |
| `src/utils/` | Utilitários de apresentação sem estado. |

O `App.tsx` atua somente como orquestrador dos estados principais e da navegação entre as telas.

## Requisitos

- Node.js `20.19+` ou `22.12+`
- npm
- uma instância da Tracking API em execução

## Configuração local

1. Instale as dependências:

```powershell
npm install
```

2. Crie o arquivo de ambiente a partir do exemplo:

```powershell
Copy-Item .env.example .env.local
```

3. Defina em `.env.local` o endereço da API:

```dotenv
VITE_API_BASE_URL=http://127.0.0.1:8000
```

4. Inicie o servidor de desenvolvimento:

```powershell
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Sim | URL base da Tracking API, sem o caminho `/tracking`. |

Variáveis com o prefixo `VITE_` são incorporadas ao bundle no momento do build. Portanto, elas não devem conter segredos.

## Contrato com a API

O frontend realiza a seguinte requisição:

```http
GET /tracking?code=TJ481246775BR%2CAP073539958BR
```

Exemplo resumido de resposta esperada:

```json
{
  "results": [
    {
      "status": "success",
      "tracking_code": "TJ481246775BR",
      "service": "SEDEX",
      "current_status": "Objeto entregue ao destinatário",
      "events": [
        {
          "description": "Objeto entregue ao destinatário",
          "details": [],
          "occurred_at": "2026-05-22T12:44:04-03:00"
        }
      ]
    },
    {
      "status": "not_found",
      "tracking_code": "ZZ000000005BR",
      "message": "Objeto não encontrado na base de dados dos Correios."
    }
  ]
}
```

O contrato sempre contém `results`, inclusive em consultas individuais. Cada item é discriminado por `status`: `success` apresenta a timeline, enquanto `not_found` mantém a aba do código e mostra a mensagem dos Correios. Antes de atualizar a interface, a aplicação verifica em tempo de execução se todos os resultados possuem a estrutura esperada.

## Scripts disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run build` | Valida os tipos e gera o bundle de produção. |
| `npm run lint` | Executa a análise estática com ESLint. |
| `npm run preview` | Serve localmente o build de produção. |

## Build de produção

```powershell
npm run lint
npm run build
npm run preview
```

Os arquivos otimizados são gerados no diretório `dist/`.

## Deploy

O frontend pode ser publicado em serviços de hospedagem estática, como Vercel, Netlify ou Cloudflare Pages.

Configuração utilizada no deploy:

- comando de build: `npm run build`;
- diretório de saída: `dist`;
- variável de ambiente: `VITE_API_BASE_URL` com a URL pública da API.

A origem do frontend também deve estar autorizada na configuração de CORS da API.

## Limitações conhecidas

- a disponibilidade das consultas depende da API e do serviço dos Correios;
- o histórico recente existe apenas no navegador em que a consulta foi realizada;
- limpar os dados do navegador remove o histórico local;
- o projeto ainda não possui testes automatizados de interface.

## Projeto relacionado

O backend está no diretório `tracking_automatic` deste workspace. Ele utiliza FastAPI, scraping HTTP e PaddleOCR para consultar e estruturar os eventos dos Correios.
