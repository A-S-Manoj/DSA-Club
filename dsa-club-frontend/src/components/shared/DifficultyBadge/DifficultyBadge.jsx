import styles from './DifficultyBadge.module.css';

const DifficultyBadge = ({ difficulty }) => (
    <span className={`${styles.badge} ${styles[difficulty]}`}>
        {difficulty}
    </span>
);

export default DifficultyBadge;