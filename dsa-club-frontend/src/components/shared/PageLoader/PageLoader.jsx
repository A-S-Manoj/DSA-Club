import styles from './PageLoader.module.css';

const PageLoader = () => (
    <div className={styles.container}>
        <div className={styles.spinner} />
    </div>
);

export default PageLoader;