import { useNavigate } from 'react-router-dom';
import styles from './ResultActions.module.css';

const ResultActions = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.container}>
            <button
                className={styles.primary}
                onClick={() => navigate('/problems/new')}
            >
                Try another problem
            </button>
            <button
                className={styles.secondary}
                onClick={() => navigate('/dashboard')}
            >
                Go to dashboard
            </button>
        </div>
    );
};

export default ResultActions;