"use client";

import Image from 'next/image';
import Link from 'next/link';
import styles from './Login.module.css';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button/Button';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { refreshProfile } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/login', { email, password });
      
      if (data.status === 'OK') {
        // Por enquanto, salvamos no localStorage para teste básico
        localStorage.setItem('token', data.token);
        
        // Carrega o perfil imediatamente para que já apareça no dashboard
        await refreshProfile();
        
        router.push('/learning');
      } else {
        setError(data.message || 'Erro ao realizar login');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.loginPage}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h1 className={styles.loginTitle}>Acessar Plataforma</h1>
          <p className={styles.loginSubtitle}>
            Entre na sua conta e continue aprendendo
          </p>
        </div>

        <form className={styles.loginForm} onSubmit={handleSubmit}>
          {error && <p className={styles.errorMessage} style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          
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

          <div className={styles.field}>
            <label>Senha</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className={styles.forgotPassword}>
            <Link href="/forgot-password" className={styles.forgotPassword}>
              Esqueceu a senha?
            </Link>
          </div>

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar →'}
          </Button>
        </form>

        <div className={styles.loginDivider}>
          <span>ou</span>
        </div>

        <Button
          variant="social"
          type="button"
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
