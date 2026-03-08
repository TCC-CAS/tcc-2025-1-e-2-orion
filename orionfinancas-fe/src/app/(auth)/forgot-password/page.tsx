"use client";

import { useState } from "react";
import styles from "./ForgotPassword.module.css";
import { Button } from "@/components/ui/button/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setSuccess(false);

   
    setTimeout(() => {
      if (!email.includes("@")) {
        setError("Informe um email válido.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setLoading(false);
    }, 1200);
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Recuperar senha</h1>
          <p className={styles.subtitle}>
            Informe seu email para receber o link de recuperação
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {success && (
            <p className={styles.success}>
              Se o email existir, enviaremos um link para redefinir sua senha.
            </p>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </Button>
        </form>

        <div className={styles.links}>
          <a href="/login">Voltar para o login</a>
        </div>
      </div>
    </main>
  );
}
