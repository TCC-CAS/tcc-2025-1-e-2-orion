"use client";

import { useState } from "react";
import styles from './Contact.module.css';
import { Button } from '@/components/ui/button/Button';
import { FormField } from '@/components/ui/form/FormField';

import { api } from "@/services/api";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const response = await api.post("/contact/send", formData);
      if (response.status === "OK") {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error(err);
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
        </div>

        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <FormField label="Nome Completo">
            <input
              type="text"
              maxLength={60}
              placeholder="Como podemos te chamar?"
              value={formData.name || ""}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </FormField>

          <FormField label="E-mail">
            <input
              type="email"
              maxLength={120}
              placeholder="seu@email.com"
              value={formData.email || ""}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              required
            />
          </FormField>

          <FormField label="Assunto">
            <select 
              value={formData.subject || ""}
              onChange={(e) => setFormData({...formData, subject: e.target.value})}
              required
            >
              <option value="">Selecione um assunto</option>
              <option value="Suporte Técnico">Suporte Técnico</option>
              <option value="Sugestões">Sugestões</option>
              <option value="Parcerias">Parcerias</option>
              <option value="Outros">Outros</option>
            </select>
          </FormField>


          <FormField label="Mensagem">
            <textarea
              rows={5}
              maxLength={2000}
              placeholder="Escreva sua mensagem aqui..."
              value={formData.message || ""}
              onChange={(e) => setFormData({...formData, message: e.target.value})}
              required
            />
          </FormField>
          <Button type="submit" variant="primary" disabled={status === "loading"}>
            {status === "loading" ? "Enviando..." : "Enviar Mensagem"}
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
