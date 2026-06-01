"use client";

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import styles from './Settings.module.css';
import UpdatePlanModal from './components/UpdatePlanModal';
import CancelSubscriptionModal from './components/CancelSubscriptionModal';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { useUser } from '@/contexts/UserContext';

export default function SettingsPage() {
    const { refreshProfile } = useUser();
    const [activeTab, setActiveTab] = useState('profile');
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const [userData, setUserData] = useState({ name: '', email: '' });
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        api.get('/account/profile').then(res => {
            if (res.status === 'OK' && res.data) {
                setUserData({ name: res.data.name || '', email: res.data.email || '' });
                setSubscription(res.data.subscription || null);
            }
        });
    }, []);

    const handleUpgradePlan = useCallback(() => {
        const isGr = !subscription || subscription.planType === 'GRATUITO' || subscription.planType === undefined;
        toast.success(isGr ? "Plano Mensal habilitado!" : "Upgrade solicitado para o Plano Anual!", { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
        setIsPlanModalOpen(false);
    }, [subscription]);

    const handleCancelSubscription = async () => {
        try {
            const res = await api.post('/account/cancel-subscription', {});
            if (res.status === 'OK') {
                toast.success('Assinatura cancelada com sucesso.', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #ef4444' } });
                await refreshProfile();
                const profileRes = await api.get('/account/profile');
                if (profileRes.status === 'OK') setSubscription(profileRes.data.subscription || null);
            }
        } catch (err) {
            toast.error('Erro ao cancelar assinatura');
        }
    };

    const handleExportData = useCallback(async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${apiUrl}/account/export`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!response.ok) {
                const contentType = response.headers.get('content-type') || '';
                let serverMessage = '';

                if (contentType.includes('application/json')) {
                    const errorData = await response.json();
                    serverMessage = errorData?.message || '';
                } else {
                    const errorText = await response.text();
                    if (errorText.includes('Cannot GET /api/account/export')) {
                        serverMessage = 'A exportação de dados está indisponível no momento.';
                    }
                }

                if (!serverMessage && (response.status === 404 || response.status === 405)) {
                    serverMessage = 'A exportação de dados não está disponível agora.';
                }

                if (!serverMessage && (response.status === 400 || response.status === 422 || response.status === 204)) {
                    serverMessage = 'Sua conta ainda não possui dados suficientes para gerar o PDF.';
                }

                toast.error(serverMessage || 'Não foi possível exportar seus dados agora. Tente novamente em instantes.');
                return;
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `orion-meus-dados-${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
            toast.success('Seus dados foram exportados.', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
        } catch (err) {
            console.error(err);
            toast.error('Erro ao exportar dados');
        }
    }, []);

    const handlePermanentDelete = useCallback(async (currentPassword: string) => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${apiUrl}/account/permanent`, {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword })
            });
            const data = await response.json();
            if (response.ok && data.status === 'OK') {
                toast.success(data.message, { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #ef4444' } });
                window.location.href = '/';
            } else {
                toast.error(data.message || 'Erro ao excluir conta');
            }
        } catch (err) {
            toast.error('Erro ao excluir conta');
        }
    }, []);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await api.put('/account/updateAccount', { name: userData.name });
            if (res.status === 'OK') {
                toast.success('Perfil atualizado com sucesso!', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
            } else {
                toast.error(res.message || 'Erro ao atualizar perfil', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar perfil', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
        }
    };

    const handleUpdatePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error('A nova senha e a confirmação não coincidem.', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
        }
        try {
            const res = await api.put('/account/update-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            if (res.status === 'OK') {
                toast.success('Senha atualizada com sucesso!', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(res.message || 'Erro ao atualizar senha', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
            }
        } catch (err) {
            console.error(err);
            toast.error('Erro ao atualizar senha', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
        }
    };

    return (
        <div className={styles.settingsContainer}>
            <div className={styles.headerActions}>
                <Link href="/profile" className={styles.backBtn}>
                    <ArrowLeft size={16} />
                    Voltar
                </Link>
            </div>

            <h1 className={styles.pageTitle}>Configurações</h1>

            <div className={styles.settingsLayout}>
                <aside className={styles.settingsNav}>
                    <button
                        className={`${styles.navItem} ${activeTab === 'profile' ? styles.active : ''}`}
                        onClick={() => setActiveTab('profile')}
                    >
                        Perfil
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'security' ? styles.active : ''}`}
                        onClick={() => setActiveTab('security')}
                    >
                        Segurança
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'subscription' ? styles.active : ''}`}
                        onClick={() => setActiveTab('subscription')}
                    >
                        Assinatura
                    </button>
                    <button
                        className={`${styles.navItem} ${activeTab === 'privacy' ? styles.active : ''}`}
                        onClick={() => setActiveTab('privacy')}
                    >
                        Privacidade
                    </button>
                </aside>

                <main className={styles.settingsContent}>
                    {activeTab === 'profile' && (
                        <div className={styles.card}>
                            <h2>Informações do Perfil</h2>
                            <form className={styles.form} onSubmit={handleSaveProfile}>
                                <div className={styles.field}>
                                    <label>Nome Completo</label>
                                    <input
                                        type="text"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                        minLength={3}
                                        maxLength={60}
                                        pattern="^[A-Za-zÀ-ÿ\s'\-]+$"
                                        title="Use apenas letras, espaços e hifens (mínimo 3 caracteres)"
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Email (Não é possível alterar)</label>
                                    <input 
                                        type="email" 
                                        value={userData.email} 
                                        disabled 
                                    />
                                </div>
                                <div className={styles.formFooter}>
                                    <button type="submit" className={styles.saveBtn}>Salvar Alterações</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className={styles.card}>
                            <h2>Segurança</h2>
                            <form className={styles.form} onSubmit={handleUpdatePassword}>
                                <div className={styles.field}>
                                    <label>Senha Atual</label>
                                    <input
                                        type="password"
                                        maxLength={128}
                                        placeholder="••••••••"
                                        value={passwordData.currentPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Nova Senha</label>
                                    <input
                                        type="password"
                                        maxLength={128}
                                        placeholder="••••••••"
                                        value={passwordData.newPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className={styles.field}>
                                    <label>Confirmar Nova Senha</label>
                                    <input
                                        type="password"
                                        maxLength={128}
                                        placeholder="••••••••"
                                        value={passwordData.confirmPassword}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                        required
                                    />
                                </div>
                                <button type="submit" className={styles.saveBtn}>Atualizar Senha</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'privacy' && (
                        <div className={styles.card}>
                            <h2>Privacidade e seus Dados (LGPD)</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                                Você tem direito de acessar, exportar e excluir seus dados pessoais a qualquer momento, conforme a Lei Geral de Proteção de Dados.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Exportar meus dados</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                                        Receba um relatório PDF com todas as informações que mantemos sobre você (perfil, transações, metas, assinaturas, notificações).
                                    </p>
                                    <button type="button" className={styles.secondaryBtn} onClick={handleExportData}>
                                        Baixar meus dados
                                    </button>
                                </div>

                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '1rem 0' }} />

                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem', color: '#ef4444' }}>Exclusão permanente</h3>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.8rem' }}>
                                        Anonimiza sua conta, remove suas transações, metas e notificações. Esta ação é <strong>irreversível</strong>.
                                    </p>
                                    <button
                                        type="button"
                                        className={styles.dangerBtn}
                                        onClick={() => {
                                            const pwd = window.prompt('Confirme sua senha atual para excluir permanentemente sua conta:');
                                            if (pwd) handlePermanentDelete(pwd);
                                        }}
                                    >
                                        Excluir conta permanentemente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'subscription' && (
                        <div className={styles.card}>
                            <h2>Detalhes da Assinatura</h2>
                            <div className={styles.planInfo}>
                                <div className={styles.planHeader}>
                                    <span className={styles.planBadge}>{subscription ? `PLANO ${subscription.planType}` : "PLANO GRATUITO"}</span>
                                    {subscription && (
                                        <span className={styles.planPrice}>
                                            {subscription.planType === 'PRO' ? 'R$ 299,90/ano' : 
                                             subscription.planType === 'MENSAL' ? 'R$ 29,90/mês' : 
                                             'Grátis'}
                                        </span>
                                    )}
                                </div>
                                <p>
                                    {subscription && subscription.nextBillingDate
                                        ? `Sua assinatura Pro está ativa até ${new Date(subscription.nextBillingDate).toLocaleDateString('pt-BR')}.`
                                        : subscription && subscription.planType === 'PRO'
                                            ? "Sua assinatura Pro está ativa."
                                            : "Você não possui uma assinatura paga ativa no momento."}
                                </p>
                                <div className={styles.planActions}>
                                    <button
                                        className={styles.secondaryBtn}
                                        onClick={() => setIsPlanModalOpen(true)}
                                    >
                                        Mudar Plano
                                    </button>
                                    {subscription && subscription.status === 'ACTIVE' && (
                                        <button className={styles.dangerBtn} onClick={() => setIsCancelModalOpen(true)}>Cancelar Assinatura</button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            <UpdatePlanModal 
                isOpen={isPlanModalOpen}
                currentPlan={subscription?.planType || 'GRATUITO'}
                onClose={() => setIsPlanModalOpen(false)}
                onConfirm={handleUpgradePlan}
            />

            <CancelSubscriptionModal 
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                onConfirm={handleCancelSubscription}
            />
        </div>
    );
}
