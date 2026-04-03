export type QuizQuestionType = "multipleChoice" | "matching" | "dragDrop";

export interface QuizQuestion {
  type: QuizQuestionType;
  question: string;
  options?: string[]; // Para múltiplas escolhas e dragDrop simples
  leftColumn?: string[]; // Para matching/connect
  rightColumn?: string[]; // Para matching/connect
  correctOptionIndex?: number;
  correctMapping?: Record<string, string>; // Mapeamento correto para tipo matching
}

export interface Quiz {
  _id: string;
  title: string;
  lessonId: string;
  questions: QuizQuestion[];
}

export interface Lesson {
  id: string; 
  tituloLicao: string;
  conteudo: string;
  bulletPoints?: string[];
  imageUrl?: string;
  conteudoAdicional?: string;
}

export interface ModuleContent {
  id: number;
  titulo: string;
  licoes: Lesson[];
}

export interface LearningDocument {
  title: string;
  description: string;
  difficulty: string;
  modulos: ModuleContent[];
}

// Mock de conteúdo vindo do banco de dados.
export const LEARNING_DOCUMENT: LearningDocument = {
  title: "Guia do Investidor Iniciante",
  description: "Aprenda os conceitos básicos para começar a investir com segurança.",
  difficulty: "Iniciante",
  modulos: [
    {
      id: 1,
      titulo: "Introdução ao dinheiro",
      licoes: [
        { 
          id: "lesson_1_1",
          tituloLicao: "O que é dinheiro?", 
          conteudo: "O dinheiro é uma ferramenta de troca que evoluiu do escambo para o digital.",
          bulletPoints: ["Meio de troca", "Unidade de conta", "Reserva de valor"],
          imageUrl: "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&q=80&w=400",
        },
        { 
          id: "lesson_1_2",
          tituloLicao: "Inflação", 
          conteudo: "A inflação é o aumento generalizado dos preços de bens e serviços em uma economia durante um período de tempo. Quando o nível geral de preços sobe, cada unidade de moeda compra menos bens e serviços; consequentemente, a inflação reflete uma redução do poder de compra por unidade de dinheiro. Isso significa que, com o passar dos anos, o seu dinheiro parado 'vale menos'. É por isso que investir não é apenas uma escolha para ganhar mais, mas uma necessidade para proteger o que você já tem contra a desvalorização natural da economia mundial.",
          bulletPoints: ["IPCA é o índice oficial", "Afeta o custo de vida", "Corrói economias paradas"],
          imageUrl: "https://images.unsplash.com/photo-1611974714158-f88c146d9a0d?auto=format&fit=crop&q=80&w=400",
        },
        { 
          id: "lesson_1_3",
          tituloLicao: "Juros Simples", 
          conteudo: "Cálculo de juros incidente apenas sobre o valor principal inicial.",
          bulletPoints: ["Fórmula: J = C . i . t", "Crescimento linear", "Menos comum em investimentos"],
        },
        { 
          id: "lesson_1_4",
          tituloLicao: "Juros Compostos", 
          conteudo: "Diferente dos juros simples, onde o percentual incide apenas sobre o valor inicial, os juros compostos são calculados sobre o montante acumulado de cada período anterior.",
          bulletPoints: ["Oiticava maravilha do mundo", "Crescimento exponencial", "Beneficia o investidor paciente"],
          imageUrl: "https://images.unsplash.com/photo-1579621970795-87f9ac756a70?auto=format&fit=crop&q=80&w=400"
        },
        { 
          id: "lesson_1_5",
          tituloLicao: "Reserva de Emergência", 
          conteudo: "Um montante guardado para cobrir imprevistos e dar paz de espírito.",
          bulletPoints: ["6 a 12 meses de custo", "Alta liquidez necessária", "Não é para luxos"],
        },
        { 
          id: "lesson_1_6",
          tituloLicao: "Perfil de Risco", 
          conteudo: "Sua tolerância a oscilações em troca de possíveis retornos maiores.",
          bulletPoints: ["Conservador", "Moderado", "Arrojado"],
        },
        { 
          id: "lesson_1_7",
          tituloLicao: "Bancos vs Corretoras", 
          conteudo: "Entenda a diferença entre onde você guarda e onde você investe.",
          bulletPoints: ["Taxas de corretagem", "Variedade de produtos", "Independência financeira"],
        },
        { 
          id: "lesson_1_8",
          tituloLicao: "Mentalidade de Riqueza", 
          conteudo: "Focar em ativos que geram renda em vez de passivos que geram despesas.",
          bulletPoints: ["Educação financeira contínua", "Disciplina nos aportes", "Foco no longo prazo"],
        }
      ]
    },
    {
      id: 2,
      titulo: "Organização financeira: Primeiros Passos",
      licoes: [
        { id: "lesson_2_1", tituloLicao: "Mapeando Gastos", conteudo: "Identifique para onde cada centavo está indo.", bulletPoints: ["Gastos fixos", "Variáveis"] },
        { id: "lesson_2_2", tituloLicao: "Regra 50/30/20", conteudo: "Método simplificado de orçamento.", bulletPoints: ["50% Necessidades", "30% Desejos", "20% Investir"] },
        { id: "lesson_2_3", tituloLicao: "Cortando Supérfluos", conteudo: "Economizar sem perder qualidade.", bulletPoints: ["Assinaturas", "Impulso"] },
        { id: "lesson_2_4", tituloLicao: "Ferramentas de Controle", conteudo: "Apps, planilhas ou cadernos.", bulletPoints: ["Controle diário", "Previsão"] },
        { id: "lesson_2_5", tituloLicao: "Consumo Consciente", conteudo: "Comprar o que agrega valor real.", bulletPoints: ["Pesquisar", "Necessidade vs Desejo"] }
      ]
    },
    {
      id: 3,
      titulo: "Conceitos Financeiros Essenciais",
      licoes: [
        { id: "lesson_3_1", tituloLicao: "Taxa SELIC", conteudo: "A taxa básica de juros do país.", bulletPoints: ["Copom", "Crédito"] },
        { id: "lesson_3_2", tituloLicao: "IPCA", conteudo: "Inflação oficial do Brasil.", bulletPoints: ["Preços", "Poder de compra"] },
        { id: "lesson_3_3", tituloLicao: "CDI", conteudo: "Taxa interbancária.", bulletPoints: ["Referência", "Renda Fixa"] },
        { id: "lesson_3_4", tituloLicao: "Câmbio", conteudo: "Valor da moeda estrangeira.", bulletPoints: ["Dólar", "Impacto"] }
      ]
    },
    {
      id: 4,
      titulo: "Créditos, Dívidas e Responsabilidade",
      licoes: [
        { id: "lesson_4_1", tituloLicao: "Cartão de Crédito", conteudo: "Ferramenta útil e perigosa.", bulletPoints: ["Milhas", "Juros"] },
        { id: "lesson_4_2", tituloLicao: "Juros de Empréstimos", conteudo: "Custo de usar dinheiro dos outros.", bulletPoints: ["CET", "Garantia"] },
        { id: "lesson_4_3", tituloLicao: "Saindo das Dívidas", conteudo: "Passos para a liberdade.", bulletPoints: ["Prioridade", "Negociação"] }
      ]
    },
    {
      id: 5,
      titulo: "Reserva de Emergência e Proteção",
      licoes: [
        { id: "lesson_5_1", tituloLicao: "Quanto guardar?", conteudo: "Cálculo para a paz mental.", bulletPoints: ["6-12 meses"] },
        { id: "lesson_5_2", tituloLicao: "Liquidez Diária", conteudo: "Acesso rápido ao dinheiro.", bulletPoints: ["Emergência"] },
        { id: "lesson_5_3", tituloLicao: "Seguros", conteudo: "Proteção patrimonial.", bulletPoints: ["Vida", "Auto"] }
      ]
    },
    {
      id: 6,
      titulo: "Trilha dos Investimentos: Renda Fixa",
      licoes: [
        { id: "lesson_6_1", tituloLicao: "Tesouro Direto", conteudo: "Emprestar para o governo.", bulletPoints: ["Selic", "IPCA"] },
        { id: "lesson_6_2", tituloLicao: "CDBs", conteudo: "Emprestar para o banco.", bulletPoints: ["Rendimento", "FGC"] },
        { id: "lesson_6_3", tituloLicao: "LCI e LCA", conteudo: "Isenção de Imposto de Renda.", bulletPoints: ["Imobiliário", "Agro"] }
      ]
    },
    {
      id: 7,
      titulo: "Trilha dos Investimentos: Renda Variável",
      licoes: [
        { id: "lesson_7_1", tituloLicao: "Ações", conteudo: "Virar sócio de empresas.", bulletPoints: ["Bolsa", "Partes"] },
        { id: "lesson_7_2", tituloLicao: "Fundos Imobiliários", conteudo: "Renda de aluguéis.", bulletPoints: ["Mensal", "Isento"] },
        { id: "lesson_7_3", tituloLicao: "Dividendos", conteudo: "Divisão de lucros.", bulletPoints: ["Yield", "Passivo"] }
      ]
    },
    {
      id: 8,
      titulo: "Planejamento de Longo Prazo",
      licoes: [
        { id: "lesson_8_1", tituloLicao: "Aposentadoria Privada", conteudo: "PGBL vs VGBL.", bulletPoints: ["Dedução", "Meta"] },
        { id: "lesson_8_2", tituloLicao: "Independência Financeira", conteudo: "Viver de renda.", bulletPoints: ["Liberdade"] },
        { id: "lesson_8_3", tituloLicao: "Rebalanceamento", conteudo: "Venda na alta, compre na baixa.", bulletPoints: ["Risco"] }
      ]
    }
  ],
};

// Nova Collection para Quizzes (Mockando outra "tabela" do banco)
export const QUIZZES: Quiz[] = [
  {
    _id: "68e44e36e1124d17bafdd2a3",
    title: "Desafio Módulo 1",
    lessonId: "lesson_1_1",
    questions: [
      {
        type: "multipleChoice",
        question: "Qual das funções abaixo NÃO é uma função clássica do dinheiro?",
        options: ["Reserva de valor", "Meio de troca", "Unidade de conta", "Instrumento de doação"],
        correctOptionIndex: 3
      },
      {
        type: "matching",
        question: "Conecte os conceitos às suas definições corretas:",
        leftColumn: ["Escambo", "Sal", "Ouro"],
        rightColumn: ["Troca direta", "Moeda mercadoria", "Metal precioso"],
        correctMapping: { "Escambo": "Troca direta", "Sal": "Moeda mercadoria", "Ouro": "Metal precioso" }
      },
      {
        type: "dragDrop",
        question: "Organize a evolução do dinheiro da mais antiga para a mais recente:",
        options: ["Papel-Moeda", "Escambo", "Moedas Metálicas", "Dinheiro Digital"],
      }
    ]
  },
  {
    _id: "68e44e36e1124d17bafdd2a4",
    title: "Desafio Módulo 1",
    lessonId: "lesson_1_2",
    questions: [
      {
        type: "multipleChoice",
        question: "O que acontece com o seu poder de compra quando a inflação sobe?",
        options: ["Ele aumenta", "Ele diminui", "Ele permanece igual", "Ele dobra"],
        correctOptionIndex: 1
      },
      {
        type: "matching",
        question: "Relacione os termos da inflação:",
        leftColumn: ["IPCA", "Selic", "Deflação"],
        rightColumn: ["Índice oficial", "Taxa de juros", "Queda de preços"],
        correctMapping: { "IPCA": "Índice oficial", "Selic": "Taxa de juros", "Deflação": "Queda de preços" }
      },
      {
        type: "dragDrop",
        question: "Coloque em ordem o ciclo da inflação alta:",
        options: ["Aumento de Preços", "Impressão de Moeda", "Perda de Valor", "Menor Consumo"],
      }
    ]
  },
  {
    _id: "68e44e36e1124d17bafdd2a5",
    title: "Desafio Módulo 2",
    lessonId: "lesson_2_1",
    questions: [
      {
        type: "multipleChoice",
        question: "Qual deve ser o primeiro passo da organização financeira?",
        options: ["Investir em ações", "Anotar gastos", "Pedir empréstimo", "Comprar um carro"],
        correctOptionIndex: 1
      },
      {
        type: "matching",
        question: "Conecte os tipos de gastos:",
        leftColumn: ["Fixo", "Variável", "Supérfluo"],
        rightColumn: ["Aluguel", "Luz/Água", "Streaming"],
        correctMapping: { "Fixo": "Aluguel", "Variável": "Luz/Água", "Supérfluo": "Streaming" }
      },
      {
        type: "dragDrop",
        question: "Organize as etapas do orçamento mensal:",
        options: ["Receber Salário", "Pagar Contas Fixas", "Separar Investimento", "Lazer"],
      }
    ]
  }
];

export function getModuleById(id: number): ModuleContent | undefined {
  return LEARNING_DOCUMENT.modulos.find((mod) => mod.id === id);
}

export function getQuizByLessonId(lessonId: string): Quiz | undefined {
  return QUIZZES.find((q) => q.lessonId === lessonId);
}
