# ALLEGRE BURGUER — MAPA DO SITE + PROMPT MESTRE PARA CODEX

## 1. MAPA DO SITE

```text
/
├── Header fixo / navegação
│   ├── Logo / nome ALLEGRE BURGUER
│   ├── Destaques
│   ├── Hambúrgueres
│   ├── Batatas
│   ├── Bebidas
│   ├── Combos
│   └── Sacola
│
├── Hero / abertura
│   ├── Logo oficial
│   ├── "CARDÁPIO OFICIAL"
│   ├── Allegre Burguer
│   ├── Slogan institucional
│   └── Foto oficial do Allegre Brasa
│
├── Busca
│   └── Busca por nome, ingrediente e categoria
│
├── Destaques
│   ├── Allegre Brasa
│   ├── Combo Sorriso
│   └── Batata Suprema Allegre
│
├── Hambúrgueres Artesanais
│   ├── 01 Allegre Brasa
│   ├── 02 Allegre Verde
│   ├── 03 Allegre Vinagrete
│   ├── 04 Allegre Cheddar
│   ├── 05 Allegre Bacon
│   └── 06 Allegre Clássico
│
├── Batatas
│   ├── Batata Allegre
│   └── Batata Suprema Allegre
│
├── Bebidas
│   ├── Coca-Cola
│   ├── Coca-Cola Zero
│   ├── Pepsi
│   ├── Fanta Laranja
│   ├── Fanta Uva
│   ├── Guaraná
│   └── Soda
│
├── Combos
│   ├── Combo Sorriso
│   ├── Combo Compartilhar
│   └── Combo Família Allegre
│
├── Modal de produto
│   ├── Nome
│   ├── Descrição
│   ├── Preço
│   ├── Ingredientes
│   ├── Remoção de ingredientes
│   ├── Adicionais quando houver valores aprovados
│   ├── Seleções obrigatórias dos combos
│   ├── Quantidade
│   └── Adicionar à sacola
│
├── Sacola
│   ├── Itens
│   ├── Quantidades
│   ├── Personalizações
│   ├── Remover item
│   ├── "Peça também" / cross-sell
│   ├── Subtotal
│   └── Continuar para checkout
│
├── Checkout
│   ├── Entrega / retirada
│   ├── Nome
│   ├── WhatsApp
│   ├── CEP
│   ├── Endereço
│   ├── Número
│   ├── Bairro
│   ├── Complemento
│   ├── Pagamento
│   ├── Observações
│   ├── Consentimento de dados
│   └── Finalizar no WhatsApp
│
├── Footer
│   ├── ALLEGRE BURGUER
│   ├── Guarulhos — SP
│   └── Slogan
│
└── Camada técnica invisível
    ├── menu.json como fonte central de dados
    ├── localStorage da sacola
    ├── captura de UTM
    ├── captura de gclid
    ├── captura de fbclid
    ├── dataLayer
    ├── eventos de funil
    ├── payload de pedido pronto para CRM
    └── preparação para Meta Pixel / GA4 / Google Ads
```

### Rotas adicionais recomendadas antes de campanhas pagas

```text
/politica-de-privacidade
/pedido-confirmado
```

A página principal deve continuar sendo o cardápio. As rotas adicionais existem para privacidade, mensuração e futura confirmação real de conversão.

---

## 2. PROMPT MESTRE PARA CODEX

Envie para o Codex o ZIP ou a pasta do projeto atual junto com este prompt:

```text
Você está assumindo a evolução de um projeto REAL já existente chamado ALLEGRE BURGUER.

IMPORTANTE:
NÃO comece do zero.
NÃO substitua a identidade existente por um template.
NÃO transforme o projeto em um site genérico de hamburgueria, SaaS, marketplace ou e-commerce.
NÃO altere o logotipo.
NÃO invente produtos, ingredientes, preços, fotos, adicionais, taxas ou funcionalidades comerciais não presentes nos arquivos.
NÃO introduza dourado, amarelo, laranja, vermelho, gradientes, glow, 3D ou paletas externas à identidade institucional.
NÃO use frameworks. O projeto deve permanecer em HTML + CSS + JavaScript vanilla, salvo instrução futura expressa.

OBJETIVO
Executar, revisar, corrigir e evoluir o cardápio digital próprio da ALLEGRE BURGUER, preservando integralmente a identidade visual e os dados comerciais presentes nos arquivos enviados.

O site será utilizado posteriormente como landing page/cardápio para campanhas de Meta Ads e Google Ads e deverá substituir progressivamente a dependência de marketplaces.

ARQUIVOS
Leia integralmente todos os arquivos do projeto antes de modificar qualquer coisa, principalmente:
- index.html
- styles.css
- app.js
- menu.json
- README.md
- pasta assets/

O menu.json deve continuar sendo a principal fonte de verdade dos produtos.

IDENTIDADE VISUAL
A referência visual principal é o cardápio oficial existente nos assets e nos arquivos fornecidos.

Preservar:
- fundo preto profundo;
- branco como cor gráfica principal;
- estética premium;
- composição editorial;
- tipografia sofisticada;
- linhas divisórias finas;
- forte contraste;
- layout limpo;
- aparência artesanal profissional;
- produto como protagonista;
- linguagem visual compatível com o cardápio físico oficial.

A página deve parecer:
"uma evolução digital interativa do cardápio oficial da Allegre Burguer."

Ela NÃO deve parecer:
"um template moderno aplicado a qualquer hamburgueria."

LOGOTIPO
O logotipo oficial é intocável.
Use apenas o arquivo fornecido.
Nunca redesenhe, reinterprete, altere proporções, tipografia, símbolo, arco ou composição.

DIREÇÃO DO LAYOUT
No desktop, manter a linguagem editorial do cardápio físico:
- logo e identidade no topo esquerdo;
- Allegre Brasa como elemento gastronômico de destaque no topo direito;
- título CARDÁPIO OFICIAL;
- título Allegre Burguer;
- slogan;
- separadores horizontais finos;
- duas colunas principais;
- Hambúrgueres Artesanais à esquerda;
- Batatas, Bebidas e Combos à direita;
- hambúrgueres numerados de 01 a 06;
- nome, descrição, frase curta e preço;
- ações de compra discretas, sem grandes cards arredondados.

No mobile:
- transformar a composição em uma coluna;
- preservar hierarquia editorial;
- manter excelente legibilidade;
- manter sacola fixa acessível;
- não transformar os produtos em grandes blocos genéricos.

FUNCIONALIDADES QUE DEVEM EXISTIR E CONTINUAR FUNCIONANDO
1. Navegação por categorias.
2. Busca por produto/ingrediente.
3. Modal de produto.
4. Remoção de ingredientes quando configurada.
5. Estrutura para adicionais, sem inventar valores.
6. Montagem obrigatória dos combos.
7. Escolha dos hambúrgueres dos combos.
8. Escolha das bebidas dos combos.
9. Controle de quantidade.
10. Sacola persistente em localStorage.
11. Alteração de quantidade dentro da sacola.
12. Exclusão de item.
13. Cross-sell / "Peça também".
14. Checkout.
15. Alternância entre Entrega e Retirada.
16. Nome.
17. Telefone/WhatsApp.
18. CEP.
19. Endereço.
20. Número.
21. Bairro.
22. Complemento.
23. Forma de pagamento.
24. Observações.
25. Consentimento de uso dos dados.
26. Geração do pedido estruturado para WhatsApp.
27. Captura de parâmetros UTM.
28. Captura de gclid.
29. Captura de fbclid.
30. dataLayer.
31. Estrutura de eventos de funil.
32. Payload de pedido preparado para futura integração com CRM.

TRACKING
Preservar ou implementar de forma limpa os seguintes eventos:
- menu_view
- view_item
- add_to_cart
- view_cart
- begin_checkout
- purchase_intent

Não inserir IDs falsos de Meta Pixel, Google Ads ou GA4.
Deixar pontos claros de configuração para inserir esses IDs futuramente.

CRM
Ainda NÃO construir o CRM.
Porém o pedido deve gerar um objeto estruturado contendo, no mínimo:
- orderId;
- timestamp;
- cliente;
- telefone;
- modalidade;
- endereço quando houver;
- itens;
- personalizações;
- subtotal;
- taxa de entrega quando existir;
- total;
- forma de pagamento;
- observações;
- origem;
- utm_source;
- utm_medium;
- utm_campaign;
- utm_content;
- utm_term;
- gclid;
- fbclid.

Esse objeto deve poder futuramente ser enviado por fetch() para uma API sem necessidade de refazer todo o front-end.

FOTOS
Não criar fotos falsas.
Não usar imagens genéricas.
Não baixar fotos de outros restaurantes.
Se existir foto oficial no projeto, usar.
Quando não existir foto oficial, usar um tratamento editorial coerente e discreto até que a imagem verdadeira seja fornecida.

RESPONSIVIDADE
Testar visualmente pelo menos:
- 1440 px;
- 1024 px;
- 768 px;
- 390 px.

Não permitir:
- overflow horizontal;
- textos cortados;
- preço sobreposto;
- botões fora da tela;
- modal maior que a viewport;
- sacola inacessível;
- quebra da estrutura do cardápio.

ACESSIBILIDADE
Garantir:
- labels de formulário;
- aria-label em botões apenas com ícone;
- contraste adequado;
- navegação por teclado razoável;
- foco visível;
- alt nas imagens;
- semantic HTML sempre que possível.

PERFORMANCE
Evitar bibliotecas desnecessárias.
O site deve continuar leve.
Usar imagens otimizadas.
Evitar JavaScript redundante.
Não criar animações pesadas.

ANIMAÇÕES
Utilizar somente microinterações discretas:
- hover suave;
- abertura e fechamento de modal;
- entrada de sacola;
- feedback ao adicionar item;
- transições curtas.

Nada chamativo.
Nada que pareça landing page genérica de agência.

POLÍTICA DE DADOS
Como o site coleta nome, telefone e endereço, preparar também:
- politica-de-privacidade.html

O texto não deve inventar práticas inexistentes.
Explique de forma simples que os dados informados no checkout são usados para atendimento e processamento do pedido e poderão futuramente integrar o CRM da própria Allegre Burguer.
Não alegue compartilhamento ou retenção específica sem base.

PÁGINA DE CONFIRMAÇÃO
Criar:
- pedido-confirmado.html

Por enquanto, o WhatsApp continua sendo a etapa operacional final.
A página deve ficar pronta para ser utilizada posteriormente como destino após confirmação real do pedido/pagamento e para disparar conversões confirmadas.
NÃO disparar compra concluída apenas porque o cliente abriu o WhatsApp.

REGRA DE ANALYTICS
purchase_intent = cliente chegou ao envio para WhatsApp.
purchase = somente futuramente, quando houver confirmação real do pedido.
Não confundir intenção de compra com venda concluída.

QUALIDADE DE CÓDIGO
- HTML semântico;
- CSS organizado por componentes;
- JS dividido por responsabilidades;
- nomes claros;
- nenhum código morto;
- nenhum console.log desnecessário;
- nenhuma dependência quebrada;
- sem links locais absolutos que falhem no Vercel.

VERCEL
O projeto deve continuar apto a deploy estático na Vercel.
Se necessário, crie vercel.json apenas quando houver motivo técnico real.
Não adicionar configuração inútil.

EXECUÇÃO E TESTES
Você deve de fato executar o projeto.

Passos obrigatórios:
1. Inspecione todos os arquivos.
2. Identifique problemas.
3. Corrija-os.
4. Execute localmente com um servidor HTTP.
5. Verifique erros no console.
6. Teste todas as principais interações.
7. Valide o JSON.
8. Valide sintaxe JavaScript.
9. Verifique links e assets.
10. Teste responsividade.
11. Corrija erros encontrados.
12. Só encerre quando a aplicação estiver utilizável.

Para execução local, você pode usar:
python -m http.server 8080

ou outra alternativa local simples disponível no ambiente.

NÃO apenas explique o que faria.
FAÇA as alterações diretamente nos arquivos.

ENTREGÁVEIS
Ao terminar, quero:
- projeto funcionando;
- arquivos atualizados;
- nenhuma perda das funcionalidades existentes;
- politica-de-privacidade.html;
- pedido-confirmado.html;
- README atualizado;
- resumo curto das alterações realizadas;
- lista objetiva de qualquer informação real que ainda precise ser fornecida pela proprietária.

PRINCÍPIO FINAL
A engenharia deve ser moderna.
A aparência deve continuar sendo ALLEGRE BURGUER.

Preserve a marca.
Preserve os dados.
Preserve a lógica comercial.
Melhore a experiência.
Não invente informação.
```
