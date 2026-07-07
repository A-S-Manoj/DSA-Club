import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';
import Navbar from '../../components/shared/Navbar/Navbar';
import SessionLeftPanel from '../../components/session/SessionLeftPanel/SessionLeftPanel';
import ChatWindow from '../../components/session/ChatWindow/ChatWindow';
import SpeechInput from '../../components/interview/SpeechInput/SpeechInput';
import InterviewProgress from '../../components/interview/InterviewProgress/InterviewProgress';
import InterviewTipsModal from '../../components/interview/InterviewTipsModal/InterviewTipsModal';
import PageLoader from '../../components/shared/PageLoader/PageLoader';
import { api } from '../../services/api';
import { createRecognizer } from '../../services/speech';
import { useToast } from '../../context/ToastContext';
import styles from './InterviewPage.module.css';

// state machine states
const STATES = {
    LOADING: 'LOADING',
    TIPS: 'TIPS',
    TYLER_SPEAKING: 'TYLER_SPEAKING',
    YOUR_TURN: 'YOUR_TURN',
    LISTENING: 'LISTENING',
    PROCESSING: 'PROCESSING',
    COMPLETE: 'COMPLETE'
};

const InterviewPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [session, setSession] = useState(null);
    const [problem, setProblem] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [questionsAsked, setQuestionsAsked] = useState(0);
    const [pageState, setPageState] = useState(STATES.LOADING);
    const [tokenReady, setTokenReady] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');

    const recognizerRef = useRef(null);
    const tokenRef = useRef(null);
    const regionRef = useRef(null);

    // load session on mount
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await api.get(`/sessions/${id}`);

                if (data.status !== 'solved') {
                    showToast('Mark the problem as solved first', 'error');
                    navigate(`/sessions/${id}`);
                    return;
                }

                setSession(data);
                setProblem(data.problemId);
                setConversation(data.conversation || []);
                setPageState(STATES.TIPS);
            } catch {
                showToast('Failed to load session', 'error');
                navigate('/dashboard');
            }
        };
        fetchSession();
    }, [id]);

    // pre-fetch speech token while tips modal shows
    useEffect(() => {
        if (pageState !== STATES.TIPS) return;
        const prepareRecognizer = async () => {
            try {
                const { token, region } = await api.get(`/config/speech-token?_=${Date.now()}`);
                tokenRef.current = token;
                regionRef.current = region;
                setTokenReady(true);
            } catch (err) {
                console.error("Could not fetch speech token:", err);
                showToast('Could not initialize microphone', 'error');
            }
        };
        prepareRecognizer();
    }, [pageState]);

    // cleanup recognizer on unmount
    useEffect(() => {
        return () => {
            if (recognizerRef.current) {
                try {
                    recognizerRef.current.close();
                } catch (e) {
                    console.error("Error closing recognizer on unmount:", e);
                }
            }
        };
    }, []);

    const sendExplanation = async (explanation) => {
        setPageState(STATES.PROCESSING);

        const userMessage = {
            role: 'user',
            content: explanation,
            type: 'question',
            timestamp: new Date().toISOString()
        };
        setConversation(prev => [...prev, userMessage]);
        setLiveTranscript('');

        try {
            const data = await api.post(`/sessions/${id}/interview`, { explanation });

            setConversation(prev => [...prev, data.reply]);
            setQuestionsAsked(data.questionsAsked);

            if (data.interviewComplete) {
                setPageState(STATES.COMPLETE);
                setTimeout(() => {
                    navigate(`/sessions/${id}/result`);
                }, 2500);
            } else {
                setPageState(STATES.TYLER_SPEAKING);
                setTimeout(() => {
                    setPageState(STATES.YOUR_TURN);
                    setTimeout(() => startListening(), 1000);
                }, 1000);
            }
        } catch {
            showToast('Failed to reach Tyler. Try again.', 'error');
            setPageState(STATES.YOUR_TURN);
        }
    };

    const startListening = async () => {
        // Clean up any existing recognizer first
        if (recognizerRef.current) {
            try {
                recognizerRef.current.close();
            } catch (e) {
                console.error("Error closing existing recognizer:", e);
            }
            recognizerRef.current = null;
        }

        setPageState(STATES.LISTENING);
        setLiveTranscript('');

        try {
            const recognizer = await createRecognizer(tokenRef.current, regionRef.current);
            recognizerRef.current = recognizer;

            recognizer.recognizing = (s, e) => {
                setLiveTranscript(e.result.text);
            };

            recognizer.recognized = (s, e) => {
                if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech && e.result.text) {
                    recognizer.stopContinuousRecognitionAsync(
                        () => {
                            recognizer.close();
                            if (recognizerRef.current === recognizer) {
                                recognizerRef.current = null;
                            }
                        },
                        (err) => {
                            console.error("Error stopping recognizer:", err);
                            recognizer.close();
                            if (recognizerRef.current === recognizer) {
                                recognizerRef.current = null;
                            }
                        }
                    );
                    sendExplanation(e.result.text);
                }
            };

            recognizer.canceled = (s, e) => {
                console.error("Speech recognition canceled:", e.reason, e.errorDetails);
                // 1 corresponds to CancellationReason.Error
                if (e.reason === 1) {
                    showToast(`Speech recognition error: ${e.errorDetails || 'Connection failed'}`, 'error');
                }
            };

            recognizer.startContinuousRecognitionAsync(
                () => {
                    console.log("Speech recognition started successfully");
                },
                (err) => {
                    console.error("Failed to start continuous recognition:", err);
                    showToast("Failed to start microphone recording", "error");
                }
            );
        } catch (err) {
            console.error("Failed to initialize speech recognizer:", err);
            showToast("Failed to initialize microphone", "error");
        }
    };

    const handleManualStop = () => {
        const recognizer = recognizerRef.current;
        if (recognizer) {
            recognizer.stopContinuousRecognitionAsync(
                () => {
                    recognizer.close();
                    if (recognizerRef.current === recognizer) {
                        recognizerRef.current = null;
                    }
                },
                (err) => {
                    console.error("Error stopping recognizer manually:", err);
                    recognizer.close();
                    if (recognizerRef.current === recognizer) {
                        recognizerRef.current = null;
                    }
                }
            );
        }
        if (liveTranscript) {
            sendExplanation(liveTranscript);
        }
    };

    const handleReady = () => {
        setPageState(STATES.TYLER_SPEAKING);
        // trigger opening message
        sendExplanation("I'm ready to explain my solution");
    };

    if (!session || !problem) return <PageLoader />;

    return (
        <div className={styles.page}>
            <Navbar sessionLabel={`Interview mode · ${problem.title}`} />

            <div className={styles.body}>
                <SessionLeftPanel
                    problem={problem}
                    hintsUsed={session.hintsUsed}
                    status={session.status}
                    startedAt={session.startedAt}
                    onSolve={() => { }}
                    onAbandon={() => { }}
                />

                <div className={styles.right}>
                    {questionsAsked > 0 && (
                        <div className={styles.progressBar}>
                            <InterviewProgress questionsAsked={questionsAsked} />
                        </div>
                    )}

                    <ChatWindow
                        conversation={conversation}
                        isAIResponding={pageState === STATES.PROCESSING}
                    />

                    {[STATES.YOUR_TURN, STATES.LISTENING, STATES.PROCESSING].includes(pageState) && (
                        <SpeechInput
                            state={pageState}
                            liveTranscript={liveTranscript}
                            onManualStop={handleManualStop}
                        />
                    )}

                    {pageState === STATES.COMPLETE && (
                        <div className={styles.completeBar}>
                            Interview complete — preparing your results...
                        </div>
                    )}
                </div>
            </div>

            <InterviewTipsModal
                isOpen={pageState === STATES.TIPS}
                onReady={handleReady}
                tokenReady={tokenReady}
            />
        </div>
    );
};

export default InterviewPage;
