import styles from './DifficultyBreakdown.module.css';

const DifficultyBreakdown = ({ data }) => {
    const easy = data?.easy || 0;
    const medium = data?.medium || 0;
    const hard = data?.hard || 0;
    const total = easy + medium + hard;

    return (
        <div className={styles.card}>
            <div className={styles.title}>Difficulty breakdown</div>
            <div className={styles.pills}>
                <div className={`${styles.pill} ${styles.easy}`}>
                    <span className={styles.pillCount}>{easy}</span>
                    <span className={styles.pillLabel}>Easy</span>
                </div>
                <div className={`${styles.pill} ${styles.medium}`}>
                    <span className={styles.pillCount}>{medium}</span>
                    <span className={styles.pillLabel}>Medium</span>
                </div>
                <div className={`${styles.pill} ${styles.hard}`}>
                    <span className={styles.pillCount}>{hard}</span>
                    <span className={styles.pillLabel}>Hard</span>
                </div>
            </div>
            {total > 0 && (
                <div className={styles.bar}>
                    <div className={styles.easy} style={{ width: `${(easy / total) * 100}%` }} />
                    <div className={styles.medium} style={{ width: `${(medium / total) * 100}%` }} />
                    <div className={styles.hard} style={{ width: `${(hard / total) * 100}%` }} />
                </div>
            )}
            <div className={styles.total}>{total} problems solved total</div>
        </div>
    );
};

export default DifficultyBreakdown;