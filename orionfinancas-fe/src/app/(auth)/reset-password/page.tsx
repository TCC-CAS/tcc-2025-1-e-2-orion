"use client";

import { useState } from "react";
import styles from "./ResetPassword.module.css";
import { Button } from "@/components/ui/button/Button";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");
    setSuccess(false);

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setSuccess(true);
      setLoading(false);
    }, 1200);
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Definir nova senha</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Nova senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmar nova senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          {success && (
            <p className={styles.success}>
              Senha alterada com sucesso. Você já pode entrar.
            </p>
          )}

          {error && <p className={styles.error}>{error}</p>}

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Salvando..." : "Alterar senha"}
          </Button>
        </form>
      </div>
    </main>
  );
}
