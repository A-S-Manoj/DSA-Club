import { useNavigate } from 'react-router-dom';
import DifficultyBadge from '../../shared/DifficultyBadge/DifficultyBadge';
import styles from './SessionRow.module.css';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

const SessionRow = ({ session }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (session.status === 'solved') {
            navigate(`/sessions/${session._id}/result`);
        } else if (session.status === 'in_progress') {
            navigate(`/sessions/${session._id}`);
        }
    };

    return (
        <div
            className={`${styles.row} ${session.status !== 'abandoned' ? styles.clickable : ''}`}
            onClick={session.status !== 'abandoned' ? handleClick : undefined}
        >
            <span className={`${styles.status} ${styles[session.status]}`}>
                {session.status === 'in_progress' ? 'In progress' : session.status}
            </span>
            <span className={styles.title}>
                {session.problemId?.title || 'Unknown problem'}
            </span>
            <div className={styles.meta}>
                {session.problemId?.difficulty && (
                    <DifficultyBadge difficulty={session.problemId.difficulty} />
                )}
                <span className={styles.metaItem}>{session.hintsUsed} hints</span>
                {session.timeSpentSeconds > 0 && (
                    <span className={styles.metaItem}>
                        {formatTime(session.timeSpentSeconds)}
                    </span>
                )}
            </div>
        </div>
    );
};

export default SessionRow;