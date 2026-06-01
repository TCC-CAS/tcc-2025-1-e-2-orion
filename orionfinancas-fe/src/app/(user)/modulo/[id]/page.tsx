"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import styles from "./ModulePage.module.css";
import { api } from "@/services/api";

interface TrailDoc {
  _id: string;
  title: string;
  difficulty: string;
  modulos?: Array<{
    _id?: string;
    id?: number | string;
    titulo: string;
    licoes?: Array<{
      _id?: string;
      id?: string;
      tituloLicao: string;
      conteudo?: string;
      conteudoAdicional?: string;
    }>;
  }>;
}

function findModule(trails: TrailDoc[], rawParam: string): { trail: TrailDoc; modulo: NonNullable<TrailDoc["modulos"]>[number] } | null {
  const key = rawParam.trim();
  if (!key) return null;

  for (const trail of trails) {
    for (const mod of trail.modulos || []) {
      if (mod._id != null && String(mod._id) === key) {
        return { trail, modulo: mod };
      }
      if (mod.id != null && String(mod.id) === key) {
        return { trail, modulo: mod };
      }
    }
  }
  return null;
}

export default function ModulePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const paramId = params.id ?? "";

  const [loading, setLoading] = useState(true);
  const [trailLabel, setTrailLabel] = useState<{ title: string; difficulty: string } | null>(null);
  const [modulo, setModulo] = useState<NonNullable<TrailDoc["modulos"]>[number] | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await api.get("/trails");
        if (cancelled) return;

        if (res.status !== "OK" || !Array.isArray(res.data)) {
          setNotFound(true);
          setModulo(null);
          setTrailLabel(null);
          return;
        }

        const hit = findModule(res.data as TrailDoc[], paramId);
        if (!hit) {
          setNotFound(true);
          setModulo(null);
          setTrailLabel(null);
          return;
        }

        setNotFound(false);
        setModulo(hit.modulo);
        setTrailLabel({ title: hit.trail.title, difficulty: hit.trail.difficulty });
      } catch {
        if (!cancelled) {
          setNotFound(true);
          setModulo(null);
          setTrailLabel(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [paramId]);

  useEffect(() => {
    setCurrentLessonIndex(0);
  }, [paramId, modulo?._id, modulo?.id]);

  if (loading) {
    return (
      <div className={styles.modulePageContainer}>
        <div className={styles.moduleHeader}>
          <p className={styles.moduleSubtitle}>Carregando módulo…</p>
        </div>
      </div>
    );
  }

  if (notFound || !modulo) {
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

  const licoes = modulo.licoes || [];
  const lesson =
    licoes.length > 0 ? licoes[Math.min(currentLessonIndex, licoes.length - 1)] : undefined;
  const totalLessons = licoes.length;

  if (!lesson || totalLessons === 0) {
    return (
      <div className={styles.modulePageContainer}>
        <div className={styles.moduleHeader}>
          <h1 className={styles.moduleTitle}>{modulo.titulo}</h1>
          <p className={styles.moduleSubtitle}>Este módulo ainda não possui lições cadastradas.</p>
        </div>
        <button className={styles.secondaryBtn} onClick={() => router.push("/learning")}>
          ← Voltar para trilha de aprendizado
        </button>
      </div>
    );
  }

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
          {trailLabel ? `${trailLabel.title} · Nível ${trailLabel.difficulty}` : "Aprendizado"}
        </p>
      </header>

      <section className={styles.lessonShell}>
        <article className={styles.lessonCard}>
          <h2 className={styles.lessonTitle}>{lesson.tituloLicao}</h2>
          <p className={styles.lessonBody}>
            {lesson.conteudo?.trim() ||
              "O conteúdo desta lição será exibido aqui assim que estiver disponível na plataforma."}
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
            {licoes.map((l, index) => (
              <span
                key={String(l._id ?? l.id ?? index)}
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
