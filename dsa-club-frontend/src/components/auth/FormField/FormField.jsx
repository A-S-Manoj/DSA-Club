import styles from './FormField.module.css';

const FormField = ({ label, error, children }) => (
    <div className={styles.field}>
        {label && <label className={styles.label}>{label}</label>}
        {children}
        {error && <span className={styles.error}>{error}</span>}
    </div>
);

export default FormField;