"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './Register.module.css';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button/Button';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthdate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = await api.post('/auth/register', formData);
      
      if (data.status === 'OK') {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Erro ao realizar cadastro');
      }
    } catch (err) {
      setError('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Criar Conta</h1>
          <p className={styles.subtitle}>
            Preencha os dados para começar sua jornada
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p style={{ color: '#ff4d4d', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          
          <div className={styles.field}>
            <label>Nome completo</label>
            <input 
              type="text" 
              name="name"
              placeholder="Seu nome" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input 
              type="email" 
              name="email"
              placeholder="seu@email.com" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.field}>
            <label>Senha</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              required 
            />
          </div>

          <div className={styles.field}>
            <label>Data de nascimento</label>
            <input 
              type="date" 
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              required 
            />
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

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar-se'}
          </Button>
        </form>

        <div className={styles.divider}>
          <span>ou</span>
        </div>

        <Button
          variant="secondary"
          type="button"
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
