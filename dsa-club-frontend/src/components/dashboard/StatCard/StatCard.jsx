import styles from './StatCard.module.css';

const StatCard = ({ label, value, sub, accent }) => (
    <div className={styles.card}>
        <div className={styles.label}>{label}</div>
        <div className={`${styles.value} ${accent ? styles.accent : ''}`}>
            {value}
        </div>
        {sub && <div className={styles.sub}>{sub}</div>}
    </div>
);

export default StatCard;