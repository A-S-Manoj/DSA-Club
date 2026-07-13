import styles from './TopicBadge.module.css';

const TopicBadge = ({ topic }) => (
    <span className={styles.badge}>{topic}</span>
);

export default TopicBadge;