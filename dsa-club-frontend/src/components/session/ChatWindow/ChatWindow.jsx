import { useEffect, useRef } from 'react';
import ChatMessage from '../ChatMessage/ChatMessage';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import styles from './ChatWindow.module.css';

const ChatWindow = ({ conversation, isAIResponding }) => {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation, isAIResponding]);

    return (
        <div className={styles.window}>
            {conversation.length === 0 && (
                <div className={styles.empty}>
                    <p className={styles.emptyTitle}>Tyler is watching.</p>
                    <p className={styles.emptySub}>
                        Tell him your approach. He will not give you the answer —
                        but he will make you find it.
                    </p>
                </div>
            )}
            {conversation.map((message, index) => (
                <ChatMessage key={index} message={message} />
            ))}
            {isAIResponding && <TypingIndicator />}
            <div ref={bottomRef} />
        </div>
    );
};

export default ChatWindow;