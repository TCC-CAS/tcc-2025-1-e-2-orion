import styles from './Terms.module.css';

export default function TermsPage() {
  return (
    <div className={styles.termsContainer}>
      <header className={styles.termsHeader}>
        <h1 className={styles.title}>Termos de <span className="highlight">Uso</span></h1>
        <p className={styles.lastUpdated}>Última atualização: 14 de Janeiro de 2026</p>
      </header>

      <section className={styles.legalContent}>
        <div className={styles.section}>
          <h2>1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e utilizar a plataforma Orion Finanças, você concorda em cumprir e estar vinculado a estes Termos de Uso. 
            Se você não concordar com qualquer parte destes termos, não deverá utilizar nossos serviços.
          </p>
        </div>

        <div className={styles.section}>
          <h2>2. Descrição do Serviço</h2>
          <p>
            O Orion Finanças fornece ferramentas de gestão financeira e conteúdo educativo. 
            Nossos serviços são informativos e não constituem aconselhamento financeiro legal ou profissional. 
            Todas as decisões tomadas com base nas informações da plataforma são de responsabilidade exclusiva do usuário.
          </p>
        </div>

        <div className={styles.section}>
          <h2>3. Responsabilidades do Usuário</h2>
          <p>
            Ao criar uma conta, você se compromete a:
          </p>
          <ul>
            <li>Fornecer informações precisas e atualizadas;</li>
            <li>Manter a confidencialidade de sua senha e conta;</li>
            <li>Não utilizar a plataforma para qualquer finalidade ilegal ou não autorizada.</li>
          </ul>
        </div>

        <div className={styles.section}>
          <h2>4. Propriedade Intelectual</h2>
          <p>
            Todo o conteúdo presente no Orion Finanças, incluindo textos, gráficos, logotipos e software, 
            é de nossa propriedade ou licenciada para nós e é protegido por leis de direitos autorais.
          </p>
        </div>

        <div className={styles.section}>
          <h2>5. Limitação de Responsabilidade</h2>
          <p>
            O Orion Finanças não será responsável por quaisquer danos diretos ou indiretos resultantes do uso 
            ou da incapacidade de usar os serviços da plataforma.
          </p>
        </div>
      </section>
    </div>
  );
}