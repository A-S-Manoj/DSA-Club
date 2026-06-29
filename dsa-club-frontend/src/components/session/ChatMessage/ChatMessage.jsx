import styles from './ChatMessage.module.css';

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
};

const ChatMessage = ({ message }) => {
    const isUser = message.role === 'user';

    return (
        <div className={`${styles.wrapper} ${isUser ? styles.user : styles.assistant}`}>
            <div className={styles.sender}>
                {isUser ? 'You' : 'Tyler Durden'}
            </div>
            <div className={`${styles.bubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
                {message.content}
            </div>
            <div className={styles.meta}>
                <span className={styles.time}>{formatTime(message.timestamp)}</span>
                {!isUser && message.type === 'hint' && (
                    <span className={styles.hintBadge}>hint</span>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;