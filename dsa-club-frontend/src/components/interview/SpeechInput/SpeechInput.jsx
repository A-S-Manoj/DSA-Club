import styles from './SpeechInput.module.css';

const STATE_CONFIG = {
    YOUR_TURN: { label: 'Your turn', sublabel: 'Mic activating...' },
    LISTENING: { label: 'Listening', sublabel: 'Speak now — pauses for 3s will send' },
    PROCESSING: { label: 'Processing', sublabel: 'Sending to Tyler...' }
};

const SpeechInput = ({ state, liveTranscript, onManualStop, onMicClick }) => {
    const config = STATE_CONFIG[state];

    if (!config) return null;

    return (
        <div className={styles.container}>
            {liveTranscript && (
                <div className={styles.transcript}>
                    {state === 'LISTENING' && <span className={styles.pulseDot} />}
                    {liveTranscript}
                </div>
            )}
            <div className={styles.controls}>
                <div 
                    className={`${styles.micBtn} ${state === 'LISTENING' ? styles.recording : ''}`}
                    onClick={onMicClick}
                    style={{ cursor: onMicClick ? 'pointer' : 'default' }}
                >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <rect x="7" y="2" width="6" height="11" rx="3" fill="currentColor" />
                        <path d="M4 9v1a6 6 0 0012 0V9M10 16v2"
                            stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                </div>
                <div className={styles.statusText}>
                    <span className={state === 'LISTENING' ? styles.activeLabel : styles.label}>
                        {config.label}
                    </span>
                    <span className={styles.sublabel}>{config.sublabel}</span>
                </div>
                {state === 'LISTENING' && (
                    <button className={styles.stopBtn} onClick={onManualStop}>
                        Send now
                    </button>
                )}
            </div>
        </div>
    );
};

export default SpeechInput;