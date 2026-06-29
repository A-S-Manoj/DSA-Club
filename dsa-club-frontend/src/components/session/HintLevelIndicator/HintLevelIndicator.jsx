import styles from './HintLevelIndicator.module.css';

const LEVELS = [
    { max: 0, label: 'Start your approach' },
    { max: 2, label: 'Broad direction' },
    { max: 4, label: 'Getting more specific' },
    { max: 99, label: 'Algorithm revealed' }
];

const getLevel = (hintsUsed) => {
    if (hintsUsed === 0) return { filled: 0, label: LEVELS[0].label };
    if (hintsUsed <= 2) return { filled: 2, label: LEVELS[1].label };
    if (hintsUsed <= 4) return { filled: 3, label: LEVELS[2].label };
    return { filled: 5, label: LEVELS[3].label };
};

const HintLevelIndicator = ({ hintsUsed }) => {
    const { filled, label } = getLevel(hintsUsed);

    return (
        <div className={styles.container}>
            <div className={styles.dots}>
                {Array.from({ length: 5 }, (_, i) => (
                    <div
                        key={i}
                        className={`${styles.dot}
              ${i < filled ? styles.filled : ''}
              ${i === filled && filled < 5 ? styles.current : ''}
            `}
                    />
                ))}
            </div>
            <span className={styles.label}>{label}</span>
        </div>
    );
};

export default HintLevelIndicator;