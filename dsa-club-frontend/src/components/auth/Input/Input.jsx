import styles from './Input.module.css';

const Input = ({ type = 'text', placeholder, value, onChange, disabled }) => (
    <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={styles.input}
    />
);

export default Input;