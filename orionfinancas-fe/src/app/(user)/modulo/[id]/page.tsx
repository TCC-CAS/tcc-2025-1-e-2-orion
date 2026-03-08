"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./ModulePage.module.css";
import { LEARNING_DOCUMENT, getModuleById } from "../../learning/lessonsData";

interface ModulePageProps {
  params: {
    id: string;
  };
}

export default function ModulePage({ params }: ModulePageProps) {
  const router = useRouter();
  const moduleId = Number(params.id);
  const modulo = getModuleById(moduleId);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  if (!modulo) {
    return (
      <div className={styles.modulePageContainer}>
        <div className={styles.moduleHeader}>
          <h1 className={styles.moduleTitle}>Módulo não encontrado</h1>
          <p className={styles.moduleSubtitle}>
            Verifique se o módulo ainda está disponível ou tente novamente mais tarde.
          </p>
        </div>
        <button className={styles.secondaryBtn} onClick={() => router.push("/learning")}>
          ← Voltar para trilha de aprendizado
        </button>
      </div>
    );
  }

  const lesson = modulo.licoes[currentLessonIndex];
  const totalLessons = modulo.licoes.length;

  const handlePrev = () => {
    setCurrentLessonIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentLessonIndex((prev) => Math.min(prev + 1, totalLessons - 1));
  };

  const isFirstLesson = currentLessonIndex === 0;
  const isLastLesson = currentLessonIndex === totalLessons - 1;

  const renderExtraContent = () => {
    if (!lesson.conteudoAdicional) return null;

    const isUrl = /^https?:\/\//i.test(lesson.conteudoAdicional);

    return (
      <aside className={styles.extraContentCard}>
        <h3 className={styles.extraTitle}>Conteúdo adicional</h3>
        <p className={styles.extraDescription}>
          Aprofunde seus conhecimentos com o material complementar sugerido para esta lição.
        </p>
        {isUrl ? (
          <a
            href={lesson.conteudoAdicional}
            target="_blank"
            rel="noreferrer"
            className={styles.extraLink}
          >
            Abrir material complementar ↗
          </a>
        ) : (
          <span className={styles.extraDescription}>{lesson.conteudoAdicional}</span>
        )}
      </aside>
    );
  };

  return (
    <div className={styles.modulePageContainer}>
      <header className={styles.moduleHeader}>
        <span className={styles.statusPill}>
          <span className={styles.statusLabel}>Módulo de conhecimento</span>
        </span>
        <h1 className={styles.moduleTitle}>{modulo.titulo}</h1>
        <p className={styles.moduleSubtitle}>
          {LEARNING_DOCUMENT.title} · Nível {LEARNING_DOCUMENT.difficulty}
        </p>
      </header>

      <section className={styles.lessonShell}>
        <article className={styles.lessonCard}>
          <h2 className={styles.lessonTitle}>{lesson.tituloLicao}</h2>
          <p className={styles.lessonBody}>
            {lesson.conteudo || "O conteúdo desta lição será carregado a partir do banco de dados."}
          </p>

          <footer className={styles.lessonFooter}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={isFirstLesson ? () => router.push("/learning") : handlePrev}
            >
              {isFirstLesson ? "← Voltar para trilha" : "← Lição anterior"}
            </button>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={handleNext}
              disabled={isLastLesson}
            >
              {isLastLesson ? "Última lição" : "Próxima lição →"}
            </button>
          </footer>

          <div className={styles.progressDots}>
            {modulo.licoes.map((_, index) => (
              <span
                key={index}
                className={`${styles.dot} ${index === currentLessonIndex ? styles.dotActive : ""}`}
              />
            ))}
          </div>
        </article>

        {renderExtraContent()}
      </section>
    </div>
  );
}

