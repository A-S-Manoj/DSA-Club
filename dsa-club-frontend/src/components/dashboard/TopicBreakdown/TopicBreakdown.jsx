import styles from './TopicBreakdown.module.css';

const TopicBreakdown = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return (
            <div className={styles.card}>
                <div className={styles.title}>Topic breakdown</div>
                <div className={styles.empty}>No data yet</div>
            </div>
        );
    }

    const max = Math.max(...Object.values(data));
    const sorted = Object.entries(data).sort((a, b) => b[1] - a[1]);

    return (
        <div className={styles.card}>
            <div className={styles.title}>Topic breakdown</div>
            <div className={styles.list}>
                {sorted.map(([topic, count]) => (
                    <div key={topic} className={styles.row}>
                        <span className={styles.label}>{topic}</span>
                        <div className={styles.track}>
                            <div
                                className={styles.fill}
                                style={{ width: `${(count / max) * 100}%` }}
                            />
                        </div>
                        <span className={styles.count}>{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopicBreakdown;