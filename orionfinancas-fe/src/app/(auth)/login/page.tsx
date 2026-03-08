"use client";

import Image from 'next/image';
import Link from 'next/link';
import styles from './Login.module.css';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button/Button';

export default function LoginPage() {
  return (
    <main className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Acessar Plataforma</h1>
          <p className={styles.loginSubtitle}>
            Entre na sua conta e continue aprendendo
          </p>
        </div>

        <form className={styles.loginForm}>
          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div className={styles.forgotPassword}>
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" variant="primary" onClick={() => window.location.href = '/learning'}>
            Entrar →
          </Button>
        </form>

        <div className={styles.loginDivider}>
          <span>ou</span>
        </div>

        <Button
          variant="social"
          onClick={() => signIn('google', { callbackUrl: '/learning' })}
        >
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google Logo"
            width={20}
            height={20}
          />
          Entrar com Google
        </Button>

        <div className={styles.authFooter}>
          Não possui uma conta?{' '}
          <Link href="/register" className={styles.authLink}>
            Registrar-se
          </Link>
        </div>

      </div>
    </main>
  );
}
