import { useState, useEffect } from 'react';
import Navbar from '../../components/shared/Navbar/Navbar';
import SessionRow from '../../components/dashboard/SessionRow/SessionRow';
import EmptyState from '../../components/shared/EmptyState/EmptyState';
import Pagination from '../../components/shared/Pagination/Pagination';
import PageLoader from '../../components/shared/PageLoader/PageLoader';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from './HistoryPage.module.css';

const STATUSES = ['all', 'solved', 'in_progress', 'abandoned'];
const TOPICS = [
    'all', 'arrays', 'strings', 'linked-lists', 'trees', 'graphs',
    'dynamic-programming', 'backtracking', 'binary-search',
    'stack-queue', 'heap', 'greedy', 'other'
];

const HistoryPage = () => {
    const { showToast } = useToast();

    const [sessions, setSessions] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);

    const [statusFilter, setStatusFilter] = useState('all');
    const [topicFilter, setTopicFilter] = useState('all');

    const LIMIT = 10;

    useEffect(() => {
        const fetchSessions = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                params.append('limit', LIMIT);
                params.append('page', page);
                if (statusFilter !== 'all') params.append('status', statusFilter);
                if (topicFilter !== 'all') params.append('topic', topicFilter);

                const data = await api.get(`/sessions?${params.toString()}`);
                setSessions(data.sessions);
                setTotal(data.total);
                setTotalPages(data.totalPages);
            } catch {
                showToast('Failed to load history', 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchSessions();
    }, [page, statusFilter, topicFilter, showToast]);

    const handleStatusChange = (status) => {
        setStatusFilter(status);
        setPage(1);
    };

    const handleTopicChange = (e) => {
        setTopicFilter(e.target.value);
        setPage(1);
    };

    const handlePageChange = (newPage) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.header}>
                    <h1 className={styles.title}>History</h1>
                    <p className={styles.subtitle}>{total} sessions total</p>
                </div>

                <div className={styles.filters}>
                    <div className={styles.statusTabs}>
                        {STATUSES.map(s => (
                            <button
                                key={s}
                                className={`${styles.tab} ${statusFilter === s ? styles.activeTab : ''}`}
                                onClick={() => handleStatusChange(s)}
                            >
                                {s === 'all' ? 'All' :
                                    s === 'in_progress' ? 'In progress' :
                                        s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>

                    <select
                        className={styles.topicSelect}
                        value={topicFilter}
                        onChange={handleTopicChange}
                    >
                        {TOPICS.map(t => (
                            <option key={t} value={t}>
                                {t === 'all' ? 'All topics' :
                                    t.charAt(0).toUpperCase() + t.slice(1)}
                            </option>
                        ))}
                    </select>
                </div>

                {isLoading ? (
                    <PageLoader />
                ) : sessions.length === 0 ? (
                    <EmptyState
                        message={
                            statusFilter !== 'all' || topicFilter !== 'all'
                                ? 'No sessions match your filters.'
                                : 'No sessions yet. Start your first problem.'
                        }
                        ctaLabel={
                            statusFilter !== 'all' || topicFilter !== 'all'
                                ? null
                                : 'Add a problem'
                        }
                        ctaPath="/problems/new"
                    />
                ) : (
                    <>
                        <div className={styles.list}>
                            {sessions.map(session => (
                                <SessionRow key={session._id} session={session} />
                            ))}
                        </div>
                        <Pagination
                            page={page}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </>
                )}
            </main>
        </div>
    );
};

export default HistoryPage;
