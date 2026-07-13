# Git Flow Visualizer

Aplicacao web interativa para demonstrar, de forma visual, como diferentes estrategias de branching funcionam no Git.

O projeto mostra branches, commits e relacoes entre historicos em um grafo SVG. A ideia e ajudar estudantes, equipes e pessoas em onboarding a entenderem melhor operacoes como `commit`, `merge`, `rebase`, `cherry-pick` e reset de historico simulado.

## Recursos

- Visualizacao interativa de historicos Git em SVG.
- Alternancia entre estrategias de branching.
- Simulacao de `commit`, `merge`, `rebase` e `cherry-pick`.
- Selecao de branch ativa e branch de destino.
- Reset da ultima alteracao simulada na branch ativa.
- Reset geral para retornar ao estado inicial da estrategia.
- Painel explicativo com conceito, quando usar, vantagens e desvantagens.
- Interface responsiva construida com React e CSS.

## Estrategias disponiveis

| Estrategia | Ideia principal | Melhor cenario |
| --- | --- | --- |
| GitFlow | Separa `main`, `develop`, `feature`, `release` e `hotfix`. | Projetos com releases planejadas e maior controle de versoes. |
| GitHub Flow | Usa `main` e branches curtas para features. | Produtos com CI/CD e deploy frequente. |
| Trunk-Based | Integra mudancas rapidamente na trunk. | Times maduros com testes, feature flags e integracao continua. |
| GitLab Flow | Combina feature branches com branches de ambiente. | Projetos com fluxo de promocao entre staging e production. |

## Como usar

1. Escolha uma estrategia no topo da tela.
2. Selecione a branch ativa na barra inferior.
3. Escolha a branch de destino para operacoes de `merge` e `rebase`.
4. Clique em `Commit` para adicionar um commit na branch ativa.
5. Clique em `Merge` para criar um commit de merge na branch de destino.
6. Clique em `Rebase` para reposicionar a branch ativa a partir da branch de destino.
7. Para `Cherry-pick`, selecione um commit de outra branch no grafo e acione o botao.
8. Use `Remover ultimo` para desfazer a ultima acao simulada da branch ativa.
9. Use `Resetar tudo` para limpar as interacoes e voltar ao estado inicial.

## Tecnologias

- React
- Vite
- CSS modular por componente
- SVG para renderizacao do grafo
- ESLint para padronizacao

## Requisitos

- Node.js instalado
- npm instalado

## Instalacao

```bash
npm install
```

## Ambiente de desenvolvimento

```bash
npm run dev
```

Depois, acesse o endereco exibido pelo Vite no terminal.

## Build de producao

```bash
npm run build
```

## Preview do build

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Estrutura do projeto

```text
src/
  App.jsx
  App.css
  data/
    strategies.js
  hooks/
    useGraphState.js
  components/
    Controls/
    GitGraph/
    Header/
    InfoPanel/
```

## Principais modulos

- `src/data/strategies.js`: define as estrategias, branches iniciais, commits e textos explicativos.
- `src/hooks/useGraphState.js`: concentra as regras de manipulacao do grafo.
- `src/components/GitGraph`: renderiza o historico Git em SVG.
- `src/components/Controls`: controla branch ativa, destino e operacoes.
- `src/components/InfoPanel`: apresenta o resumo da estrategia selecionada.

## Objetivo educacional

Este projeto nao tenta substituir o Git real. Ele simula operacoes comuns para facilitar a compreensao visual dos efeitos de cada fluxo de trabalho. O foco e explicar branching strategies de forma pratica, comparavel e facil de demonstrar.
