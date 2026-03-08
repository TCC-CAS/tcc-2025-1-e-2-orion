import styles from './Help.module.css';
import Link from 'next/link';
import { Button } from '@/components/ui/button/Button';


export default function HelpPage() {
  const faqs = [
    {
      question: "Como crio minha conta no Orion?",
      answer: "Basta clicar no botão 'Login / Cadastrar-se' no topo da página e preencher seus dados básicos."
    },
    {
      question: "O Orion Finanças é gratuito?",
      answer: "Sim, nossa plataforma base de educação e controle financeiro é totalmente gratuita para todos os usuários."
    },
    {
      question: "Esqueci minha senha, o que fazer?",
      answer: "Na tela de login, clique em 'Esqueci minha senha' para receber um link de recuperação no seu e-mail."
    },
    {
      question: "Meus dados estão seguros?",
      answer: "Sim, utilizamos criptografia de ponta e seguimos as diretrizes da LGPD para garantir sua privacidade."
    }
  ];

  return (
    <div className={styles.helpContainer}>
      <header className={styles.helpHeader}>
        <h1 className={styles.title}>Central de <span className="highlight">Atendimento</span></h1>
        <p className={styles.subtitle}>Como podemos ajudar você hoje?</p>
      </header>

      <section className={styles.faqGrid}>
        {faqs.map((faq, index) => (
          <div key={index} className={styles.faqCard}>
            <h3>{faq.question}</h3>
            <p>{faq.answer}</p>
          </div>
        ))}
      </section>

      <section className={styles.contactSupport}>
        <h3>Não encontrou o que procurava?</h3>
        <p>
          Nossa equipe de suporte está pronta para te ajudar de forma personalizada.
        </p>

        <Link href="/contact">
          <Button variant="primary">
            Falar com um Especialista
          </Button>
        </Link>
      </section>
    </div>
  );
}