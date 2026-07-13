import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar/Navbar';
import SessionLeftPanel from '../../components/session/SessionLeftPanel/SessionLeftPanel';
import ChatWindow from '../../components/session/ChatWindow/ChatWindow';
import ChatInput from '../../components/session/ChatInput/ChatInput';
import PageLoader from '../../components/shared/PageLoader/PageLoader';
import Modal from '../../components/shared/Modal/Modal';
import Button from '../../components/auth/Button/Button';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from './SessionPage.module.css';

const SessionPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [session, setSession] = useState(null);
    const [problem, setProblem] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isAIResponding, setIsAIResponding] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [solveModalOpen, setSolveModalOpen] = useState(false);
    const [abandonModalOpen, setAbandonModalOpen] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await api.get(`/sessions/${id}`);
                setSession(data);
                setProblem(data.problemId);
                setConversation(data.conversation || []);
                setHintsUsed(data.hintsUsed || 0);
            } catch {
                showToast('Failed to load session', 'error');
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isAIResponding) return;

        const userMessage = {
            role: 'user',
            content: inputValue,
            type: 'approach',
            timestamp: new Date().toISOString()
        };

        // optimistic update
        setConversation(prev => [...prev, userMessage]);
        setInputValue('');
        setIsAIResponding(true);

        try {
            const data = await api.post(`/sessions/${id}/message`, {
                content: userMessage.content,
                type: 'approach'
            });

            setConversation(prev => [...prev, data.reply]);
            setHintsUsed(data.hintsUsed);
        } catch {
            // remove optimistic message on failure
            setConversation(prev => prev.slice(0, -1));
            showToast('Failed to get hint. Try again.', 'error');
        } finally {
            setIsAIResponding(false);
        }
    };

    const handleSolve = async () => {
        setActionLoading(true);
        try {
            await api.patch(`/sessions/${id}/status`, { status: 'solved' });
            setSolveModalOpen(false);
            navigate(`/sessions/${id}/interview`);
        } catch {
            showToast('Failed to mark as solved', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAbandon = async () => {
        setActionLoading(true);
        try {
            await api.patch(`/sessions/${id}/status`, { status: 'abandoned' });
            navigate('/dashboard');
        } catch {
            showToast('Failed to abandon session', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    if (isLoading) return <PageLoader />;

    return (
        <div className={styles.page}>
            <Navbar
                sessionLabel={`Hint session · ${session?.status === 'in_progress' ? 'active' : session?.status}`}
            />

            <div className={styles.body}>
                <SessionLeftPanel
                    problem={problem}
                    hintsUsed={hintsUsed}
                    status={session?.status}
                    startedAt={session?.startedAt}
                    onSolve={() => setSolveModalOpen(true)}
                    onAbandon={() => setAbandonModalOpen(true)}
                />

                <div className={styles.right}>
                    <ChatWindow
                        conversation={conversation}
                        isAIResponding={isAIResponding}
                    />
                    <ChatInput
                        value={inputValue}
                        onChange={setInputValue}
                        onSend={handleSendMessage}
                        disabled={isAIResponding || session?.status !== 'in_progress'}
                    />
                </div>
            </div>

            {/* Solve confirmation modal */}
            <Modal isOpen={solveModalOpen} onClose={() => setSolveModalOpen(false)}>
                <div className={styles.modalContent}>
                    <h2 className={styles.modalTitle}>Mark as solved?</h2>
                    <p className={styles.modalDesc}>
                        This will end your hint session and take you to interview practice
                        with Tyler Durden.
                    </p>
                    <div className={styles.modalActions}>
                        <Button onClick={handleSolve} loading={actionLoading}>
                            Yes, I solved it
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setSolveModalOpen(false)}
                        >
                            Not yet
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Abandon confirmation modal */}
            <Modal isOpen={abandonModalOpen} onClose={() => setAbandonModalOpen(false)}>
                <div className={styles.modalContent}>
                    <h2 className={styles.modalTitle}>Abandon session?</h2>
                    <p className={styles.modalDesc}>
                        Your progress will be saved but this session will be marked
                        as abandoned.
                    </p>
                    <div className={styles.modalActions}>
                        <Button
                            variant="danger"
                            onClick={handleAbandon}
                            loading={actionLoading}
                        >
                            Abandon
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => setAbandonModalOpen(false)}
                        >
                            Keep going
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default SessionPage;
