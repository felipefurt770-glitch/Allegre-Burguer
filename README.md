# Allegre Burguer — Cardápio Digital v3

Esta versão corrige a direção visual da v2.

## Direção visual
A interface volta a usar o cardápio oficial como referência principal:
- fundo preto profundo;
- logo grande no cabeçalho;
- Allegre Brasa como fotografia hero;
- tipografia editorial serifada;
- títulos de seção em caixa alta;
- divisórias finas;
- estrutura desktop em duas colunas;
- hambúrgueres numerados;
- preços alinhados;
- produtos em lista, não em cards genéricos de e-commerce.

## O que foi preservado da v2
- modal de produto;
- retirada de ingredientes;
- montagem de combos;
- sacola persistente;
- cross-sell;
- entrega/retirada;
- checkout;
- WhatsApp;
- UTM / gclid / fbclid;
- dataLayer;
- payload pronto para CRM.

## Arquivos
- index.html
- styles.css
- app.js
- menu.json
- assets/
- politica-de-privacidade.html
- pedido-confirmado.html

## Dados pendentes de validacao
- valores e disponibilidade de adicionais;
- regra e valor da taxa de entrega por endereco;
- confirmacao operacional do pedido/pagamento, antes de registrar uma conversao de compra.

`purchase_intent` e disparado somente no envio do pedido ao WhatsApp. Nenhum evento de compra concluida e disparado nesta etapa.

## Rodar localmente
Use Live Server no VS Code ou:

python -m http.server 8080

Depois acesse http://localhost:8080
