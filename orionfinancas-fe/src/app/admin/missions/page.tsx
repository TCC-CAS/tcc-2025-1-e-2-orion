'use client';

import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import styles from './AdminMissions.module.css';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import toast from 'react-hot-toast';

interface Mission {
  _id: string;
  title: string;
  description: string;
  frequency: string;
  targetCount: number;
  reward: {
    xp: number;
    coins: number;
  };
  actionTrigger: string;
}

export default function AdminMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    frequency: 'DAILY',
    targetCount: 1,
    rewardXp: 0,
    rewardCoins: 0,
    actionTrigger: 'PERFECT_QUIZ'
  });

  const fetchMissions = async () => {
    try {
      const response = await api.get('/missions');
      if (response.status === 'OK') {
        setMissions(response.data);
      }
    } catch (error) {
      console.error('Erro ao buscar missões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  const handleOpenModal = (mission: Mission | null = null) => {
    if (mission) {
      setEditingMission(mission);
      setFormData({
        title: mission.title,
        description: mission.description,
        frequency: mission.frequency,
        targetCount: mission.targetCount,
        rewardXp: mission.reward.xp,
        rewardCoins: mission.reward.coins,
        actionTrigger: mission.actionTrigger
      });
    } else {
      setEditingMission(null);
      setFormData({
        title: '',
        description: '',
        frequency: 'DAILY',
        targetCount: 1,
        rewardXp: 0,
        rewardCoins: 0,
        actionTrigger: 'PERFECT_QUIZ'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      description: formData.description,
      frequency: formData.frequency,
      targetCount: formData.targetCount,
      reward: {
        xp: formData.rewardXp,
        coins: formData.rewardCoins
      },
      actionTrigger: formData.actionTrigger
    };

    try {
      let response;
      if (editingMission) {
        response = await api.put(`/missions/${editingMission._id}`, payload);
      } else {
        response = await api.post('/missions', payload);
      }

      if (response.status === 'OK') {
        fetchMissions();
        setIsModalOpen(false);
      } else {
        toast.error(response.message || 'Erro ao salvar missão', { style: { background: '#1c223a', color: '#fff', border: '1px solid #333954' } });
      }
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta missão?')) return;

    try {
      const response = await api.delete(`/missions/${id}`);
      if (response.status === 'OK') {
        fetchMissions();
      }
    } catch (error) {
      console.error('Erro ao excluir:', error);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gerenciamento de Missões</h1>
          <p className={styles.subtitle}>Crie e gerencie as missões e recompensas dos usuários.</p>
        </div>
        <button className={styles.addBtn} onClick={() => handleOpenModal()}>
          <Plus size={20} />
          Nova Missão
        </button>
      </header>

      <div className={styles.missionsGrid}>
        {loading ? (
          <p>Carregando...</p>
        ) : (
          missions.map((mission) => (
            <div key={mission._id} className={styles.missionCard}>
              <div className={styles.cardHeader}>
                <span className={styles.frequencyTag}>{mission.frequency}</span>
                <div className={styles.cardActions}>
                  <button onClick={() => handleOpenModal(mission)} className={styles.actionBtn} title="Editar">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(mission._id)} className={`${styles.actionBtn} ${styles.deleteBtn}`} title="Excluir">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <h3 className={styles.missionTitle}>{mission.title}</h3>
              <p className={styles.missionDesc}>{mission.description}</p>
              <div className={styles.missionStats}>
                <div className={styles.statLine}>
                  <span>Gatilho:</span>
                  <strong>{mission.actionTrigger}</strong>
                </div>
                <div className={styles.statLine}>
                  <span>Alvo:</span>
                  <strong>{mission.targetCount}x</strong>
                </div>
                <div className={styles.statLine}>
                  <span>Recompensa:</span>
                  <strong>{mission.reward.xp} XP | {mission.reward.coins} Coins</strong>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMission ? 'Editar Missão' : 'Nova Missão'}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Título</label>
            <input 
              type="text" 
              value={formData.title} 
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              required 
              placeholder="Ex: Mestre dos Quizzes"
            />
          </div>
          <div className={styles.formGroup}>
            <label>Descrição</label>
            <textarea 
              value={formData.description} 
              onChange={(e) => setFormData({...formData, description: e.target.value})} 
              required 
              placeholder="Ex: Gabarite 3 quizzes perfeitos"
            />
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Frequência</label>
              <select value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})}>
                <option value="DAILY">Diária</option>
                <option value="WEEKLY">Semanal</option>
                <option value="ONCE">Única</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Qtd. Necessária (Target)</label>
              <input 
                type="number" 
                value={formData.targetCount} 
                onChange={(e) => setFormData({...formData, targetCount: parseInt(e.target.value)})} 
                min="1" 
                required 
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Gatilho de Ação (Trigger)</label>
            <select value={formData.actionTrigger} onChange={(e) => setFormData({...formData, actionTrigger: e.target.value})}>
              <option value="PERFECT_QUIZ">Quiz Perfeito</option>
              <option value="COMPLETE_LESSON">Completar Lição</option>
              <option value="DAILY_LOGIN">Login Diário</option>
              <option value="GOAL_CREATED">Meta Criada</option>
            </select>
          </div>
          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Recompensa XP</label>
              <input 
                type="number" 
                value={formData.rewardXp} 
                onChange={(e) => setFormData({...formData, rewardXp: parseInt(e.target.value)})} 
                min="0" 
                required 
              />
            </div>
            <div className={styles.formGroup}>
              <label>Recompensa Moedas</label>
              <input 
                type="number" 
                value={formData.rewardCoins} 
                onChange={(e) => setFormData({...formData, rewardCoins: parseInt(e.target.value)})} 
                min="0" 
                required 
              />
            </div>
          </div>
          <div className={styles.modalActions}>
            <button type="button" className={styles.cancelBtn} onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button type="submit" className={styles.submitBtn}>
              {editingMission ? 'Salvar Alterações' : 'Criar Missão'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
