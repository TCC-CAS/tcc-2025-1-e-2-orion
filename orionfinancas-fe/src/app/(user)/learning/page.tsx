"use client";

import { Fragment, useState, useEffect } from "react";
import styles from "./Learning.module.css";
import type { QuizQuestion } from "./lessonsData";
import { api } from "@/services/api";
import Image from "next/image";
import robotIdleGif from "@/assets/Robots_Idle-export.gif";
import robotIdleEnemyGif from "@/assets/Robots_Idle-export-inimigo.gif";
import robotActionPlayerGif from "@/assets/user_ani_1t.gif";
import robotActionEnemyGif from "@/assets/enemie_anit.gif";
import projectileImage from "@/assets/projetil_ani_1t1.png";

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
import { Flame, Coins, Zap, Star, SendHorizontal, Heart, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from "@/contexts/UserContext";
import { GameTutorial } from "@/components/common/GameTutorial";
import { NoLivesModal } from "@/components/common/NoLivesModal";

// Modulo type will be dynamic

const PlayIcon = ({ className }: { className?: string }) => (
  <div className={`${styles.playIconContainer} ${className || ""}`}>
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      style={{ transform: 'translateX(1.5px)' }}
    >
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

type ModuleStatus = "completed" | "active" | "locked";

interface Lesson {
  _id: string;
  id?: string;
  tituloLicao: string;
  conteudo: string;
  bulletPoints?: string[];
  imageUrl?: string;
  conteudoAdicional?: string;
}

interface Modulo {
  _id: string;
  titulo: string;
  licoes: Lesson[];
}

interface Trail {
  _id: string;
  title: string;
  description: string;
  difficulty: string;
  modulos: Modulo[];
  status?: ModuleStatus;
  label?: string;
  isPremium?: boolean;
}

const TUTORIAL_STEPS = [
  {
    title: "Bem-vindo à Jornada!",
    content: "Eu sou seu guia robótico! Aqui você aprenderá como dominar suas finanças enquanto avança em uma trilha épica de conhecimento.",
    placement: "center" as const
  },
  {
    title: "Trilhas de Elite",
    content: "Estas são as suas trilhas de aprendizado. Cada uma aborda um tema essencial. Escolha a sua e comece a progredir!",
    targetId: "trails-grid",
    placement: "top" as const
  },
  {
    title: "O Caminho do Mestre",
    content: "Ao entrar em uma trilha, cada etapa representa uma lição. Clique nelas para mergulhar no conteúdo e desbloquear os próximos desafios.",
    placement: "center" as const
  },
  {
    title: "Batalha de Conhecimento",
    content: "No final de cada aula, você enfrentará um quiz em estilo de combate! Acerte as perguntas para derrotar o inimigo e ganhar XP e Moedas.",
    placement: "center" as const
  }
];

export default function Learning() {
  const { user, stats: userStats, subtractLife, refreshProfile } = useUser();
  const [noLivesModalOpen, setNoLivesModalOpen] = useState(false);
  const currentLives = parseInt(userStats.lives.split('/')[0] || '5');
  const isUserPremium = user?.isPremium;

  const [activeTrail, setActiveTrail] = useState<Trail | null>(null);
  const [activeModule, setActiveModule] = useState<Modulo | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [isLessonViewOpen, setIsLessonViewOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<{modulo: Modulo, index: number} | null>(null);
  const [lessonPhase, setLessonPhase] = useState<"content" | "questions">("content");
  const [currentQuiz, setCurrentQuiz] = useState<any | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [trails, setTrails] = useState<Trail[]>([]);
  const [progress, setProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para feedback e gamificação
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [streakUpdated, setStreakUpdated] = useState(false);
  const [receivedRewards, setReceivedRewards] = useState<{ xp: number, coins: number } | null>(null);
  const [isReviewSubmitted, setIsReviewSubmitted] = useState(false);

  // Scale dos offsets do trail (Duolingo-style) conforme largura da tela.
  // Em desktop usamos 100% (zig-zag completo); em tablet 55%; em mobile 0
  // (nós centralizados em coluna — o zigzag não cabe e fica feio).
  const [trailScale, setTrailScale] = useState(1);
  useEffect(() => {
    const updateScale = () => {
      const w = window.innerWidth;
      if (w <= 600) setTrailScale(0);
      else if (w <= 900) setTrailScale(0.55);
      else setTrailScale(1);
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);
  const [userQuizResults, setUserQuizResults] = useState<{ question: string, userAnswer: string, correctAnswer: string, isCorrect: boolean }[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [trailsRes, progressRes] = await Promise.all([
        api.get('/trails'),
        api.get('/lessons/progress')
      ]);

      if (trailsRes.status === 'OK') {
        setTrails(trailsRes.data.map((t: any) => ({
          ...t,
          label: t.label || `TRILHA ${t.difficulty || ''}`,
          status: "active",
        })));
      }
      if (progressRes.status === 'OK') {
        setProgress(progressRes.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentLives === 0 && lessonPhase === "questions") {
      handleBackToTrail();
      setNoLivesModalOpen(true);
    }
  }, [currentLives, lessonPhase]);

  useEffect(() => {
    fetchData();
  }, []);

  // Estados para os itens arrastáveis
  const [dragItems, setDragItems] = useState<string[]>([]);
  const [matchingItems, setMatchingItems] = useState<string[]>([]);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  // Estados da Batalha (Robôs)
  const [playerAction, setPlayerAction] = useState<"idle" | "attack" | "hurt" | "dead">("idle");
  const [enemyAction, setEnemyAction] = useState<"idle" | "attack" | "hurt" | "dead">("idle");
  const [enemyHealth, setEnemyHealth] = useState(0);
  const [projectile, setProjectile] = useState<{ active: boolean, from: 'player' | 'enemy' }>({ active: false, from: 'player' });

  const triggerBattleAnimation = (isSuccess: boolean) => {
    if (isSuccess) {
      setPlayerAction("attack");
      setTimeout(() => {
        setProjectile({ active: true, from: 'player' });
        setTimeout(() => {
          setProjectile({ active: false, from: 'player' });
          setEnemyAction("hurt");
          setEnemyHealth((prev) => Math.max(0, prev - 1));
          
          setTimeout(() => {
            setPlayerAction("idle");
            setEnemyAction((prev) => (enemyHealth - 1 <= 0 ? "dead" : "idle"));
          }, 800);
        }, 300); // Tempo de voo
      }, 150); // Atraso após o ataque
    } else {
      setEnemyAction("attack");
      setTimeout(() => {
        setProjectile({ active: true, from: 'enemy' });
        setTimeout(() => {
          setProjectile({ active: false, from: 'enemy' });
          setPlayerAction("hurt");
          subtractLife();
          
          setTimeout(() => {
            setEnemyAction("idle");
            setPlayerAction((prev) => (currentLives - 1 <= 0 ? "dead" : "idle"));
          }, 800);
        }, 300); // Tempo de voo
      }, 150); // Atraso após o ataque
    }
  };

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

  const handleTrailClick = (trail: any) => {
    if (trail.isPremium && !isUserPremium) {
        return; // Handled by UI message/lock
    }
    setActiveTrail(trail);
    
    // Encontrar a primeira lição não concluída
    let firstIncompleteModule = trail.modulos[0];
    let firstIncompleteLessonIdx = 0;
    let found = false;

    if (trail.modulos) {
      for (const m of trail.modulos) {
        if (found) break;
        if (m.licoes) {
          for (let i = 0; i < m.licoes.length; i++) {
            const lessonId = String(m.licoes[i]._id || m.licoes[i].id);
            const isCompleted = progress.some(p => String(p.lessonId) === lessonId && p.status === "COMPLETED");
            if (!isCompleted) {
              firstIncompleteModule = m;
              firstIncompleteLessonIdx = i;
              found = true;
              break;
            }
          }
        }
      }
    }

    setActiveModule(firstIncompleteModule);
    setActiveLessonIndex(firstIncompleteLessonIdx);
    setLessonPhase("content");
    setCurrentQuestionIndex(0);
    setCurrentQuiz(null);
  };

  const handleBackToTrails = () => {
    setActiveTrail(null);
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

  const lessons = activeModule?.licoes ?? [];
  const currentLesson = lessons[activeLessonIndex];
  const questions = currentQuiz?.questions ?? [];
  const currentQuestion = questions[currentQuestionIndex];

  // Sincronizar itens quando a questão mudar
  useEffect(() => {
    if (currentQuestion?.type === "dragDrop" && currentQuestion.options) {
      setDragItems([...currentQuestion.options].sort(() => Math.random() - 0.5));
    } else if (currentQuestion?.type === "matching" && currentQuestion.rightColumn) {
      setMatchingItems([...currentQuestion.rightColumn].sort(() => Math.random() - 0.5));
    }
  }, [currentQuestionIndex, currentQuiz, currentQuestion]);

  const handleLessonClick = (modulo: Modulo, index: number) => {
    setActiveModule(modulo);
    setActiveLessonIndex(index);
    setIsLessonViewOpen(true);
    setLessonPhase("content");
    setCurrentQuestionIndex(0);
    setCurrentQuiz(null);
    setUserQuizResults([]);
  };

  const goToQuestions = async () => {
    if (!currentLesson) return;
    
    if (currentLives <= 0) {
      setNoLivesModalOpen(true);
      return;
    }

    try {
      // Find quiz related to this lesson
      const quizzesRes = await api.get('/quizzes');
      const quiz = quizzesRes.data.find((q: any) => q.lessonId === (currentLesson._id || currentLesson.id));
      
      if (!quiz) {
        await completeLesson();
        return;
      }
      setCurrentQuiz(quiz);
      setLessonPhase("questions");
      setCurrentQuestionIndex(0);
      setEnemyHealth(quiz.questions?.length || 5);
      setPlayerAction("idle");
      setEnemyAction("idle");
    } catch (error) {
      console.error("Erro ao carregar quiz:", error);
      await completeLesson();
    }
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    } else {
      completeQuiz();
    }
  };

  // Pular questão: penaliza com uma vida (como resposta errada) e avança
  const skipQuestion = () => {
    if (isChecking || currentLives <= 0) return;
    setIsChecking(true);
    setIsCorrect(false);

    // Registra como questão pulada no resultado do quiz
    setUserQuizResults(prev => {
      if (prev.some(r => r.question === currentQuestion?.question)) return prev;
      const correctAns = currentQuestion?.options?.[currentQuestion.correctOptionIndex!] || '';
      return [...prev, {
        question: currentQuestion?.question || '',
        userAnswer: '(questão pulada)',
        correctAnswer: correctAns,
        isCorrect: false
      }];
    });

    triggerBattleAnimation(false); // inimigo ataca → subtractLife é chamado internamente

    setTimeout(() => {
      setIsChecking(false);
      setIsCorrect(null);
      goToNextQuestion();
    }, 1500);
  };

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((i) => i - 1);
    } else {
      setLessonPhase("content");
    }
  };

  const completeLesson = async () => {
    if (activeTrail && activeModule && currentLesson) {
      try {
        const response = await api.post('/lessons/complete', {
          lessonId: currentLesson._id || currentLesson.id,
          moduleId: activeModule._id,
          trailId: activeTrail._id
        });
        setStreakUpdated(response.streakUpdated || false);
        await refreshProfile();
        fetchData(); // Refresh progress/missions
      } catch (error) {
        console.error("Erro ao completar lição:", error);
      }
    }
    setIsLessonViewOpen(false);
    setLessonPhase("content");
    setCurrentQuestionIndex(0);
    setCurrentQuiz(null);
    setRating(0);
    setFeedback("");
    setIsReviewSubmitted(false);
    
    // Avançar para próxima lição (mesmo que seja outro módulo)
    if (activeModule) {
      if (activeLessonIndex < (activeModule.licoes?.length || 0) - 1) {
        setActiveLessonIndex(prev => prev + 1);
      } else if (activeTrail) {
        const currentModIdx = activeTrail.modulos.findIndex(m => m._id === activeModule._id);
        if (currentModIdx < activeTrail.modulos.length - 1) {
          setActiveModule(activeTrail.modulos[currentModIdx + 1]);
          setActiveLessonIndex(0);
        }
      }
    }
  };

  const completeQuiz = async () => {
    if (currentQuiz && activeTrail && activeModule) {
      try {
        const response = await api.post('/quizzes/complete', {
          quizId: currentQuiz._id,
          score: 100, // For now, simple finish
          lessonId: currentLesson?._id || currentLesson?.id,
          moduleId: activeModule._id,
          trailId: activeTrail._id
        });
        setStreakUpdated(response.streakUpdated || false);
        setReceivedRewards(response.rewards || { xp: 30, coins: 10 });
        await refreshProfile();
        fetchData();
      } catch (error) {
        console.error("Erro ao completar quiz:", error);
      }
    }
    setLessonPhase("questions");
    setCurrentQuestionIndex(questions.length); // Marcar como concluído
  };

  const handleSubmitReview = async () => {
    if (rating === 0 || isReviewSubmitted) return;
    try {
      await api.post('/lessons/review', {
        moduleId: activeModule?._id,
        rating,
        comment: feedback
      });
      setIsReviewSubmitted(true);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
    }
  };

  const getConnectorStyle = (index: number) => {
    const allLessonsCount = activeTrail?.modulos.reduce((acc, m) => acc + (m.licoes?.length || 0), 0) || 0;
    if (index >= allLessonsCount - 1) return {};

    // Mobile: linha vertical reta centralizada (sem zigzag).
    if (trailScale === 0) {
      return {
        left: '50%',
        width: 0,
        height: '116px',
        top: '42px',
        borderLeft: '4px dashed rgba(255, 255, 255, 0.22)',
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        transform: 'translateX(-2px)', // alinha o miolo da linha com o centro do nó
        zIndex: 1,
        pointerEvents: 'none' as const,
      };
    }

    const currentOffset = TRAIL_OFFSETS[index % TRAIL_OFFSETS.length] * trailScale;
    const nextOffset = TRAIL_OFFSETS[(index + 1) % TRAIL_OFFSETS.length] * trailScale;
    const width = Math.abs(nextOffset - currentOffset);
    const minOffset = Math.min(currentOffset, nextOffset);
    
    // Altura fixa em 116px (combinando com a altura do trailStep)
    const baseStyle: React.CSSProperties = {
      width: `${width}px`,
      left: `calc(50% + ${minOffset}px)`,
      height: "116px",
      zIndex: 1,
      pointerEvents: "none"
    };

    if (currentOffset < nextOffset) {
      // De esquerda para direita: curva para cima e direita (top-right)
      return { 
        ...baseStyle, 
        borderLeft: "none", 
        borderBottom: "none", 
        borderTopRightRadius: "50px", 
        top: "42px" 
      };
    } else {
      // De direita para esquerda: curva para cima e esquerda (top-left)
      return { 
        ...baseStyle, 
        borderRight: "none", 
        borderBottom: "none", 
        borderTopLeftRadius: "50px", 
        top: "42px" 
      };
    }
  };

  const handleOptionClick = (index: number) => {
    if (isChecking) return;
    setSelectedOptionIndex(index);
    setIsChecking(true);
    
    const correct = currentQuestion?.correctOptionIndex === index;
    setIsCorrect(correct);

    // Salvar resultado para feedback apenas na primeira tentativa
    setUserQuizResults(prev => {
      if (prev.some(r => r.question === currentQuestion.question)) return prev;
      return [...prev, {
        question: currentQuestion.question,
        userAnswer: currentQuestion.options![index],
        correctAnswer: currentQuestion.options![currentQuestion.correctOptionIndex!],
        isCorrect: correct
      }];
    });

    triggerBattleAnimation(correct);

    setTimeout(() => {
      setSelectedOptionIndex(null);
      setIsChecking(false);
      setIsCorrect(null);
      
      if (correct) {
        goToNextQuestion();
      }
    }, 1500);
  };

  const handleMatchingVerify = () => {
    if (isChecking || !currentQuestion) return;
    setIsChecking(true);

    const correctMap = (currentQuestion as any).correctMapping;
    const isCorrectMatch = currentQuestion.leftColumn?.every((left: string, i: number) => {
      return correctMap?.[left] === matchingItems[i];
    });

    setIsCorrect(isCorrectMatch);
    
    setUserQuizResults(prev => {
      if (prev.some(r => r.question === currentQuestion.question)) return prev;
      return [...prev, {
        question: currentQuestion.question,
        userAnswer: "Ordem informada",
        correctAnswer: "Ordem correta",
        isCorrect: isCorrectMatch
      }];
    });
    
    triggerBattleAnimation(isCorrectMatch);

    setTimeout(() => {
      setIsChecking(false);
      setIsCorrect(null);
      if (isCorrectMatch) goToNextQuestion();
    }, 1500);
  };

  const handleDragDropVerify = () => {
    if (isChecking || !currentQuestion) return;
    setIsChecking(true);

    const isCorrectOrder = currentQuestion.options?.every((opt: string, i: number) => opt === dragItems[i]);

    setIsCorrect(isCorrectOrder);

    setUserQuizResults(prev => {
      if (prev.some(r => r.question === currentQuestion.question)) return prev;
      return [...prev, {
        question: currentQuestion.question,
        userAnswer: dragItems.join(", "),
        correctAnswer: currentQuestion.options!.join(", "),
        isCorrect: isCorrectOrder
      }];
    });

    triggerBattleAnimation(isCorrectOrder);

    setTimeout(() => {
      setIsChecking(false);
      setIsCorrect(null);
      if (isCorrectOrder) goToNextQuestion();
    }, 1500);
  };

  const renderMultipleChoice = (q: QuizQuestion) => (
    <div className={styles.quizOptions}>
      {q.options?.map((opt: string, i: number) => {
        const isSelected = selectedOptionIndex === i;
        const buttonClass = `${styles.quizOptionButton} ${
          isSelected ? (isCorrect ? styles.correct : styles.incorrect) : ""
        } ${isChecking ? styles.checking : ""}`;

        return (
          <button 
            key={i} 
            className={buttonClass} 
            onClick={() => handleOptionClick(i)}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );

  const renderBattleArena = () => {
    return (
      <div className={styles.battleArena}>
        {/* Projectile */}
        <AnimatePresence>
          {projectile.active && (
            <motion.div
              initial={{ left: projectile.from === 'player' ? '25%' : '75%', opacity: 1 }}
              animate={{ left: projectile.from === 'player' ? '75%' : '25%', opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: "linear" }}
              style={{ position: 'absolute', top: '40%', zIndex: 10, marginTop: '-20px' }}
            >
              <Image 
                src={projectileImage}
                alt="Projectile"
                width={40} height={40}
                style={{ 
                  transform: projectile.from === 'enemy' ? 'scaleX(-1) scale(1.5)' : 'scale(1.5)', 
                  imageRendering: 'pixelated',
                  filter: projectile.from === 'enemy' ? 'hue-rotate(180deg)' : 'none'
                }}
                unoptimized
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Player (Robo Amigo) */}
        <div className={styles.playerSide}>
          <motion.div
            initial={false}
            animate={{
              x: playerAction === "attack" ? 60 : 0,
              opacity: playerAction === "dead" ? 0 : 1,
              rotate: playerAction === "dead" ? -90 : 0,
              scale: playerAction === "attack" ? 1.1 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${styles.spriteContainer} ${playerAction === 'hurt' ? styles.hurtAnimation : ''}`}
          >
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                <Image 
                  src={playerAction === 'idle' ? robotIdleGif : robotActionPlayerGif} 
                  alt="Player Sprite"
                  fill
                  style={{ 
                    objectFit: 'contain',
                    transform: 'scale(1.5)',
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 4px 10px rgba(0, 200, 150, 0.4))'
                  }}
                  unoptimized
                />
              </div>
              <div className={styles.spriteLabel} style={{ position: 'absolute', bottom: -25, width: '100%', textAlign: 'center', color: '#fff', fontWeight: 800 }}>ALIADO</div>
            </div>
          </motion.div>
          <div className={styles.healthBar}>
            <div className={styles.healthFillPlayer} style={{ width: `${(currentLives / 5) * 100}%` }} />
          </div>
        </div>

        {/* VS Indicator */}
        <div className={styles.vsIndicator}>VS</div>

        {/* Enemy (Robo Inimigo) */}
        <div className={styles.enemySide}>
          <motion.div
            initial={false}
            animate={{
              x: enemyAction === "attack" ? -60 : 0,
              opacity: enemyAction === "dead" ? 0 : 1,
              rotate: enemyAction === "dead" ? 90 : 0,
              scale: enemyAction === "attack" ? 1.1 : 1
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`${styles.spriteContainer} ${enemyAction === 'hurt' ? styles.hurtAnimation : ''}`}
          >
            <div style={{ position: 'relative', width: '120px', height: '120px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center' }}>
                <Image 
                  src={enemyAction === 'idle' ? robotIdleEnemyGif : robotActionEnemyGif} 
                  alt="Enemy Sprite"
                  fill
                  style={{ 
                    objectFit: 'contain', 
                    transform: 'scale(1.5)', 
                    imageRendering: 'pixelated',
                    filter: 'drop-shadow(0 4px 10px rgba(255, 87, 34, 0.4))'
                  }}
                  unoptimized
                />
              </div>
              <div className={styles.spriteLabel} style={{ position: 'absolute', bottom: -25, width: '100%', textAlign: 'center', color: '#fff', fontWeight: 800 }}>INIMIGO</div>
            </div>
          </motion.div>
          <div className={styles.healthBar}>
            <div className={styles.healthFillEnemy} style={{ width: `${(enemyHealth / (questions.length || 1)) * 100}%` }} />
          </div>
        </div>
      </div>
    );
  };

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
          className={`${styles.studyBtnNext} ${isCorrect === true ? styles.correct : isCorrect === false ? styles.incorrect : ""}`} 
          style={{ marginTop: '2rem', width: '220px', alignSelf: 'center' }}
          onClick={handleMatchingVerify}
          disabled={isChecking}
        >
          {isChecking ? "Verificando..." : "Verificar Combinação"}
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
          className={`${styles.studyBtnNext} ${isCorrect === true ? styles.correct : isCorrect === false ? styles.incorrect : ""}`} 
          style={{ marginTop: '1rem', width: '200px', alignSelf: 'center' }}
          onClick={handleDragDropVerify}
          disabled={isChecking}
        >
          {isChecking ? "Verificando..." : "Confirmar Ordem"}
        </button>
      </div>
    );
  };

  if (activeTrail && activeModule && lessons.length > 0) {
    if (isLessonViewOpen && currentLesson) {
      if (lessonPhase === "questions") {
        if (currentQuestionIndex >= questions.length) {
          return (
            <div className={styles.studyViewContainer}>
              <div className={styles.studyWrapper}>
                <header className={styles.studyHeader} style={{ textAlign: 'center' }}>
                  <h2 className={styles.studyLessonTitle} style={{ fontSize: '2rem' }}>Aula Concluída!</h2>
                  <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Você dominou <strong>{currentLesson.tituloLicao}</strong></p>
                </header>

                <section className={styles.conclusionContent}>
                  <div className={styles.summaryPanel}>
                    <div className={styles.rewardsRow}>
                      {streakUpdated && (
                        <div className={styles.rewardCard}>
                          <div className={styles.rewardIconWrapper} style={{ color: '#ff5722' }}>
                            <Flame size={32} fill="currentColor" />
                          </div>
                          <span className={styles.rewardValue}>+1</span>
                          <span className={styles.rewardLabel}>Ofensiva</span>
                        </div>
                      )}
                      <div className={styles.rewardCard}>
                        <div className={styles.rewardIconWrapper} style={{ color: '#ffcc00' }}>
                          <Coins size={32} fill="currentColor" />
                        </div>
                        <span className={styles.rewardValue}>+{receivedRewards?.coins || (userStats.lives === '∞' ? 30 : 15)}</span>
                        <span className={styles.rewardLabel}>Moedas</span>
                      </div>
                      <div className={styles.rewardCard}>
                        <div className={styles.rewardIconWrapper} style={{ color: '#00d2ff' }}>
                          <Zap size={32} fill="currentColor" />
                        </div>
                        <span className={styles.rewardValue}>+{receivedRewards?.xp || (userStats.lives === '∞' ? 100 : 50)}</span>
                        <span className={styles.rewardLabel}>XP Ganho</span>
                      </div>
                    </div>

                    <div className={styles.ratingSection}>
                      <p className={styles.ratingTitle}>Feedback do Quiz</p>
                      <div className={styles.quizFeedbackList}>
                        {userQuizResults.map((res, i) => (
                          <div key={i} className={`${styles.feedbackItem} ${res.isCorrect ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                            <div className={styles.feedbackHeader}>
                              <span>Questão {i + 1}: {res.isCorrect ? "✅ Acertou" : "❌ Errou"}</span>
                            </div>
                            <p className={styles.feedbackQuestion}>{res.question}</p>
                            {!res.isCorrect && (
                              <p className={styles.feedbackCorrection}>
                                Sua resposta: <span className={styles.wrongText}>{res.userAnswer}</span><br/>
                                Resposta correta: <span className={styles.correctText}>{res.correctAnswer}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>

                      <p className={styles.ratingTitle} style={{ marginTop: '2rem' }}>O que você achou desta aula?</p>
                      <div className={styles.starRating}>
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button 
                            key={s} 
                            className={`${styles.starBtn} ${rating >= s ? styles.starActive : ''}`}
                            onClick={() => !isReviewSubmitted && setRating(s)}
                            disabled={isReviewSubmitted}
                            style={{ cursor: isReviewSubmitted ? 'default' : 'pointer' }}
                          >
                            <Star size={32} fill={rating >= s ? "currentColor" : "none"} />
                          </button>
                        ))}
                      </div>
                      <div className={styles.feedbackBox}>
                        <input
                          type="text"
                          placeholder="Deixe um comentário (opcional)"
                          maxLength={300}
                          className={styles.feedbackInput}
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          disabled={isReviewSubmitted}
                        />
                        <button 
                          className={styles.btnSendFeedback}
                          onClick={handleSubmitReview}
                          disabled={isReviewSubmitted || rating === 0}
                          style={{ opacity: isReviewSubmitted || rating === 0 ? 0.5 : 1, cursor: isReviewSubmitted || rating === 0 ? 'not-allowed' : 'pointer' }}
                        >
                          <span>{isReviewSubmitted ? "Enviado!" : "Enviar"}</span>
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
                {renderBattleArena()}
                
                {currentQuestion?.type === "multipleChoice" && renderMultipleChoice(currentQuestion)}
                {currentQuestion?.type === "matching" && renderMatching(currentQuestion)}
                {currentQuestion?.type === "dragDrop" && renderDragDrop()}
              </section>

              <footer className={styles.studyActions}>
                <button type="button" className={styles.studyBtnBack} onClick={goToPreviousQuestion}>
                  voltar
                </button>
                <div style={{ width: '2rem' }} />
                <button type="button" className={styles.studyBtnNext} onClick={skipQuestion} disabled={isChecking || currentLives <= 0}>
                  pular questão
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
              <span className={styles.studyModuleTitle}>{activeModule.titulo}</span>
              <h2 className={styles.studyLessonTitle}>Aula {activeLessonIndex + 1}: {currentLesson.tituloLicao}</h2>
            </header>
            <section className={styles.studyCard}>
              <div className={styles.studyLayout}>
                <div className={styles.studyTextContent}>
                  <p>{currentLesson.conteudo}</p>
                  {currentLesson.bulletPoints && (
                    <ul className={styles.studyBulletList}>
                      {currentLesson.bulletPoints?.map((point: string, i: number) => <li key={i}>{point}</li>)}
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
      <div className={styles.modulesContainer} onClick={() => setSelectedNode(null)}>
        <section className={styles.activeModuleContainer}>
          {/* Decorações laterais da trilha */}
          <div className={styles.trailDecoLeft} aria-hidden>
            <div className={styles.decoItem} style={{ top: '12%', left: '6%', animationDelay: '0s' }}>
              <Coins size={28} color="#ffb800" opacity={0.35} />
            </div>
            <div className={styles.decoItem} style={{ top: '32%', left: '2%', animationDelay: '0.8s' }}>
              <Star size={22} color="#00f2a9" opacity={0.3} />
            </div>
            <div className={styles.decoItem} style={{ top: '55%', left: '8%', animationDelay: '1.6s' }}>
              <Flame size={24} color="#ff5722" opacity={0.28} />
            </div>
            <div className={styles.decoItem} style={{ top: '75%', left: '3%', animationDelay: '2.4s' }}>
              <Zap size={20} color="#00d2ff" opacity={0.25} />
            </div>
            <div className={styles.decoItem} style={{ top: '88%', left: '10%', animationDelay: '1.2s' }}>
              <Coins size={16} color="#ffb800" opacity={0.2} />
            </div>
          </div>
          <div className={styles.trailDecoRight} aria-hidden>
            <div className={styles.decoItem} style={{ top: '10%', right: '5%', animationDelay: '0.4s' }}>
              <Heart size={26} color="#ef4444" opacity={0.3} fill="rgba(239,68,68,0.15)" />
            </div>
            <div className={styles.decoItem} style={{ top: '30%', right: '9%', animationDelay: '1.2s' }}>
              <Zap size={24} color="#00d2ff" opacity={0.3} />
            </div>
            <div className={styles.decoItem} style={{ top: '52%', right: '4%', animationDelay: '2s' }}>
              <Star size={28} color="#ffb800" opacity={0.28} fill="rgba(255,184,0,0.1)" />
            </div>
            <div className={styles.decoItem} style={{ top: '72%', right: '8%', animationDelay: '0.6s' }}>
              <Flame size={20} color="#ff5722" opacity={0.25} />
            </div>
            <div className={styles.decoItem} style={{ top: '87%', right: '3%', animationDelay: '1.8s' }}>
              <Coins size={18} color="#00f2a9" opacity={0.22} />
            </div>
          </div>

          <header className={styles.trailHeader}>
            <button type="button" className={styles.backToModulesBtn} onClick={handleBackToTrails}>← Voltar para módulos</button>
            <h2 className={styles.trailTitle}>{activeTrail.title}</h2>
            <p className={styles.trailSubtitle}>{activeModule.titulo}</p>
            <span className={styles.trailDocMeta}>Nível {activeTrail.difficulty}</span>
          </header>
          <div className={styles.trailPath}>
            {(() => {
              const allLessons = activeTrail.modulos.flatMap((m) => 
                m.licoes.map((l, i) => ({ lesson: l, modulo: m, localIdx: i }))
              );

              return allLessons.map((item, idx) => {
                const nodeOffset = TRAIL_OFFSETS[idx % TRAIL_OFFSETS.length] * trailScale;
                const isCompleted = progress.some(p => String(p.lessonId) === String(item.lesson._id || item.lesson.id) && p.status === "COMPLETED");
                const isActive = activeModule?._id === item.modulo._id && activeLessonIndex === item.localIdx;
                const isLastLesson = idx === allLessons.length - 1;

                return (
                  <div key={item.lesson._id || idx} className={styles.trailStep}>
                    <div className={styles.nodeWrapper} style={{ transform: `translateX(${nodeOffset}px)` }}>
                       {isActive && !isCompleted && !selectedNode && (
                        <div className={`${styles.activeTooltip} ${styles.bounceAnimation}`}>
                          Começar<div className={styles.tooltipArrow} />
                        </div>
                      )}

                      {/* Pop-up de Preview */}
                      {selectedNode?.modulo._id === item.modulo._id && selectedNode?.index === item.localIdx && (
                        <div className={styles.nodePopup} onClick={(e) => e.stopPropagation()}>
                          <div className={styles.popupContent}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                <span className={styles.popupModule}>{item.modulo.titulo}</span>
                            </div>
                            <h4 className={styles.popupLesson}>{item.lesson.tituloLicao}</h4>

                            <button 
                              className={styles.popupStartBtn} 
                              onClick={(e) => {
                                e.stopPropagation();
                                if (currentLives <= 0) {
                                  setNoLivesModalOpen(true);
                                  return;
                                }
                                handleLessonClick(item.modulo, item.localIdx);
                                setSelectedNode(null);
                              }}
                            >
                              Iniciar Aula
                            </button>
                          </div>
                          <div className={styles.popupArrow} />
                        </div>
                      )}

                      <button 
                        type="button" 
                        className={`${styles.trailNode} ${isActive ? styles.trailNodeActive : ""} ${isCompleted ? styles.trailNodeCompleted : ""}`} 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedNode({modulo: item.modulo, index: item.localIdx});
                        }}
                      >
                         {isCompleted ? <Star size={24} fill="currentColor" /> : <PlayIcon />}
                      </button>
                    </div>
                    {!isLastLesson && (
                      <div className={styles.simpleConnector} style={getConnectorStyle(idx)} aria-hidden />
                    )}
                  </div>
                );
              });
            })()}
          </div>
        </section>

        {/* Modal sem vidas — position:fixed, aparece mesmo neste branch */}
        <NoLivesModal
          isOpen={noLivesModalOpen}
          onClose={() => setNoLivesModalOpen(false)}
          nextRegenAt={userStats.nextRegenAt}
        />
      </div>
    );
  }

  return (
    <div className={styles.modulesContainer}>
      <header className={styles.learningHeader}>
        <h2 className={styles.sectionTitle}>Módulos de Estudo</h2>
        <p className={styles.sectionSubtitle}>Continue de onde você parou</p>
      </header>
      <div id="trails-grid" className={styles.modulesGrid}>
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-trail-${i}`} className={styles.modernModuleCard} style={{ animation: 'pulse 1.5s infinite', border: 'none', background: 'rgba(255,255,255,0.02)' }}>
              <div className={styles.cardInfo}>
                 <div style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                 <div style={{ height: '28px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}></div>
              </div>
              <div className={styles.cardStats} style={{ borderTop: '1px solid rgba(255,255,255,0.02)', marginTop: '3.5rem' }}>
                 <div style={{ height: '24px', width: '25%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                 <div style={{ height: '24px', width: '15%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginLeft: 'auto' }}></div>
              </div>
            </div>
          ))
        ) : (
          trails.map((trail: any) => {
            const allLessons = trail.modulos?.flatMap((m: any) => m.licoes || []) || [];
            const lessonCount = allLessons.length;
            const completedLessons = progress.filter(p => 
              allLessons.some((l: any) => String(l._id || l.id) === String(p.lessonId)) && 
              p.status === "COMPLETED"
            ).length;
            
            const progressPercent = lessonCount > 0 ? Math.round((completedLessons / lessonCount) * 100) : 0;
            const isCompleted = lessonCount > 0 && completedLessons === lessonCount;
            
            return (
              <div 
                key={trail._id} 
                className={`${styles.modernModuleCard} ${trail.status === "locked" || (trail.isPremium && !isUserPremium) ? styles.locked : ""} ${isCompleted ? styles.completed : styles.active} ${trail.isPremium ? styles.premiumCard : ""}`} 
                onClick={() => handleTrailClick(trail)}
                style={trail.isPremium && !isUserPremium ? { border: '1px solid rgba(255, 215, 0, 0.2)' } : {}}
              >
                <div className={styles.cardInfo}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <span className={styles.cardLabel}>{trail.label}</span>
                    {trail.isPremium && (
                      <span style={{ 
                        background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', 
                        color: '#000', 
                        fontSize: '11px', 
                        fontWeight: '800', 
                        padding: '2px 8px', 
                        borderRadius: '12px',
                        boxShadow: '0 2px 10px rgba(255, 215, 0, 0.3)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        PRO
                      </span>
                    )}
                  </div>
                  <h3 className={styles.cardTitle}>{trail.title}</h3>
                  {trail.isPremium && !isUserPremium ? (
                    <div style={{ color: 'rgba(255, 215, 0, 0.6)', marginTop: '4px' }}>
                       <Lock size={20} />
                    </div>
                  ) : <PlayIcon className={styles.cardPlayIcon} />}
                </div>
                <div className={styles.cardStats}>
                  <div className={styles.statItem}><span className={styles.statValue}>{lessonCount}</span><span className={styles.statLabel}>Aulas</span></div>
                  <div className={styles.statItem}><span className={styles.progressValue}>{progressPercent}%</span></div>
                </div>
                
                {trail.isPremium && !isUserPremium && (
                   <div style={{ 
                      position: 'absolute', 
                      top: 0, left: 0, right: 0, bottom: 0, 
                      background: 'rgba(15, 23, 42, 0.7)', 
                      backdropFilter: 'blur(3px)', 
                      borderRadius: '24px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      pointerEvents: 'none',
                      zIndex: 2,
                      transition: 'all 0.3s ease'
                   }}>
                      <div style={{ 
                        background: 'rgba(255, 215, 0, 0.1)', 
                        padding: '12px', 
                        borderRadius: '50%', 
                        marginBottom: '10px',
                        border: '1px solid rgba(255, 215, 0, 0.3)'
                      }}>
                        <Lock size={28} color="#FFD700" />
                      </div>
                      <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Desbloquear com PRO
                      </span>
                   </div>
                )}
              </div>
            );
          })
        )}
      </div>
      <GameTutorial
        steps={TUTORIAL_STEPS}
        tutorialKey="learning_main"
        onComplete={() => console.log('Tutorial concluído')}
      />

      {/* Modal de sem vidas — renderizado no topo do DOM via fixed */}
      <NoLivesModal
        isOpen={noLivesModalOpen}
        onClose={() => setNoLivesModalOpen(false)}
        nextRegenAt={userStats.nextRegenAt}
      />
    </div>
  );
}
