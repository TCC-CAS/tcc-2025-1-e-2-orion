'use client';

import { useState } from 'react';
import { User, Shield, Key } from 'lucide-react';
import styles from './AdminProfile.module.css';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

const ADMIN_DATA = {
  name: 'Administrador Órion',
  email: 'admin@orionfinancas.com',
  since: '12 de Outubro, 2023',
  lastLogin: 'Há 22 minutos',
  permissions: ['Gerenciar Usuários', 'Moderar Conteúdo', 'Configurações de Assinatura', 'Análise de Feedbacks']
};

export default function AdminProfilePage() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatarSection}>
          <div className={styles.defaultAvatarIcon}>
            <User size={60} />
          </div>
        </div>
        <div className={styles.userInfo}>
          <h1>{ADMIN_DATA.name}</h1>
          <p>{ADMIN_DATA.email}</p>
        </div>
      </header>

      <div className={styles.detailsGrid}>
        <div className={styles.card}>
          <h3><User size={20} color="var(--primary-color)" /> Informações Gerais</h3>
          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Membro desde</span>
              <span className={styles.infoValue}>{ADMIN_DATA.since}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Último acesso</span>
              <span className={styles.infoValue}>{ADMIN_DATA.lastLogin}</span>
            </div>
          </div>
        </div>

        <div className={styles.card}>
          <h3><Shield size={20} color="var(--primary-color)" /> Permissões</h3>
          <div className={styles.infoList}>
            {ADMIN_DATA.permissions.map((perm, idx) => (
              <div key={idx} className={styles.infoItem}>
                <span className={styles.infoValue}>{perm}</span>
                <span className={styles.infoLabel}>Ativo</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`${styles.card} ${styles.dangerZone}`}>
          <h3><Key size={20} color="#ff4d4d" /> Segurança</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
            Proteja sua conta administrativa garantindo que suas credenciais estejam seguras.
          </p>
          <button 
            className={styles.dangerBtn}
            onClick={() => setIsResetModalOpen(true)}
          >
            Redefinir Senha
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Redefinir Senha"
        maxWidth="400px"
      >
        <form className={styles.modalForm} onSubmit={(e) => {
          e.preventDefault();
          toast.success('Senha redefinida com sucesso (simulação)', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
          setIsResetModalOpen(false);
        }}>
          <div className={styles.inputGroup}>
            <label>Senha Atual</label>
            <input type="password" className={styles.input} required placeholder="Digite a senha atual" />
          </div>
          <div className={styles.inputGroup}>
            <label>Nova Senha</label>
            <input type="password" className={styles.input} required placeholder="Mínimo 8 caracteres" />
          </div>
          <div className={styles.inputGroup}>
            <label>Confirmar Nova Senha</label>
            <input type="password" className={styles.input} required placeholder="Repita a nova senha" />
          </div>
          <button type="submit" className={styles.submitBtn}>Salvar Nova Senha</button>
        </form>
      </Modal>
    </div>
  );
}

