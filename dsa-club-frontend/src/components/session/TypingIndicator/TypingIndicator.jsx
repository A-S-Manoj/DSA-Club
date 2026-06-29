import styles from './TypingIndicator.module.css';

const TypingIndicator = () => (
    <div className={styles.wrapper}>
        <span className={styles.sender}>Tyler Durden</span>
        <div className={styles.indicator}>
            <span className={styles.dot} />
            <span className={styles.dot} />
            <span className={styles.dot} />
        </div>
    </div>
);

export default TypingIndicator;