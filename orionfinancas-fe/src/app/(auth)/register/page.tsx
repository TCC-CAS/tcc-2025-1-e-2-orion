"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './Register.module.css';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button/Button';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';

export default function RegisterPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Criar Conta</h1>
          <p className={styles.subtitle}>
            Preencha os dados para começar sua jornada
          </p>
        </div>

        <form className={styles.form}>
          <div className={styles.field}>
            <label>Nome completo</label>
            <input type="text" placeholder="Seu nome" required />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input type="email" placeholder="seu@email.com" required />
          </div>

          <div className={styles.field}>
            <label>Senha</label>
            <input type="password" placeholder="••••••••" required />
          </div>

          <div className={styles.field}>
            <label>Data de nascimento</label>
            <input type="date" required />
          </div>

          <Checkbox
            id="terms"
            required
            label={
              <span className={styles.checkboxText}>
                Concordo com os
                <Link href="/terms"> Termos de Serviço</Link> e
                <Link href="/privacy"> Política de Privacidade</Link>
              </span>
            }
          />

          <Checkbox
            id="captcha"
            required
            label={
              <span className={styles.checkboxText}>
                Eu não sou um robô
              </span>
            }
          />

          <Button type="submit" variant="primary">
            Registrar-se
          </Button>
        </form>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <Button
          variant="secondary"
          onClick={() => signIn('google', { callbackUrl: '/learning' })}
        >
          <Image
            src="https://authjs.dev/img/providers/google.svg"
            alt="Google Logo"
            width={20}
            height={20}
          />
          Registrar-se com Google
        </Button>

        <div className={styles.footerLink}>
          <span>Já possui conta?</span>
          <Link href="/login">Entrar</Link>
        </div>
      </div>
    </main>
  );
}
