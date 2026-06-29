import { useEffect, useState } from 'react';
import DifficultyBadge from '../../shared/DifficultyBadge/DifficultyBadge';
import TopicBadge from '../../shared/TopicBadge/TopicBadge';
import HintLevelIndicator from '../HintLevelIndicator/HintLevelIndicator';
import styles from './SessionLeftPanel.module.css';

const formatTime = (seconds) => {
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return `${m}:${s}`;
};

const SessionLeftPanel = ({
    problem,
    hintsUsed,
    status,
    startedAt,
    onSolve,
    onAbandon
}) => {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        if (status !== 'in_progress') return;
        const start = new Date(startedAt).getTime();
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - start) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startedAt, status]);

    return (
        <div className={styles.panel}>
            <div className={styles.section}>
                <div className={styles.sectionTitle}>Problem</div>
                <div className={styles.problemTitle}>{problem?.title}</div>
                <div className={styles.badges}>
                    {problem?.difficulty && (
                        <DifficultyBadge difficulty={problem.difficulty} />
                    )}
                    {problem?.topic && <TopicBadge topic={problem.topic} />}
                </div>
                {problem?.url && (
                    <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.sourceLink}
                    >
                        Open on {problem.source} →
                    </a>
                )}
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Session</div>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Hints used</span>
                    <span className={styles.statValue}>{hintsUsed}</span>
                </div>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Time elapsed</span>
                    <span className={styles.statValue}>{formatTime(elapsed)}</span>
                </div>
                <div className={styles.statRow}>
                    <span className={styles.statLabel}>Status</span>
                    <span className={`${styles.statValue} ${styles[status]}`}>
                        {status === 'in_progress' ? 'In progress' : status}
                    </span>
                </div>
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Hint level</div>
                <HintLevelIndicator hintsUsed={hintsUsed} />
            </div>

            <div className={styles.section}>
                <div className={styles.sectionTitle}>Actions</div>
                <button
                    className={styles.solveBtn}
                    onClick={onSolve}
                    disabled={status !== 'in_progress'}
                >
                    Mark as solved
                </button>
                <button
                    className={styles.abandonBtn}
                    onClick={onAbandon}
                    disabled={status !== 'in_progress'}
                >
                    Abandon session
                </button>
            </div>
        </div>
    );
};

export default SessionLeftPanel;