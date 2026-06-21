import Modal from '../../shared/Modal/Modal';
import Button from '../../auth/Button/Button';
import styles from './AlreadySolvedModal.module.css';

const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
};

const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

const AlreadySolvedModal = ({
    isOpen,
    onClose,
    solveData,
    onInterview,
    onSolveAgain
}) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className={styles.content}>
                <div className={styles.icon}>✓</div>
                <h2 className={styles.title}>Already solved</h2>
                <p className={styles.subtitle}>
                    You solved this problem on {formatDate(solveData?.solvedAt)}
                </p>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <span className={styles.statValue}>{solveData?.hintsUsed || 0}</span>
                        <span className={styles.statLabel}>Hints used</span>
                    </div>
                    <div className={styles.statDivider} />
                    <div className={styles.stat}>
                        <span className={styles.statValue}>
                            {formatTime(solveData?.timeSpentSeconds || 0)}
                        </span>
                        <span className={styles.statLabel}>Time spent</span>
                    </div>
                </div>
                <div className={styles.actions}>
                    <Button onClick={onInterview}>
                        Explain approach
                    </Button>
                    <Button variant="secondary" onClick={onSolveAgain}>
                        Solve again
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AlreadySolvedModal;