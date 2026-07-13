import { useNavigate } from 'react-router-dom';
import styles from './EmptyState.module.css';

const EmptyState = ({ message, ctaLabel, ctaPath }) => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <p className={styles.message}>{message}</p>
            {ctaLabel && (
                <button
                    className={styles.cta}
                    onClick={() => navigate(ctaPath)}
                >
                    {ctaLabel}
                </button>
            )}
        </div>
    );
};

export default EmptyState;