"use client";

import Link from 'next/link';
import Image from 'next/image';
import styles from './Register.module.css';

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
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const passwordValidationMessage =
    'A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.';
  const emailRequiredMessage = 'Informe um email.';
  const emailInvalidMessage =
    'Digite um email válido no formato nome@exemplo.com (incluindo @ e domínio).';

  const calculateAge = (birthdate: string) => {
    const today = new Date();
    const birthDate = new Date(birthdate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.birthdate) {
      setError('Data de nascimento é obrigatória.');
      setLoading(false);
      return;
    }

    const age = calculateAge(formData.birthdate);
    if (isNaN(age) || age < 18) {
      setError('A plataforma é destinada a maiores de 18 anos.');
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError('É necessário aceitar os Termos de Uso e a Política de Privacidade.');
      setLoading(false);
      return;
    }

    const hasMinLength = formData.password.length >= 8;
    const hasUppercase = /[A-Z]/.test(formData.password);
    const hasLowercase = /[a-z]/.test(formData.password);
    const hasNumber = /\d/.test(formData.password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(formData.password);

    if (!hasMinLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError('A senha deve ter no mínimo 8 caracteres, incluindo letra maiúscula, minúscula, número e caractere especial.');
      setLoading(false);
      return;
    }

    try {
      const data = await api.post('/auth/register', {
        ...formData,
        acceptedTerms: true,
        acceptedPrivacy: true
      });
      
      if (data.status === 'OK') {
        router.push('/login?registered=true');
      } else {
        setError(data.message || 'Erro ao realizar cadastro');
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setError(apiError.message || 'Erro de conexão com o servidor');
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
              minLength={3}
              maxLength={60}
              pattern="^[A-Za-zÀ-ÿ\s'\-]+$"
              title="Use apenas letras, espaços e hifens (mínimo 3 caracteres)"
              required
            />
          </div>

          <div className={styles.field}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              maxLength={120}
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              onInvalid={(e) => {
                const el = e.currentTarget;
                if (el.validity.valueMissing) {
                  el.setCustomValidity(emailRequiredMessage);
                } else {
                  el.setCustomValidity(emailInvalidMessage);
                }
              }}
              onInput={(e) => {
                e.currentTarget.setCustomValidity('');
              }}
              title={emailInvalidMessage}
              required 
            />
          </div>

          <div className={styles.field}>
            <label>Senha segura</label>
            <input 
              type="password" 
              name="password"
              placeholder="••••••••" 
              value={formData.password}
              onChange={handleChange}
              onInvalid={(e) => {
                e.currentTarget.setCustomValidity(passwordValidationMessage);
              }}
              onInput={(e) => {
                e.currentTarget.setCustomValidity('');
              }}
              minLength={8}
              maxLength={128}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$"
              title={passwordValidationMessage}
              required
            />
            <small>
              Use ao menos 8 caracteres com letra maiúscula, minúscula, número e caractere especial.
            </small>
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
            checked={acceptedTerms}
            onChange={(checked: boolean) => setAcceptedTerms(checked)}
            label={
              <span className={styles.checkboxText}>
                Concordo com os
                <Link href="/terms"> Termos de Serviço</Link> e
                <Link href="/privacy"> Política de Privacidade</Link>
              </span>
            }
          />

          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrar-se'}
          </Button>
        </form>



        <div className={styles.footerLink}>
          <span>Já possui conta?</span>
          <Link href="/login">Entrar</Link>
        </div>
      </div>
    </main>
  );
}
