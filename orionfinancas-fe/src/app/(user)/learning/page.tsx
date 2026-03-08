"use client";

import { Fragment, useState, useEffect } from "react";
import styles from "./Learning.module.css";
import { LEARNING_DOCUMENT, getModuleById, getQuizByLessonId, type Quiz, type QuizQuestion } from "./lessonsData";
import Image from "next/image";

// Dnd Kit & Icons Imports
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Flame, Coins, Zap, Star, SendHorizontal } from 'lucide-react';

type ModuleStatus = "completed" | "active" | "locked";

interface Modulo {
  id: number;
  label: string;
  title: string;
  status: ModuleStatus;
}

const MODULOS: Modulo[] = [
  { id: 1, label: "MÓDULO 1", title: "Introdução ao dinheiro", status: "completed" },
  { id: 2, label: "MÓDULO 2", title: "Organização financeira: Primeiros Passos", status: "active" },
  { id: 3, label: "MÓDULO 3", title: "Conceitos Financeiros Essenciais", status: "active" },
  { id: 4, label: "MÓDULO 4", title: "Créditos, Dívidas e Responsabilidade Financeira", status: "active" },
  { id: 5, label: "MÓDULO 5", title: "Reserva de Emergência e Proteção", status: "active" },
  { id: 6, label: "MÓDULO 6", title: "Trilha dos Investimentos: Renda Fixa", status: "active" },
  { id: 7, label: "MÓDULO 7", title: "Trilha dos Investimentos: Renda Variável", status: "active" },
  { id: 8, label: "MÓDULO 8", title: "Planejamento de Longo Prazo e Aposentadoria", status: "active" },
];

const PlayIcon = () => (
  <div className={styles.playIconContainer}>
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  </div>
);

const TRAIL_OFFSETS = [-120, 80, -50, 110, -20, 90, -70, 130, -30, 60, -90, 40];

// Componente para item arrastável
function SortableItem(props: { id: string; text: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={styles.dragDropItem}
    >
      <div className={styles.dragDropNumber}>{props.index + 1}</div>
      <span className={styles.dragDropText}>{props.text}</span>
    </div>
  );
}

export default function Learning() {
  const [activeModule, setActiveModule] = useState<Modulo | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isLessonViewOpen, setIsLessonViewOpen] = useState(false);
  const [lessonPhase, setLessonPhase] = useState<"content" | "questions">("content");
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Estados para feedback e gamificação
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");

  // Estados para os itens arrastáveis
  const [dragItems, setDragItems] = useState<string[]>([]);
  const [matchingItems, setMatchingItems] = useState<string[]>([]);

  // Sensores para o DND
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevenir arraste acidental ao clicar
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleModuleClick = (mod: Modulo) => {
    if (mod.status === "locked") return;
    setActiveModule(mod);
    setActiveLessonIndex(0);
    setLessonPhase("content");
    setCurrentQuestionIndex(0);
    setCurrentQuiz(null);
  };

  const handleBackToModules = () => {
    setActiveModule(null);
    setActiveLessonIndex(0);
    setIsLessonViewOpen(false);
    setLessonPhase("content");
    setCurrentQuestionIndex(0);
    setCurrentQuiz(null);
  };

  const handleBackToTrail = () => {
    setIsLessonViewOpen(false);
    setLessonPhase("content");
    setCurrentQuiz(null);
  };

  const activeContent = activeModule ? getModuleById(activeModule.id) : null;
  const lessons = activeContent?.licoes ?? [];
  const currentLesson = lessons[activeLessonIndex];
  const questions = currentQuiz?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];

  // Sincronizar itens quando a questão mudar
  useEffect(() => {
    if (currentQuestion?.type === "dragDrop" && currentQuestion.options) {
      setDragItems([...currentQuestion.options]);
    } else if (currentQuestion?.type === "matching" && currentQuestion.rightColumn) {
      setMatchingItems([...currentQuestion.rightColumn]);
    }
  }, [currentQuestionIndex, currentQuiz, currentQuestion]);

  const handleLessonClick = (index: number) => {
    setActiveLessonIndex(index);
    setIsLessonViewOpen(true);
    setLessonPhase("content");
    setCurrentQuestionIndex(0);
    setCurrentQuiz(null);
  };

  const goToQuestions = () => {
    if (!currentLesson) return;
    const quiz = getQuizByLessonId(currentLesson.id);
    if (!quiz) {
      completeLesson();
      return;
    }
    setCurrentQuiz(quiz);
    setLessonPhase("questions");
    setCurrentQuestionIndex(0);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      setLessonPhase("questions");
      setCurrentQuestionIndex(questions.length); // Marcar como concluído
    }
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else {
      setLessonPhase("content");
    }
  };

  const completeLesson = () => {
    setIsLessonViewOpen(false);
    setLessonPhase("content");
    setCurrentQuestionIndex(0);
    setCurrentQuiz(null);
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(prev => prev + 1);
    }
  };

  const getConnectorStyle = (index: number) => {
    if (!lessons.length || index >= lessons.length - 1) return {};
    const currentOffset = TRAIL_OFFSETS[index % TRAIL_OFFSETS.length];
    const nextOffset = TRAIL_OFFSETS[(index + 1) % TRAIL_OFFSETS.length];
    const width = Math.abs(nextOffset - currentOffset);
    const minOffset = Math.min(currentOffset, nextOffset);
    const isJPath = index === 6 || (index === 3); 
    const baseStyle: React.CSSProperties = {
      width: `${width}px`,
      left: `calc(50% + ${minOffset}px)`,
      height: "116px",
    };
    if (currentOffset < nextOffset) {
      if (isJPath) return { ...baseStyle, borderTop: "none", borderRight: "none", borderBottomLeftRadius: "50px", top: "42px" };
      return { ...baseStyle, borderLeft: "none", borderBottom: "none", borderTopRightRadius: "50px", top: "42px" };
    } else {
      if (isJPath) return { ...baseStyle, borderTop: "none", borderLeft: "none", borderBottomRightRadius: "50px", top: "42px" };
      return { ...baseStyle, borderRight: "none", borderBottom: "none", borderTopLeftRadius: "50px", top: "42px" };
    }
  };

  const renderMultipleChoice = (q: QuizQuestion) => (
    <div className={styles.quizOptions}>
      {q.options?.map((opt: string, i: number) => (
        <button key={i} className={styles.quizOptionButton} onClick={goToNextQuestion}>
          {opt}
        </button>
      ))}
    </div>
  );

  const renderMatching = (q: QuizQuestion) => {
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setMatchingItems((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    return (
      <div className={styles.dragDropList}>
        <div className={styles.matchingGrid}>
          <div className={styles.matchingColumn}>
            <span className={styles.columnLabel}>Conceitos</span>
            {q.leftColumn?.map((item, i) => (
              <div key={i} className={styles.matchingItem}>{item}</div>
            ))}
          </div>
          <div className={styles.matchingColumn}>
            <span className={styles.columnLabel}>Definições (Arraste)</span>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={matchingItems}
                strategy={verticalListSortingStrategy}
              >
                {matchingItems.map((opt, i) => (
                  <SortableItem key={opt} id={opt} text={opt} index={i} />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
        <button 
          className={styles.studyBtnNext} 
          style={{ marginTop: '2rem', width: '220px', alignSelf: 'center' }}
          onClick={goToNextQuestion}
        >
          Verificar Combinação
        </button>
      </div>
    );
  };

  const renderDragDrop = () => {
    const handleDragEnd = (event: DragEndEvent) => {
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setDragItems((items) => {
          const oldIndex = items.indexOf(active.id as string);
          const newIndex = items.indexOf(over.id as string);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    };

    return (
      <div className={styles.dragDropList}>
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={dragItems}
            strategy={verticalListSortingStrategy}
          >
            {dragItems.map((opt, i) => (
              <SortableItem key={opt} id={opt} text={opt} index={i} />
            ))}
          </SortableContext>
        </DndContext>
        
        <button 
          className={styles.studyBtnNext} 
          style={{ marginTop: '1rem', width: '200px', alignSelf: 'center' }}
          onClick={goToNextQuestion}
        >
          Confirmar Ordem
        </button>
      </div>
    );
  };

  if (activeModule && activeContent && lessons.length > 0) {
    if (isLessonViewOpen && currentLesson) {
      if (lessonPhase === "questions") {
        if (currentQuestionIndex >= questions.length) {
          return (
            <div className={styles.studyViewContainer}>
              <div className={styles.studyWrapper}>
                <header className={styles.studyHeader} style={{ textAlign: 'center' }}>
                  <h2 className={styles.studyLessonTitle} style={{ fontSize: '2rem' }}>Lição Concluída!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Você dominou <strong>{currentLesson.tituloLicao}</strong></p>
                </header>

                <section className={styles.conclusionContent}>
                  <div className={styles.summaryPanel}>
                    <div className={styles.rewardsRow}>
                      <div className={styles.rewardCard}>
                        <div className={styles.rewardIconWrapper} style={{ color: '#ff5722' }}>
                          <Flame size={32} fill="currentColor" />
                        </div>
                        <span className={styles.rewardValue}>+1</span>
                        <span className={styles.rewardLabel}>Ofensiva</span>
                      </div>
                      <div className={styles.rewardCard}>
                        <div className={styles.rewardIconWrapper} style={{ color: '#ffcc00' }}>
                          <Coins size={32} fill="currentColor" />
                        </div>
                        <span className={styles.rewardValue}>+15</span>
                        <span className={styles.rewardLabel}>Moedas</span>
                      </div>
                      <div className={styles.rewardCard}>
                        <div className={styles.rewardIconWrapper} style={{ color: '#00d2ff' }}>
                          <Zap size={32} fill="currentColor" />
                        </div>
                        <span className={styles.rewardValue}>+50</span>
                        <span className={styles.rewardLabel}>XP Ganho</span>
                      </div>
                    </div>

                    <div className={styles.ratingSection}>
                      <p className={styles.ratingTitle}>O que você achou desta aula?</p>
                      <div className={styles.starRating}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button 
                            key={s} 
                            className={`${styles.starBtn} ${rating >= s ? styles.starActive : ''}`}
                            onClick={() => setRating(s)}
                          >
                            <Star size={32} fill={rating >= s ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                      <div className={styles.feedbackBox}>
                        <input 
                          type="text" 
                          placeholder="Deixe um comentário (opcional)" 
                          className={styles.feedbackInput}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                        />
                        <button className={styles.btnSendFeedback}>
                          <span>Enviar</span>
                          <SendHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <footer className={styles.studyActions}>
                  <button type="button" className={styles.studyBtnNext} onClick={completeLesson}>
                    Continuar Trilha
                  </button>
                </footer>
              </div>
            </div>
          );
        }

        return (
          <div className={styles.studyViewContainer}>
            <div className={styles.studyWrapper}>
              <header className={styles.studyHeader}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className={styles.studyModuleTitle}>Desafio de Conhecimento</span>
                  <span className={styles.studyModuleTitle} style={{ color: 'var(--accent-primary)', fontWeight: 'bold' }}>
                    {currentQuestionIndex + 1} / {questions.length}
                  </span>
                </div>
                <h2 className={styles.studyLessonTitle}>{currentQuestion?.question}</h2>
                <div className={styles.quizProgressBar}>
                   <div 
                     className={styles.quizProgressFill} 
                     style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                   />
                </div>
              </header>

              <section className={styles.studyCard} style={{ height: 'auto', background: 'rgba(15, 23, 42, 0.4)', borderColor: 'rgba(255,255,255,0.05)' }}>
                <div className={styles.animationBox}>
                  <span style={{ zIndex: 1 }}>Arena de Batalha: Personagem Pronto</span>
                </div>
                
                {currentQuestion?.type === "multipleChoice" && renderMultipleChoice(currentQuestion)}
                {currentQuestion?.type === "matching" && renderMatching(currentQuestion)}
                {currentQuestion?.type === "dragDrop" && renderDragDrop()}
              </section>

              <footer className={styles.studyActions}>
                <button type="button" className={styles.studyBtnBack} onClick={goToPreviousQuestion}>
                  voltar
                </button>
                <div style={{ width: '2rem' }} />
                <button type="button" className={styles.studyBtnNext} style={{ opacity: 0.3, cursor: 'default' }}>
                  pular questao
                </button>
              </footer>
            </div>
          </div>
        );
      }

      return (
        <div className={styles.studyViewContainer}>
          <div className={styles.studyWrapper}>
            <header className={styles.studyHeader}>
              <span className={styles.studyModuleTitle}>{activeModule.label}</span>
              <h2 className={styles.studyLessonTitle}>Aula {activeLessonIndex + 1}: {currentLesson.tituloLicao}</h2>
            </header>
            <section className={styles.studyCard}>
              <div className={styles.studyLayout}>
                <div className={styles.studyTextContent}>
                  <p>{currentLesson.conteudo}</p>
                  {currentLesson.bulletPoints && (
                    <ul className={styles.studyBulletList}>
                      {currentLesson.bulletPoints.map((point, i) => <li key={i}>{point}</li>)}
                    </ul>
                  )}
                </div>
                <div className={styles.studyImagePlaceholder}>
                  {currentLesson.imageUrl ? (
                    <div className={styles.placeholderBox} style={{ border: 'none', background: 'none' }}>
                      <Image src={currentLesson.imageUrl} alt={currentLesson.tituloLicao} width={400} height={400} className={styles.studyImage} style={{ borderRadius: '20px', objectFit: 'cover', width: '100%', height: '100%' }} />
                    </div>
                  ) : <div className={styles.placeholderBox}><span>Imagem Ilustrativa</span></div>}
                </div>
              </div>
            </section>
            <footer className={styles.studyActions}>
              <button type="button" className={styles.studyBtnBack} onClick={handleBackToTrail}>voltar</button>
              <button type="button" className={styles.studyBtnNext} onClick={goToQuestions}>próximo</button>
            </footer>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.modulesContainer}>
        <section className={styles.activeModuleContainer}>
          <header className={styles.trailHeader}>
            <button type="button" className={styles.backToModulesBtn} onClick={handleBackToModules}>← Voltar para módulos</button>
            <h2 className={styles.trailTitle}>{activeModule.label}</h2>
            <p className={styles.trailSubtitle}>{activeModule.title}</p>
            <span className={styles.trailDocMeta}>{LEARNING_DOCUMENT.title} · Nível {LEARNING_DOCUMENT.difficulty}</span>
          </header>
          <div className={styles.trailPath}>
            {lessons.map((lesson, index) => {
              const nodeOffset = TRAIL_OFFSETS[index % TRAIL_OFFSETS.length];
              return (
                <div key={index} className={styles.trailStep}>
                  <div className={styles.nodeWrapper} style={{ transform: `translateX(${nodeOffset}px)` }}>
                    {index === activeLessonIndex && (
                      <div className={`${styles.activeTooltip} ${styles.bounceAnimation}`}>Começar<div className={styles.tooltipArrow} /></div>
                    )}
                    <button type="button" className={`${styles.trailNode} ${index === activeLessonIndex ? styles.trailNodeActive : ""} ${index < activeLessonIndex ? styles.trailNodeCompleted : ""}`} onClick={() => handleLessonClick(index)} aria-label={`Lição ${index + 1}`}>
                      {index + 1}
                    </button>
                  </div>
                  {index < lessons.length - 1 && <div className={styles.simpleConnector} style={getConnectorStyle(index)} aria-hidden />}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={styles.modulesContainer}>
      <header className={styles.learningHeader}>
        <h2 className={styles.sectionTitle}>Módulos de Estudo</h2>
        <p className={styles.sectionSubtitle}>Continue de onde você parou</p>
      </header>
      <div className={styles.modulesGrid}>
        {MODULOS.map((mod) => {
          const moduleData = getModuleById(mod.id);
          const lessonCount = moduleData?.licoes.length ?? 0;
          return (
            <div key={mod.id} className={`${styles.modernModuleCard} ${mod.status === "locked" ? styles.locked : ""} ${mod.status === "completed" ? styles.completed : ""} ${mod.status === "active" ? styles.active : ""}`} onClick={() => handleModuleClick(mod)}>
              <div className={styles.cardInfo}>
                <span className={styles.cardLabel}>{mod.label}</span>
                <h3 className={styles.cardTitle}>{mod.title}</h3>
                <PlayIcon />
              </div>
              <div className={styles.cardStats}>
                <div className={styles.statItem}><span className={styles.statValue}>{lessonCount}</span><span className={styles.statLabel}>Aulas</span></div>
                <div className={styles.statItem}><span className={styles.progressValue}>{mod.status === "completed" ? "100%" : mod.status === "active" ? (mod.id === 2 ? "25%" : "0%") : "0%"}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
