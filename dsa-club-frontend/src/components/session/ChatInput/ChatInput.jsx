import { useRef } from 'react';
import styles from './ChatInput.module.css';

const ChatInput = ({ value, onChange, onSend, disabled }) => {
    const textareaRef = useRef(null);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!disabled && value.trim()) onSend();
        }
    };

    const handleChange = (e) => {
        onChange(e.target.value);
        // auto resize
        textareaRef.current.style.height = 'auto';
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    };

    return (
        <div className={styles.container}>
            <textarea
                ref={textareaRef}
                className={styles.input}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder="Type your approach or ask a question... (Enter to send, Shift+Enter for newline)"
                rows={1}
            />
            <button
                className={styles.sendBtn}
                onClick={onSend}
                disabled={disabled || !value.trim()}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M14 8L2 2L5 8L2 14L14 8Z"
                        fill="currentColor" />
                </svg>
            </button>
        </div>
    );
};

export default ChatInput;