import styles from './FeedbackSection.module.css';

const FeedbackSection = ({ strengths, improvements }) => (
    <div className={styles.container}>
        <div className={styles.column}>
            <div className={styles.header}>
                <span className={styles.icon}>✓</span>
                <h3 className={styles.title}>Strengths</h3>
            </div>
            <ul className={styles.list}>
                {strengths?.map((item, i) => (
                    <li key={i} className={`${styles.item} ${styles.strength}`}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
        <div className={styles.column}>
            <div className={styles.header}>
                <span className={styles.icon}>→</span>
                <h3 className={styles.title}>Improvements</h3>
            </div>
            <ul className={styles.list}>
                {improvements?.map((item, i) => (
                    <li key={i} className={`${styles.item} ${styles.improvement}`}>
                        {item}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

export default FeedbackSection;