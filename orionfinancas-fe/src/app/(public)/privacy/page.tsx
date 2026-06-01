import styles from './Privacy.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.privacyContainer}>
      <header className={styles.privacyHeader}>
        <h1 className={styles.title}>Políticas de <span className="highlight">Privacidade</span></h1>
        <p className={styles.lastUpdated}>Última atualização: 14 de Janeiro de 2026</p>
      </header>

      <section className={styles.legalContent}>
        <div className={styles.section}>
          <h2>1. Coleta de Informações</h2>
          <p>
            Coletamos informações básicas para fornecer uma experiência personalizada, como seu nome, 
            e-mail e data de nascimento durante o registro. Dados financeiros inseridos por você são 
            utilizados exclusivamente para os cálculos e relatórios da plataforma.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. Uso dos Dados</h2>
          <p>
            Seus dados nunca serão vendidos a terceiros. Utilizamos as informações coletadas para:
          </p>
          <ul>
            <li>Personalizar suas metas financeiras;</li>
            <li>Enviar notificações importantes sobre sua conta;</li>
            <li>Melhorar as funcionalidades e segurança do Orion Finanças.</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>3. Segurança</h2>
          <p>
            Empregamos medidas de segurança técnicas para proteger seus dados pessoais contra acesso 
            não autorizado, perda ou alteração, em conformidade com a LGPD (Lei Geral de Proteção de Dados).
          </p>
        </div>

        <div className={styles.section}>
          <h2>4. Seus Direitos</h2>
          <p>
            Você tem o direito de acessar, corrigir ou excluir seus dados pessoais a qualquer momento 
            através das configurações da sua conta ou entrando em contato com nosso suporte.
          </p>
        </div>
      </section>
    </div>
  );
}