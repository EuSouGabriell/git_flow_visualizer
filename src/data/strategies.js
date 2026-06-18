const STEP = 80;
const START_X = 100;

export const BRANCH_COLORS = {
  main:       '#22c55e',
  trunk:      '#22c55e',
  develop:    '#60a5fa',
  feature:    '#a78bfa',
  hotfix:     '#f87171',
  release:    '#fbbf24',
  staging:    '#fb923c',
  production: '#f87171',
};

function branchColor(id) {
  const key = Object.keys(BRANCH_COLORS).find(k => id.startsWith(k));
  return key ? BRANCH_COLORS[key] : '#8888a0';
}

function makeNode(id, branchId, step, label = '', type = 'commit') {
  return { id, branchId, x: START_X + step * STEP, label, type };
}

function makeEdge(from, to, type = 'branch') {
  return { from, to, type };
}

const STRATEGIES = {
  'GitFlow': {
    branches: [
      { id: 'main',    label: 'main',           color: BRANCH_COLORS.main,    y: 40  },
      { id: 'hotfix',  label: 'hotfix/patch',   color: BRANCH_COLORS.hotfix,  y: 100 },
      { id: 'release', label: 'release/1.0',    color: BRANCH_COLORS.release, y: 160 },
      { id: 'develop', label: 'develop',         color: BRANCH_COLORS.develop, y: 220 },
      { id: 'feature', label: 'feature/login',  color: BRANCH_COLORS.feature, y: 280 },
    ],
    initialGraph: {
      nodes: [
        makeNode('m0', 'main',    0, 'v0.9'),
        makeNode('m1', 'main',    4, 'v1.0'),
        makeNode('m2', 'main',    6, 'v1.1'),
        makeNode('h0', 'hotfix',  4, 'fix'),
        makeNode('h1', 'hotfix',  5, ''),
        makeNode('r0', 'release', 2, 'rc1'),
        makeNode('r1', 'release', 3, ''),
        makeNode('d0', 'develop', 0, 'init'),
        makeNode('d1', 'develop', 1, ''),
        makeNode('d2', 'develop', 3, ''),
        makeNode('d3', 'develop', 5, ''),
        makeNode('d4', 'develop', 6, ''),
        makeNode('f0', 'feature', 1, 'start'),
        makeNode('f1', 'feature', 2, ''),
        makeNode('f2', 'feature', 3, 'done'),
      ],
      edges: [
        makeEdge('d1', 'f0', 'branch'),
        makeEdge('f2', 'd2', 'merge'),
        makeEdge('d2', 'r0', 'branch'),
        makeEdge('r1', 'd3', 'merge'),
        makeEdge('r1', 'm1', 'merge'),
        makeEdge('m1', 'h0', 'branch'),
        makeEdge('h1', 'm2', 'merge'),
        makeEdge('h1', 'd3', 'merge'),
      ],
    },
    info: {
      concept: 'Modelo robusto com branches dedicadas para features, releases e hotfixes. Cada tipo de mudança tem seu próprio ciclo de vida isolado, com merges controlados em pontos bem definidos.',
      whenToUse: 'Projetos com ciclos de release agendados, múltiplas versões em produção simultâneas ou equipes grandes que precisam de isolamento entre tipos de trabalho.',
      tradeoffs: {
        pros: ['Isolamento total entre features', 'Hotfixes sem afetar features em desenvolvimento', 'Processo de release previsível'],
        cons: ['Alta complexidade de branches', 'Merges longos e conflitos acumulados', 'Lento para CI/CD contínuo'],
      },
    },
  },

  'GitHub Flow': {
    branches: [
      { id: 'main',          label: 'main',          color: BRANCH_COLORS.main,    y: 60  },
      { id: 'feature/login', label: 'feature/login', color: BRANCH_COLORS.feature, y: 140 },
      { id: 'feature/api',   label: 'feature/api',   color: '#34d399',             y: 220 },
    ],
    initialGraph: {
      nodes: [
        makeNode('m0', 'main',          0, 'init'),
        makeNode('m1', 'main',          2, ''),
        makeNode('m2', 'main',          3, 'merge'),
        makeNode('m3', 'main',          5, 'merge'),
        makeNode('fl0', 'feature/login', 1, 'start'),
        makeNode('fl1', 'feature/login', 2, ''),
        makeNode('fa0', 'feature/api',   3, 'start'),
        makeNode('fa1', 'feature/api',   4, ''),
        makeNode('fa2', 'feature/api',   5, 'done'),
      ],
      edges: [
        makeEdge('m0', 'fl0', 'branch'),
        makeEdge('fl1', 'm2', 'merge'),
        makeEdge('m2', 'fa0', 'branch'),
        makeEdge('fa2', 'm3', 'merge'),
      ],
    },
    info: {
      concept: 'Fluxo simplificado: apenas a branch main e feature branches de curta duração. Cada feature passa por pull request e deploy direto na main após aprovação.',
      whenToUse: 'Equipes com CI/CD maduro, deploy contínuo e uma única versão em produção. Ideal para produtos web com ciclos curtos.',
      tradeoffs: {
        pros: ['Simples de aprender e operar', 'Favorece integração contínua', 'Pouco overhead de processo'],
        cons: ['Frágil sem testes automatizados robustos', 'Difícil gerenciar múltiplas versões em produção', 'Main pode ficar instável'],
      },
    },
  },

  'Trunk-Based': {
    branches: [
      { id: 'main',        label: 'trunk (main)',    color: BRANCH_COLORS.main,    y: 80  },
      { id: 'short-lived', label: 'short-lived/auth', color: BRANCH_COLORS.feature, y: 180 },
    ],
    initialGraph: {
      nodes: [
        makeNode('m0', 'main',        0, 'init'),
        makeNode('m1', 'main',        1, ''),
        makeNode('m2', 'main',        2, ''),
        makeNode('m3', 'main',        3, 'merge'),
        makeNode('m4', 'main',        4, ''),
        makeNode('m5', 'main',        5, ''),
        makeNode('s0', 'short-lived', 2, 'start'),
        makeNode('s1', 'short-lived', 3, 'done'),
      ],
      edges: [
        makeEdge('m2', 's0', 'branch'),
        makeEdge('s1', 'm3', 'merge'),
      ],
    },
    info: {
      concept: 'Todos os devs integram diretamente na trunk (main) várias vezes ao dia. Branches existem por horas, não dias. Feature flags controlam o que está ativo em produção.',
      whenToUse: 'Times de alta performance com cultura DevOps forte, cobertura de testes sólida e uso de feature flags. É a base do verdadeiro CI.',
      tradeoffs: {
        pros: ['Integração contínua real', 'Conflitos resolvidos cedo e pequenos', 'Feedback rápido do CI'],
        cons: ['Exige feature flags e testes maduros', 'Alta disciplina do time', 'Risco de quebrar produção sem guardrails'],
      },
    },
  },

  'GitLab Flow': {
    branches: [
      { id: 'main',       label: 'main',       color: BRANCH_COLORS.main,       y: 50  },
      { id: 'staging',    label: 'staging',    color: BRANCH_COLORS.staging,    y: 130 },
      { id: 'production', label: 'production', color: BRANCH_COLORS.production, y: 210 },
      { id: 'feature',    label: 'feature/ui', color: BRANCH_COLORS.feature,    y: 290 },
    ],
    initialGraph: {
      nodes: [
        makeNode('m0', 'main',       0, 'init'),
        makeNode('m1', 'main',       1, ''),
        makeNode('m2', 'main',       3, 'merge'),
        makeNode('m3', 'main',       4, ''),
        makeNode('s0', 'staging',    1, ''),
        makeNode('s1', 'staging',    3, ''),
        makeNode('s2', 'staging',    4, ''),
        makeNode('p0', 'production', 2, ''),
        makeNode('p1', 'production', 4, ''),
        makeNode('f0', 'feature',    2, 'start'),
        makeNode('f1', 'feature',    3, 'done'),
      ],
      edges: [
        makeEdge('m0', 's0', 'branch'),
        makeEdge('s0', 'p0', 'branch'),
        makeEdge('m0', 'f0', 'branch'),
        makeEdge('f1', 'm2', 'merge'),
        makeEdge('m2', 's1', 'merge'),
        makeEdge('s2', 'p1', 'merge'),
      ],
    },
    info: {
      concept: 'Combina feature branches com environment branches (staging, production). Código flui da feature para main, depois para staging e por fim para production via merges controlados.',
      whenToUse: 'Projetos com múltiplos ambientes de deploy onde cada ambiente precisa de aprovação explícita antes de promover o código.',
      tradeoffs: {
        pros: ['Visibilidade do estado por ambiente', 'Mais simples que GitFlow', 'Fluxo de promoção previsível'],
        cons: ['Pode confundir sem convenção clara', 'Branches de ambiente acumulam divergência', 'Requer disciplina no fluxo de merge'],
      },
    },
  },
};

export default STRATEGIES;
export { branchColor };
