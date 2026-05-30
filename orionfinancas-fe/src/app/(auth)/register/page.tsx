"use client";

import Link from 'next/link';
import styles from './Register.module.css';

import { Button } from '@/components/ui/button/Button';
import { Checkbox } from '@/components/ui/checkbox/Checkbox';
import { useMemo, useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  birthdate?: string;
  terms?: string;
  general?: string;
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    birthdate: ''
  });
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FieldErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setTouched(prev => ({ ...prev, [e.target.name]: true }));
  };

  const passwordChecks = useMemo(() => {
    const p = formData.password;
    return {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      number: /\d/.test(p),
      special: /[^A-Za-z0-9]/.test(p),
    };
  }, [formData.password]);

  const passwordStrong = Object.values(passwordChecks).every(Boolean);

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

  const validate = (): FieldErrors => {
    const e: FieldErrors = {};
    const name = formData.name.trim();
    if (!name) e.name = 'Informe seu nome completo.';
    else if (name.length < 3) e.name = 'O nome deve ter ao menos 3 caracteres.';
    else if (!/^[A-Za-zÀ-ÿ\s'\-]+$/.test(name)) e.name = 'Use apenas letras, espaços e hifens.';

    if (!formData.email) e.email = 'Informe um email.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      e.email = 'Digite um email válido (ex: nome@exemplo.com).';

    if (!formData.password) e.password = 'Crie uma senha.';
    else if (!passwordStrong) e.password = 'Sua senha ainda não atende todos os requisitos.';

    if (!formData.birthdate) e.birthdate = 'Informe sua data de nascimento.';
    else {
      const age = calculateAge(formData.birthdate);
      if (isNaN(age)) e.birthdate = 'Data inválida.';
      else if (age < 18) e.birthdate = 'A plataforma é destinada a maiores de 18 anos.';
      else if (age > 120) e.birthdate = 'Data de nascimento inválida.';
    }

    if (!acceptedTerms) e.terms = 'É necessário aceitar os Termos e a Política de Privacidade.';

    return e;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true, birthdate: true });

    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const data = await api.post('/auth/register', {
        ...formData,
        acceptedTerms: true,
        acceptedPrivacy: true
      });

      if (data.status === 'OK') {
        router.push('/login?registered=true');
      } else {
        setErrors({ general: data.message || 'Erro ao realizar cadastro' });
      }
    } catch (err: unknown) {
      const apiError = err as { message?: string };
      setErrors({ general: apiError.message || 'Erro de conexão com o servidor' });
    } finally {
      setLoading(false);
    }
  };

  const showPasswordChecklist = touched.password || formData.password.length > 0;

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>Criar Conta</h1>
          <p className={styles.subtitle}>
            Preencha os dados para começar sua jornada
          </p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {errors.general && (
            <div className={styles.alert} role="alert">
              <span className={styles.alertIcon}>!</span>
              <span>{errors.general}</span>
            </div>
          )}

          <div className={styles.field}>
            <label htmlFor="name">Nome completo</label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Seu nome"
              value={formData.name}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={60}
              aria-invalid={!!errors.name}
              className={errors.name ? styles.inputError : ''}
            />
            {errors.name && <span className={styles.errorMsg}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              name="email"
              maxLength={120}
              placeholder="seu@email.com"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={!!errors.email}
              className={errors.email ? styles.inputError : ''}
            />
            {errors.email && <span className={styles.errorMsg}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label htmlFor="password">Senha segura</label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              onBlur={handleBlur}
              maxLength={128}
              aria-invalid={!!errors.password}
              className={errors.password ? styles.inputError : ''}
            />
            {showPasswordChecklist && (
              <ul className={styles.checklist}>
                <ChecklistItem ok={passwordChecks.length} label="Mínimo 8 caracteres" />
                <ChecklistItem ok={passwordChecks.upper} label="Uma letra maiúscula (A-Z)" />
                <ChecklistItem ok={passwordChecks.lower} label="Uma letra minúscula (a-z)" />
                <ChecklistItem ok={passwordChecks.number} label="Um número (0-9)" />
                <ChecklistItem ok={passwordChecks.special} label="Um caractere especial (!@#...)" />
              </ul>
            )}
            {errors.password && !showPasswordChecklist && (
              <span className={styles.errorMsg}>{errors.password}</span>
            )}
          </div>

          <div className={styles.field}>
            <label htmlFor="birthdate">Data de nascimento</label>
            <input
              id="birthdate"
              type="date"
              name="birthdate"
              value={formData.birthdate}
              onChange={handleChange}
              onBlur={handleBlur}
              max={new Date().toISOString().split('T')[0]}
              aria-invalid={!!errors.birthdate}
              className={errors.birthdate ? styles.inputError : ''}
            />
            {errors.birthdate && <span className={styles.errorMsg}>{errors.birthdate}</span>}
          </div>

          <div className={styles.termsWrapper}>
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onChange={(checked: boolean) => {
                setAcceptedTerms(checked);
                if (checked && errors.terms) setErrors(prev => ({ ...prev, terms: undefined }));
              }}
              label={
                <span className={styles.checkboxText}>
                  Concordo com os
                  <Link href="/terms" className={styles.inlineLink}> Termos de Serviço</Link> e
                  <Link href="/privacy" className={styles.inlineLink}> Política de Privacidade</Link>
                </span>
              }
            />
            {errors.terms && <span className={styles.errorMsg}>{errors.terms}</span>}
          </div>

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

function ChecklistItem({ ok, label }: { ok: boolean; label: string }) {
  return (
    <li className={ok ? styles.checkOk : styles.checkPending}>
      <span className={styles.checkIcon} aria-hidden="true">{ok ? '✓' : '○'}</span>
      <span>{label}</span>
    </li>
  );
}
