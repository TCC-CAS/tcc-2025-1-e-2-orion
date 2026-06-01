import Link from 'next/link';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          
          <div className={styles.footerLinks}>
            <Link href="/userservices" className={styles.footerLink}>
              Produtos e Serviços
            </Link>
            <Link href="/contact" className={styles.footerLink}>
              Fale Conosco
            </Link>
            <Link href="/help" className={styles.footerLink}>
              Central de Atendimento
            </Link>
            <Link href="/terms" className={styles.footerLink}>
              Termos de Uso
            </Link>
            <Link href="/privacy" className={styles.footerLink}>
              Políticas de Privacidade
            </Link>
          </div>

          <span className={styles.copyright}>
            © 2026 Órion Finanças. Todos os direitos reservados.
          </span>

        </div>
      </div>
    </footer>
  );
}
