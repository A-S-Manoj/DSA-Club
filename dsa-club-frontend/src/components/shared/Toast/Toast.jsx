import { useToast } from '../../../context/ToastContext';
import styles from './Toast.module.css';

const Toast = () => {
    const { toasts } = useToast();

    if (!toasts.length) return null;

    return (
        <div className={styles.container}>
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`${styles.toast} ${styles[toast.type]}`}
                >
                    {toast.message}
                </div>
            ))}
        </div>
    );
};

export default Toast;