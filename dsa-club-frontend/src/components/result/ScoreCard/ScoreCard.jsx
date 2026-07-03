import styles from './ScoreCard.module.css';

const ScoreCard = ({ clarityScore, technicalScore }) => {
    const getColor = (score) => {
        if (score >= 8) return styles.high;
        if (score >= 5) return styles.mid;
        return styles.low;
    };

    return (
        <div className={styles.container}>
            <div className={styles.score}>
                <div className={`${styles.circle} ${getColor(clarityScore)}`}>
                    <span className={styles.number}>{clarityScore}</span>
                    <span className={styles.outOf}>/10</span>
                </div>
                <span className={styles.label}>Clarity</span>
            </div>
            <div className={styles.divider} />
            <div className={styles.score}>
                <div className={`${styles.circle} ${getColor(technicalScore)}`}>
                    <span className={styles.number}>{technicalScore}</span>
                    <span className={styles.outOf}>/10</span>
                </div>
                <span className={styles.label}>Technical</span>
            </div>
        </div>
    );
};

export default ScoreCard;