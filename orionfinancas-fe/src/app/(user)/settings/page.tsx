"use client";

import Link from 'next/link';
import { useState, useCallback, useEffect } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import styles from './Settings.module.css';
import DeleteAccountModal from './components/DeleteAccountModal';
import UpdatePlanModal from './components/UpdatePlanModal';
import { api } from '@/services/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

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

    const handleDeleteAccount = useCallback(() => {
        // Lógica de exclusão aqui
        toast.success("Conta excluída com sucesso.", { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
        window.location.href = '/';
    }, []);

    const handleUpgradePlan = useCallback(() => {
        const isGr = !subscription || subscription.planType === 'GRATUITO' || subscription.planType === undefined;
        toast.success(isGr ? "Plano Mensal habilitado!" : "Upgrade solicitado para o Plano Anual!", { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954', borderLeft: '3px solid #00f2a9' } });
        setIsPlanModalOpen(false);
    }, [subscription]);

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

                                    <button
                                        type="button"
                                        className={styles.btnDeleteInline}
                                        onClick={() => setIsDeleteModalOpen(true)}
                                    >
                                        <Trash2 size={16} />
                                        Excluir minha conta
                                    </button>
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
                                    {subscription && (
                                        <button className={styles.dangerBtn}>Cancelar Assinatura</button>
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

            <DeleteAccountModal 
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteAccount}
            />
        </div>
    );
}
