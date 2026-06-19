import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar/Navbar';
import StatCard from '../../components/dashboard/StatCard/StatCard';
import TopicBreakdown from '../../components/dashboard/TopicBreakdown/TopicBreakdown';
import DifficultyBreakdown from '../../components/dashboard/DifficultyBreakdown/DifficultyBreakdown';
import SessionRow from '../../components/dashboard/SessionRow/SessionRow';
import EmptyState from '../../components/shared/EmptyState/EmptyState';
import PageLoader from '../../components/shared/PageLoader/PageLoader';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './DashboardPage.module.css';

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good morning';
    if (hour >= 12 && hour < 17) return 'Good afternoon';
    if (hour >= 17 && hour < 24) return 'Good evening';
    return 'Still grinding?';
};

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
};

const DashboardPage = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [stats, setStats] = useState(null);
    const [recentSessions, setRecentSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await api.get('/dashboard/stats');
                setStats(data);
                setRecentSessions(data.recentSessions || []);
            } catch {
                showToast('Failed to load dashboard', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    if (isLoading) return <PageLoader />;

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.header}>
                    <div>
                        <h1 className={styles.greeting}>
                            {getGreeting()}, {user?.name?.split(' ')[0]}
                        </h1>
                        <p className={styles.sub}>
                            {stats?.currentStreak > 0
                                ? `${stats.currentStreak} day streak — keep going.`
                                : 'Start your streak today.'}
                        </p>
                    </div>
                    <button
                        className={styles.newBtn}
                        onClick={() => navigate('/problems/new')}
                    >
                        + New problem
                    </button>
                </div>

                <div className={styles.statsGrid}>
                    <StatCard
                        label="Problems solved"
                        value={stats?.totalSolved || 0}
                    />
                    <StatCard
                        label="Current streak"
                        value={stats?.currentStreak || 0}
                        sub="days"
                        accent
                    />
                    <StatCard
                        label="Longest streak"
                        value={stats?.longestStreak || 0}
                        sub="days"
                    />
                    <StatCard
                        label="Total time"
                        value={formatTime(stats?.totalTimeSpentSeconds || 0)}
                    />
                </div>

                <div className={styles.twoCol}>
                    <TopicBreakdown data={stats?.topicBreakdown} />
                    <DifficultyBreakdown data={stats?.difficultyBreakdown} />
                </div>

                <div className={styles.recent}>
                    <div className={styles.recentHeader}>
                        <h2 className={styles.sectionTitle}>Recent sessions</h2>
                        <button
                            className={styles.seeAll}
                            onClick={() => navigate('/history')}
                        >
                            See all
                        </button>
                    </div>
                    {recentSessions.length === 0 ? (
                        <EmptyState
                            message="No sessions yet. Start your first problem."
                            ctaLabel="Add a problem"
                            ctaPath="/problems/new"
                        />
                    ) : (
                        <div className={styles.sessionList}>
                            {recentSessions.map(session => (
                                <SessionRow key={session._id} session={session} />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DashboardPage;