import styles from './InterviewProgress.module.css';

const InterviewProgress = ({ questionsAsked }) => (
    <div className={styles.container}>
        <div className={styles.dots}>
            {Array.from({ length: 4 }, (_, i) => (
                <div
                    key={i}
                    className={`${styles.dot}
            ${i < questionsAsked - 1 ? styles.done : ''}
            ${i === questionsAsked - 1 ? styles.current : ''}
          `}
                >
                    {i + 1}
                </div>
            ))}
        </div>
        <span className={styles.label}>
            Question {Math.min(questionsAsked, 4)} of 4
        </span>
    </div>
);

export default InterviewProgress;