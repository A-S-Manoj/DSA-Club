import { useNavigate } from 'react-router-dom';
import styles from './NotFoundPage.module.css';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.page}>
            <div className={styles.content}>
                <div className={styles.code}>404</div>
                <h1 className={styles.title}>Page not found</h1>
                <p className={styles.desc}>
                    The first rule of DSA Club — this page does not exist.
                </p>
                <button
                    className={styles.btn}
                    onClick={() => navigate('/dashboard')}
                >
                    Go to dashboard
                </button>
            </div>
        </div>
    );
};

export default NotFoundPage;