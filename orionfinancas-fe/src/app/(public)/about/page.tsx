import styles from "./About.module.css";
import {
  Target,
  Globe2,
  Gem,
  Gamepad2,
  BarChart3,
  Rocket
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className={styles.aboutContainer}>
      {/* ================= HERO ================= */}
      <section className={styles.heroAbout}>
        <h1 className={styles.title}>
          Construindo o futuro com o{" "}
          <span className={styles.titleHighlight}>Órion Finanças</span>
        </h1>
        <p className={styles.subtitle}>
          Educação financeira moderna, prática e acessível para a nova geração.
        </p>
      </section>

      {/* ================= QUEM SOMOS ================= */}
      <section className={styles.contentGrid}>
        <div className={styles.card}>
          <h3>Quem Somos?</h3>
          <p>
            O Órion Finanças nasceu da necessidade de transformar a educação
            financeira em algo acessível, prático e moderno para jovens que
            estão começando sua jornada.
          </p>
          <p>
            Percebemos que o sistema tradicional não prepara as pessoas para
            lidar com dinheiro, e decidimos mudar isso com tecnologia e
            simplicidade.
          </p>
        </div>

        <div className={styles.card}>
          <h3>Nosso Propósito</h3>
          <p>
            Acreditamos que o controle do dinheiro é a base para a realização
            de sonhos.
          </p>
          <p>
            Nossa plataforma simplifica a gestão de gastos, ensina
            planejamento e introduz conceitos de investimento de forma clara
            e aplicável.
          </p>
        </div>
      </section>

      {/* ================= MISSÃO VISÃO VALORES ================= */}
      <section className={styles.valuesSection}>
        <div className={styles.valueCard}>
          <h4 className={styles.valueTitle}>
            <Target size={20} />
            Missão
          </h4>
          <p>
            Democratizar a educação financeira através da tecnologia,
            tornando o conhecimento acessível a todos.
          </p>
        </div>

        <div className={styles.valueCard}>
          <h4 className={styles.valueTitle}>
            <Globe2 size={20} />
            Visão
          </h4>
          <p>
            Ser referência em educação financeira digital para jovens na
            América Latina.
          </p>
        </div>

        <div className={styles.valueCard}>
          <h4 className={styles.valueTitle}>
            <Gem size={20} />
            Valores
          </h4>
          <ul>
            <li>Transparência</li>
            <li>Clareza</li>
            <li>Inovação</li>
            <li>Responsabilidade financeira</li>
          </ul>
        </div>
      </section>

      {/* ================= DIFERENCIAIS ================= */}
      <section className={styles.differentials}>
        <h2>O que torna o Órion diferente?</h2>

        <div className={styles.differentialsGrid}>
          <div className={styles.diffCard}>
            <span className={styles.diffIcon}><Gamepad2 size={30} /></span>
            <h4>Gamificação</h4>
            <p>Aprender finanças deixa de ser chato e vira progresso real.</p>
          </div>

          <div className={styles.diffCard}>
            <span className={styles.diffIcon}><BarChart3 size={30} /></span>
            <h4>Visual e prático</h4>
            <p>Controle financeiro sem planilhas complexas.</p>
          </div>

          <div className={styles.diffCard}>
            <span className={styles.diffIcon}><Rocket size={30} /></span>
            <h4>Foco na juventude</h4>
            <p>Conteúdo pensado para quem está começando agora.</p>
          </div>
        </div>
      </section>

      {/* ================= FUTURO ================= */}
      <section className={styles.future}>
        <h2>O futuro do Órion</h2>
        <p>
          Estamos construindo uma plataforma cada vez mais completa,
          incluindo áreas de investimento, inteligência financeira e
          personalização baseada em dados.
        </p>
        <p>
          Nosso objetivo é que cada usuário desenvolva autonomia,
          responsabilidade e liberdade financeira real.
        </p>
      </section>
    </div>
  );
}
