import DifficultyBadge from '../../shared/DifficultyBadge/DifficultyBadge';
import styles from './SessionSummary.module.css';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m === 0) return `${s}s`;
    return `${m}m ${s}s`;
};

const SessionSummary = ({ problem, hintsUsed, timeSpentSeconds }) => (
    <div className={styles.container}>
        <div className={styles.problem}>
            <span className={styles.problemTitle}>{problem?.title}</span>
            {problem?.difficulty && (
                <DifficultyBadge difficulty={problem.difficulty} />
            )}
        </div>
        <div className={styles.stats}>
            <div className={styles.stat}>
                <span className={styles.statValue}>{hintsUsed}</span>
                <span className={styles.statLabel}>Hints used</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
                <span className={styles.statValue}>
                    {formatTime(timeSpentSeconds || 0)}
                </span>
                <span className={styles.statLabel}>Time spent</span>
            </div>
        </div>
    </div>
);

export default SessionSummary;