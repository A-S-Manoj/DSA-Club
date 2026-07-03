import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar/Navbar';
import ScoreCard from '../../components/result/ScoreCard/ScoreCard';
import FeedbackSection from '../../components/result/FeedbackSection/FeedbackSection';
import SummaryCard from '../../components/result/SummaryCard/SummaryCard';
import SessionSummary from '../../components/result/SessionSummary/SessionSummary';
import ResultActions from '../../components/result/ResultActions/ResultActions';
import PageLoader from '../../components/shared/PageLoader/PageLoader';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from './ResultPage.module.css';

const ResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [session, setSession] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSession = async () => {
            try {
                const data = await api.get(`/sessions/${id}`);

                // must be solved to have result
                if (data.status !== 'solved') {
                    navigate(`/sessions/${id}`);
                    return;
                }

                // must have feedback
                if (!data.interviewFeedback?.clarityScore) {
                    showToast('Complete the interview first', 'error');
                    navigate(`/sessions/${id}/interview`);
                    return;
                }

                setSession(data);
            } catch {
                showToast('Failed to load results', 'error');
                navigate('/dashboard');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSession();
    }, [id]);

    if (isLoading) return <PageLoader />;
    if (!session) return null;

    const { interviewFeedback, problemId, hintsUsed, timeSpentSeconds } = session;

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Session complete</h1>
                    <p className={styles.subtitle}>
                        Here is how Tyler Durden scored your performance.
                    </p>
                </div>

                <ScoreCard
                    clarityScore={interviewFeedback.clarityScore}
                    technicalScore={interviewFeedback.technicalScore}
                />

                <SessionSummary
                    problem={problemId}
                    hintsUsed={hintsUsed}
                    timeSpentSeconds={timeSpentSeconds}
                />

                <FeedbackSection
                    strengths={interviewFeedback.strengths}
                    improvements={interviewFeedback.improvements}
                />

                <SummaryCard summary={interviewFeedback.summary} />

                <ResultActions />
            </main>
        </div>
    );
};

export default ResultPage;
