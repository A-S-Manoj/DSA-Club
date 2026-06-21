import DifficultyBadge from '../../shared/DifficultyBadge/DifficultyBadge';
import TopicBadge from '../../shared/TopicBadge/TopicBadge';
import Button from '../../auth/Button/Button';
import styles from './ProblemPreview.module.css';

const ProblemPreview = ({ problem, onConfirm, onBack, loading }) => {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>{problem.title}</h3>
                <div className={styles.badges}>
                    <DifficultyBadge difficulty={problem.difficulty} />
                    {problem.topic && <TopicBadge topic={problem.topic} />}
                </div>
            </div>
            <div className={styles.description}>
                {problem.description.slice(0, 300)}
                {problem.description.length > 300 && '...'}
            </div>
            {problem.url && (
                <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.link}
                >
                    View original problem →
                </a>
            )}
            <div className={styles.actions}>
                <Button onClick={onConfirm} loading={loading}>
                    Start session
                </Button>
                <Button variant="secondary" onClick={onBack}>
                    Back
                </Button>
            </div>
        </div>
    );
};

export default ProblemPreview;