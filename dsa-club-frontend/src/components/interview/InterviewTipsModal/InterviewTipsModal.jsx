import Modal from '../../shared/Modal/Modal';
import Button from '../../auth/Button/Button';
import styles from './InterviewTipsModal.module.css';

const InterviewTipsModal = ({ isOpen, onReady, tokenReady }) => (
    <Modal isOpen={isOpen} onClose={() => { }}>
        <div className={styles.content}>
            <div className={styles.badge}>Interview mode</div>
            <h2 className={styles.title}>Before you start</h2>
            <ul className={styles.tips}>
                <li>Tyler will ask you to walk through your solution out loud</li>
                <li>After each response he will ask one follow-up question</li>
                <li>The mic activates automatically — just start speaking</li>
                <li>A 3 second pause sends your response automatically</li>
                <li>Speak clearly — this simulates a real interview</li>
            </ul>
            <Button onClick={onReady} disabled={!tokenReady}>
                {tokenReady ? "I'm ready" : 'Preparing...'}
            </Button>
        </div>
    </Modal>
);

export default InterviewTipsModal;