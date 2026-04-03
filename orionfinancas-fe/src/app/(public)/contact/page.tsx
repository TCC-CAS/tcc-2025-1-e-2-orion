"use client";

import { useState } from "react";
import styles from './Contact.module.css';
import { Button } from '@/components/ui/button/Button';
import { FormField } from '@/components/ui/form/FormField';

export default function ContactPage() {


  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setStatus("success");

      setTimeout(() => {
        setStatus("idle");
      }, 5000);
    } catch {
      setStatus("error");
    }
  }


  return (
    <div className={styles.contactContainer}>
      <header className={styles.contactHeader}>
        <h1 className={styles.title}>Fale <span className="highlight">Conosco</span></h1>
        <p className={styles.subtitle}>
          Dúvidas, sugestões ou parcerias? Nossa equipe está pronta para te ouvir.
        </p>
      </header>

      <div className={styles.contactGrid}>
        <div className={styles.infoSection}>
          <div className={styles.infoCard}>
            <h3>Canais de Atendimento</h3>
            <p><strong>Email:</strong> suporte@orionfinancas.com.br</p>
            <p><strong>Horário:</strong> Seg - Sex, 09h às 18h</p>
          </div>
          <div className={styles.infoCard}>
            <h3>Redes Sociais</h3>
            <p>Siga-nos para dicas diárias de educação financeira.</p>
            <div className={styles.socialLinks}>
              <span>Instagram</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <FormField label="Nome Completo">
            <input type="text" placeholder="Como podemos te chamar?" required />
          </FormField>

          <FormField label="E-mail">
            <input type="email" placeholder="seu@email.com" required />
          </FormField>

          <FormField label="Assunto">
            <select required>
              <option value="">Selecione um assunto</option>
              <option>Suporte Técnico</option>
              <option>Sugestões</option>
              <option>Parcerias</option>
              <option>Outros</option>
            </select>
          </FormField>


          <FormField label="Mensagem">
            <textarea rows={5} placeholder="Escreva sua mensagem aqui..." required />
          </FormField>
          <Button type="submit" variant="primary">
            Enviar Mensagem
          </Button>

          {status === "success" && (
            <p className={styles.successMessage}>
              Mensagem enviada com sucesso! Em breve entraremos em contato.
            </p>
          )}

          {status === "error" && (
            <p className={styles.errorMessage}>
              Ocorreu um erro ao enviar sua mensagem. Tente novamente.
            </p>
          )}

        </form>
      </div>
    </div>
  );
}
