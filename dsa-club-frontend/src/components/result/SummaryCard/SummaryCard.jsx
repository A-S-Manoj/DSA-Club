import styles from './SummaryCard.module.css';

const SummaryCard = ({ summary }) => (
    <div className={styles.card}>
        <h3 className={styles.title}>Overall Assessment</h3>
        <p className={styles.text}>{summary}</p>
    </div>
);

export default SummaryCard;