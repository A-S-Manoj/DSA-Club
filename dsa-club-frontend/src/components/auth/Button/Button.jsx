import styles from './Button.module.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', disabled, loading }) => (
    <button
        type={type}
        onClick={onClick}
        disabled={disabled || loading}
        className={`${styles.btn} ${styles[variant]}`}
    >
        {loading ? <span className={styles.spinner} /> : children}
    </button>
);

export default Button;