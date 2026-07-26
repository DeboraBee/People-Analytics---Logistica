# People Analytics · Logística (case J&T Express)

**Dashboard executivo de RH que transforma a base de ~1.000 colaboradores de uma transportadora em decisões: onde estamos perdendo gente, quem está sobrecarregado e onde o RH deve agir primeiro.**

![Python](https://img.shields.io/badge/Python-ETL-3776AB?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Recharts](https://img.shields.io/badge/Recharts-3-FF6384)
![Status](https://img.shields.io/badge/dados-fict%C3%ADcios-important)

---

> ### ⚠️ Sobre os dados
> Esta base é **100% fictícia (mockada)**. Ela representa uma J&T Express **imaginária** e foi construída por mim para um processo seletivo de **People Analytics Jr**. Nenhum número, nome ou salário corresponde a pessoa ou empresa real. A modelagem da empresa (departamentos, cargos, CDs) foi desenhada por mim justamente para demonstrar raciocínio de RH e de dados. A série mensal é um **painel reconstruído a partir do snapshot** (detalhes na seção [Metodologia e limitações](#metodologia-e-limitações)).

---

## Sumário

- [Para quem não é da área: o que é isso?](#para-quem-não-é-da-área-o-que-é-isso)
- [As perguntas que o dashboard responde](#as-perguntas-que-o-dashboard-responde)
- [Principais conclusões](#principais-conclusões)
- [Os dados analisados](#os-dados-analisados)
- [Modelo de dados (para quem é da área)](#modelo-de-dados-para-quem-é-da-área)
- [Stack e arquitetura](#stack-e-arquitetura)
- [Como rodar](#como-rodar)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Metodologia e limitações](#metodologia-e-limitações)
- [Sobre](#sobre)

---

## Para quem não é da área: o que é isso?

Toda empresa grande tem uma pergunta cara de responder: **as pessoas estão bem, e onde estão os problemas?** Uma transportadora com mil funcionários espalhados por centros de distribuição no país inteiro não consegue enxergar isso no olho. Precisa de números.

**People Analytics** é o uso de dados de RH para responder a essas perguntas com evidência, não com achismo. Este projeto pega uma base de RH e a transforma num **painel executivo**: a mesma tela que um diretor abriria para decidir onde investir tempo e dinheiro. Ele mostra, por exemplo, quantas pessoas a empresa tem, quais áreas mais perdem funcionários, quem está fazendo hora extra demais e qual unidade precisa de atenção urgente.

O projeto tem duas metades. Uma parte de **tratamento de dados** (em Python) que limpa e organiza a base bruta. E uma parte de **visualização** (o dashboard em si) onde qualquer gestor navega, filtra e compara sem precisar saber programar.

**Por que isso importa num contexto de análise de dados:** o valor não está em fazer um gráfico bonito. Está em partir de uma pergunta de negócio ("estamos perdendo gente demais?"), escolher a métrica certa, calcular no denominador correto e entregar a resposta de um jeito que quem decide entenda em segundos. É esse caminho completo, da base crua à decisão, que o projeto demonstra.

---

## As perguntas que o dashboard responde

O painel foi desenhado em torno de **10 perguntas de negócio**, organizadas em **6 telas**:

| Tela | Pergunta de negócio | Principais indicadores |
|------|---------------------|------------------------|
| **Visão Geral** | Como está a saúde da força de trabalho? Estamos crescendo ou encolhendo? | Headcount, ativos x inativos, turnover (12 meses), absenteísmo, tempo de casa, evolução mensal |
| **Pessoas** | Quem são as pessoas? A empresa é diversa e equilibrada? | Pirâmide etária, sexo, representatividade PCD, mulheres em liderança, escolaridade, tempo de empresa |
| **Performance** | Como está o desenvolvimento das pessoas? Treinamento vira promoção? | Nota de desempenho, % de promoções, % treinados, horas de treinamento, desempenho x horas extras |
| **Saúde Organizacional** | Estamos sobrecarregando ou adoecendo as equipes? | Absenteísmo, afastamentos por motivo, banco de horas, horas extras, engajamento, férias vencidas |
| **Unidades (CDs)** | Existem unidades críticas? Onde agir primeiro? | Ranking de risco por CD combinando turnover, absenteísmo, horas extras e engajamento |
| **Remuneração & Recrutamento** | Quanto custa cada área? Contratamos no prazo? | Média salarial, custo da folha por área, salário por cargo, SLA de recrutamento |

Todas as telas compartilham uma **barra de filtros** (departamento, cargo, regional, sexo, contrato, status). Qualquer recorte recalcula os indicadores na hora, inclusive a série mensal de turnover e absenteísmo.

---

## Principais conclusões

> Os números abaixo são calculados diretamente da base atual (`scripts/`), então refletem exatamente o que o dashboard mostra. A leitura de negócio é um ponto de partida, aberta a refinamento.

### 1. Saúde da força de trabalho
São **917 colaboradores ativos** e 83 inativos no histórico, num total de 1.000 registros. O tempo médio de casa é de **5,4 anos**, sinal de um quadro relativamente estabilizado. A força de trabalho está concentrada, como esperado numa transportadora, na ponta operacional: **Operações (265), Centro de Distribuição (192) e Last Mile (150)** somam mais de dois terços do quadro.

### 2. Retenção e turnover
O turnover em janela móvel de 12 meses fechou em **5,4%**, patamar saudável para o setor. Mas a média esconde diferença entre áreas: o **Comercial lidera com 13,9%**, seguido de Atendimento (9,7%) e Operações (9,6%). O Last Mile, que a intuição apontaria como o mais crítico, está em 6,2%, **abaixo** da média. Entre os desligamentos, cerca de **três quartos são involuntários** (fim de contrato e desligamento sem justa causa) e um quarto é pedido de demissão, o que direciona a conversa mais para dimensionamento de quadro do que para fuga de talentos.

### 3. Absenteísmo
O absenteísmo médio é de **2,96%**, abaixo de uma meta usual de 4%. As áreas com maior índice são **Transporte (3,11%), Tecnologia (3,07%) e Operações (3,04%)**, todas ainda dentro de faixa administrável. Não há unidade em situação de alerta absoluto, o que faz do absenteísmo aqui um indicador de acompanhamento, não de ação imediata.

### 4. Sobrecarga
As horas extras se concentram em **Transporte (33h/mês em média), RH (32,8h) e Atendimento (31h)**. Transporte aparecer no topo tanto de horas extras quanto de absenteísmo é o tipo de coincidência que merece investigação: pode indicar equipe no limite.

### 5. Gestores e liderança
Aqui a base impôs um limite honesto: o campo `gestor` traz **985 nomes distintos em 1.000 registros**, nenhum com mais de 2 liderados. Ou seja, não é uma hierarquia real, e calcular "turnover por gestor" em cima disso produziria um número falso. Em vez de forçar a métrica, a análise pivota: a página **Performance** ranqueia os colaboradores que ocupam **cargos de gestão (Supervisor, Coordenador, Gerente)** pela nota de desempenho individual. A leitura de liderança que a base sustenta é a de desempenho dos próprios líderes, não a de comparação entre equipes.

### 6. Desenvolvimento
O engajamento médio é alto (**74/100**) e a nota média de desempenho é **3,24 de 5**. O ponto de atenção é a **taxa de promoção de apenas 1,6%**: há treinamento e engajamento, mas pouca mobilidade interna visível. Vale investigar se o desenvolvimento está se convertendo em carreira.

### 7. Remuneração
O salário médio é de **R$ 6.495**. O custo de folha se concentra onde está o volume de gente: **Last Mile (R$ 1,35 mi) e Operações (R$ 1,23 mi)**. Por nível, a diferença é a esperada: operacional R$ 2.737, tático R$ 7.501 e estratégico R$ 15.710 em média.

### 8. Recrutamento
O SLA médio de contratação é de **36 dias**. A tela de Remuneração & Recrutamento permite ver quais áreas estouram esse prazo e priorizar o pipeline.

### 9 e 10. Unidades críticas e onde agir primeiro
Esta é a pergunta de diretor. O **score de risco por CD** (combinando turnover, absenteísmo, horas extras e engajamento, normalizados) aponta a prioridade:

| CD | Score de risco | Turnover | Absenteísmo | Horas extras |
|----|:---:|:---:|:---:|:---:|
| **CD Brasília** | **81** | 8,7% | 3,17% | 33h |
| CD Curitiba | 62 | 10,3% | 3,05% | 29h |
| CD Campinas | 53 | 5,6% | 3,04% | 29h |
| CD São Paulo | 49 | 9,9% | 2,94% | 30h |

**O CD Brasília é a unidade que mais demanda atenção do RH**, puxado pela combinação de horas extras altas e absenteísmo acima dos pares. É por ele que uma ação de retenção e revisão de carga deveria começar.

---

## Os dados analisados

A base bruta é um **snapshot** com **1.000 colaboradores e 34 atributos** por pessoa. Principais grupos de variáveis:

- **Perfil:** nome, sexo, idade, estado civil, escolaridade, cidade, estado, PCD
- **Vínculo:** regional, centro de distribuição, departamento, cargo, gestor, data de admissão, tempo de empresa, tipo de contrato, modelo de trabalho, status
- **Movimentação:** turnover, motivo de desligamento
- **Jornada e saúde:** faltas, absenteísmo, dias e tipo de afastamento, horas extras, banco de horas, férias pendentes
- **Remuneração e desenvolvimento:** salário, SLA de recrutamento, nota de desempenho, engajamento, horas de treinamento, promovido

### A empresa fictícia

Transportadora nacional com ~1.000 colaboradores, **10 departamentos**, cada pessoa ligada a um único departamento, cargo, gestor, CD e regional. Os cargos seguem três níveis: **Operacional** (Auxiliar, Conferente, Motorista), **Tático** (Assistente, Analista, Analista Sênior, Supervisor) e **Estratégico** (Coordenador, Gerente).

| Departamento | Papel | Peso no quadro |
|--------------|-------|:---:|
| Operações | Operação diária, controle de processos, fluxo de mercadorias | ~30% (maior área) |
| Centro de Distribuição | Recebimento, separação, conferência, armazenagem, expedição | Grande |
| Last Mile | Entrega final ao cliente, reentregas, monitoramento | Grande |
| Transporte | Deslocamento entre CDs e hubs, rotas, motoristas | Médio |
| Atendimento ao Cliente | Suporte, reclamações, rastreamento, pós-venda | Médio |
| Financeiro | Contas, fluxo de caixa, orçamento, custos | Menor |
| RH | Recrutamento, treinamento, benefícios, folha, clima | Menor |
| Comercial | Prospecção, relacionamento, negociação, contratos | Menor |
| Tecnologia | Sistemas, infra, BI, desenvolvimento, segurança | Menor |
| Jurídico | Contratos, processos, compliance, consultoria | Menor |

---

## Modelo de dados (para quem é da área)

O ETL transforma o CSV bruto num **modelo estrela**, separando dimensões (o que descreve) de fatos (o que se mede):

```
                     ┌──────────────────┐
                     │  dim_colaborador │  perfil, vínculo, status
                     └────────┬─────────┘
                              │
   ┌──────────────────┐   ┌───┴─────────┐   ┌──────────────┐
   │ dim_departamento │───│  fato_rh    │───│  dim_cargo   │
   └──────────────────┘   │ (1 linha /  │   │ nível: oper/ │
                          │ colaborador) │   │ tát/estrat)  │
                          └───┬─────────┘   └──────────────┘
                              │
                 ┌────────────┴─────────────┐
                 │  fato_rh_mensal          │  série agregada (empresa)
                 │  fato_rh_mensal_colab.   │  painel colaborador × mês
                 └──────────────────────────┘
```

- **`fato_rh`** — grão de 1 linha por colaborador (snapshot atual), com as métricas de RH.
- **`fato_rh_mensal`** — série temporal de 24 meses agregada no total da empresa (headcount, turnover, absenteísmo).
- **`fato_rh_mensal_colaborador`** — o mesmo histórico no grão colaborador × mês, com os atributos de dimensão embutidos, para que a **evolução mensal seja recalculada no navegador em cima do recorte filtrado**.

Decisões de modelagem documentadas no código: turnover em **janela móvel de 12 meses** (o turnover pontual mês a mês oscila demais com poucos desligamentos e fica ilegível); nível de cargo derivado por regra de negócio; faixas etárias e salariais criadas na etapa de derivação.

---

## Stack e arquitetura

**Pipeline de dados (Python + pandas)**
1. `generate_serie_mensal_raw.py` — reconstrói um painel colaborador × mês (24 meses) a partir do snapshot.
2. `build_star_schema.py` — limpa a base e monta o modelo estrela (dimensões + fatos).
3. `build_dashboard_data.py` — desnormaliza e exporta os JSONs que o front consome.

Reprodutibilidade garantida por seed fixa (`SEED = 42`), inclusive por colaborador.

**Dashboard (React 19 + Vite 8)**
- Roteamento por `react-router-dom` (HashRouter, compatível com GitHub Pages).
- Gráficos em `recharts`.
- Estado de filtros compartilhado via `FilterContext`, agregações em `utils/aggregate.js`.
- Dados carregados como JSON estático (sem backend): o dashboard roda inteiro no navegador.

---

## Como rodar

**Pipeline de dados** (opcional, os dados já vêm processados):
```bash
cd scripts
pip install pandas numpy
python generate_serie_mensal_raw.py
python build_star_schema.py
python build_dashboard_data.py
```

**Dashboard:**
```bash
cd app
npm install
npm run dev        # ambiente local
npm run build      # build de produção
npm run deploy     # publica no GitHub Pages
```

---

## Estrutura de pastas

```
People-Analytics---Logistica/
├── data/
│   ├── raw/           # base bruta (snapshot) + painel mensal gerado
│   └── processed/     # modelo estrela: dim_* e fato_*
├── scripts/           # ETL em Python (3 etapas)
└── app/               # dashboard React + Vite
    └── src/
        ├── pages/     # as 6 telas do painel
        ├── components/# KPIs, gráficos, filtros, sidebar
        ├── context/   # FilterContext (filtros globais)
        ├── utils/     # agregações e cálculo da pirâmide
        └── data/      # JSONs consumidos pelo front
```

---

## Metodologia e limitações

Transparência é parte da entrega:

- **A base é sintética.** Foi desenhada para ser coerente (salário por cargo, faixas etárias plausíveis, proporções realistas), mas não substitui dado real.
- **A série mensal é reconstruída, não observada.** O snapshot original não tem histórico. O painel mês a mês é gerado por um **passeio aleatório ancorado no valor real de cada colaborador**, então o último mês bate com o snapshot. Consequência prática: os **recortes cruzados** (por CD, área, cargo) são confiáveis, mas a **tendência temporal não carrega sinal real** (a variação mês a mês do turnover e a leve queda do absenteísmo são propriedades da simulação, não fenômenos a interpretar).
- **O score de risco por CD é relativo.** Usa normalização min-max dentro do recorte filtrado, com peso igual entre os quatro fatores. Um score alto significa "pior que os pares no recorte atual", não um risco absoluto.
- **Custo de folha considera só o salário.** No Brasil, o custo real inclui encargos (aproximadamente 1,7x). Fica como próximo passo.

---

## Sobre

Projeto autoral desenvolvido para um processo seletivo de **People Analytics Jr**. O objetivo é demonstrar o ciclo completo de análise de dados aplicada a RH: da modelagem da base bruta e do ETL até a entrega de um dashboard executivo que responde perguntas de negócio e aponta prioridades de ação.

*Dados fictícios. J&T Express é citada apenas como contexto de mercado; não há vínculo nem dados reais da empresa.*
