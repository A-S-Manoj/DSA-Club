import styles from './AuthCard.module.css';

const AuthCard = ({ title, subtitle, children }) => (
    <div className={styles.container}>
        <div className={styles.card}>
            <div className={styles.header}>
                <h1 className={styles.logo}>DSA Club</h1>
                <p className={styles.tagline}>
                    The first rule of DSA Club — you do not look at the solution.
                </p>
            </div>
            <h2 className={styles.title}>{title}</h2>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            {children}
        </div>
    </div>
);

export default AuthCard;