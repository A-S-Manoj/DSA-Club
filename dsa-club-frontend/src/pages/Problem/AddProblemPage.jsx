import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar/Navbar';
import FormField from '../../components/auth/FormField/FormField';
import Input from '../../components/auth/Input/Input';
import Button from '../../components/auth/Button/Button';
import ProblemPreview from '../../components/problem/ProblemPreview/ProblemPreview';
import AlreadySolvedModal from '../../components/problem/AlreadySolvedModal/AlreadySolvedModal';
import { api } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import styles from './AddProblemPage.module.css';

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SOURCES = ['leetcode', 'gfg', 'manual'];

const AddProblemPage = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [activeTab, setActiveTab] = useState('manual');
    const [loading, setLoading] = useState(false);
    const [preview, setPreview] = useState(null);

    // manual form
    const [form, setForm] = useState({
        title: '',
        description: '',
        difficulty: 'medium',
        source: 'leetcode',
        url: ''
    });
    const [errors, setErrors] = useState({});

    // already solved modal
    const [modalOpen, setModalOpen] = useState(false);
    const [solveData, setSolveData] = useState(null);
    const [savedProblemId, setSavedProblemId] = useState(null);

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.title.trim()) newErrors.title = 'Title is required';
        if (!form.description.trim()) newErrors.description = 'Description is required';
        return newErrors;
    };

    const handleManualPreview = () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }
        setPreview(form);
    };

    const startSession = async (problemId, mode = 'hint') => {
        try {
            const session = await api.post('/sessions', { problemId, mode });
            navigate(`/sessions/${session._id}`);
        } catch (err) {
            if (err.code === 'SESSION_ALREADY_SOLVED') {
                setSolveData(err.data);
                setSavedProblemId(problemId);
                setModalOpen(true);
            } else {
                showToast('Failed to start session', 'error');
            }
        }
    };

    const handleConfirm = async () => {
        setLoading(true);
        try {
            const problem = await api.post('/problems', {
                title: preview.title,
                description: preview.description,
                difficulty: preview.difficulty,
                source: preview.source,
                url: preview.url || null
            });
            await startSession(problem._id);
        } catch (err) {
            if (err.code === 'SESSION_ALREADY_SOLVED') {
                setSolveData(err.data);
                setModalOpen(true);
            } else {
                showToast('Failed to save problem', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleInterview = async () => {
        setModalOpen(false);
        try {
            const session = await api.post('/sessions', {
                problemId: savedProblemId,
                mode: 'interview'
            });
            navigate(`/sessions/${session._id}/interview`);
        } catch {
            showToast('Failed to start interview session', 'error');
        }
    };

    const handleSolveAgain = async () => {
        setModalOpen(false);
        try {
            const session = await api.post('/sessions', {
                problemId: savedProblemId,
                mode: 'hint'
            });
            navigate(`/sessions/${session._id}`);
        } catch {
            showToast('Failed to start session', 'error');
        }
    };

    return (
        <div className={styles.page}>
            <Navbar />
            <main className={styles.main}>
                <div className={styles.card}>
                    <h1 className={styles.title}>Add a problem</h1>
                    <p className={styles.subtitle}>
                        Paste a problem from LeetCode, GFG, or enter it manually.
                    </p>

                    {!preview ? (
                        <>
                            <div className={styles.tabs}>
                                <button
                                    className={`${styles.tab} ${activeTab === 'manual' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab('manual')}
                                >
                                    Manual entry
                                </button>
                                <button
                                    className={`${styles.tab} ${activeTab === 'paste' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveTab('paste')}
                                >
                                    Paste problem
                                </button>
                            </div>

                            {activeTab === 'manual' && (
                                <div className={styles.form}>
                                    <FormField label="Problem title" error={errors.title}>
                                        <Input
                                            placeholder="e.g. Two Sum"
                                            value={form.title}
                                            onChange={handleChange('title')}
                                        />
                                    </FormField>

                                    <FormField label="Description" error={errors.description}>
                                        <textarea
                                            className={styles.textarea}
                                            placeholder="Paste the full problem description here..."
                                            value={form.description}
                                            onChange={handleChange('description')}
                                            rows={6}
                                        />
                                    </FormField>

                                    <div className={styles.row}>
                                        <FormField label="Difficulty">
                                            <select
                                                className={styles.select}
                                                value={form.difficulty}
                                                onChange={handleChange('difficulty')}
                                            >
                                                {DIFFICULTIES.map(d => (
                                                    <option key={d} value={d}>
                                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>

                                        <FormField label="Source">
                                            <select
                                                className={styles.select}
                                                value={form.source}
                                                onChange={handleChange('source')}
                                            >
                                                {SOURCES.map(s => (
                                                    <option key={s} value={s}>
                                                        {s.toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>
                                    </div>

                                    <FormField label="Problem URL (optional)">
                                        <Input
                                            placeholder="https://leetcode.com/problems/two-sum/"
                                            value={form.url}
                                            onChange={handleChange('url')}
                                        />
                                    </FormField>

                                    <Button onClick={handleManualPreview}>
                                        Preview problem
                                    </Button>
                                </div>
                            )}

                            {activeTab === 'paste' && (
                                <div className={styles.form}>
                                    <FormField label="Problem title" error={errors.title}>
                                        <Input
                                            placeholder="e.g. Two Sum"
                                            value={form.title}
                                            onChange={handleChange('title')}
                                        />
                                    </FormField>

                                    <FormField label="Paste problem description" error={errors.description}>
                                        <textarea
                                            className={styles.textarea}
                                            placeholder="Copy the full problem text from LeetCode or GFG and paste here..."
                                            value={form.description}
                                            onChange={handleChange('description')}
                                            rows={8}
                                        />
                                    </FormField>

                                    <div className={styles.row}>
                                        <FormField label="Difficulty">
                                            <select
                                                className={styles.select}
                                                value={form.difficulty}
                                                onChange={handleChange('difficulty')}
                                            >
                                                {DIFFICULTIES.map(d => (
                                                    <option key={d} value={d}>
                                                        {d.charAt(0).toUpperCase() + d.slice(1)}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>

                                        <FormField label="Source">
                                            <select
                                                className={styles.select}
                                                value={form.source}
                                                onChange={handleChange('source')}
                                            >
                                                {SOURCES.map(s => (
                                                    <option key={s} value={s}>
                                                        {s.toUpperCase()}
                                                    </option>
                                                ))}
                                            </select>
                                        </FormField>
                                    </div>

                                    <FormField label="Problem URL (optional)">
                                        <Input
                                            placeholder="https://leetcode.com/problems/two-sum/"
                                            value={form.url}
                                            onChange={handleChange('url')}
                                        />
                                    </FormField>

                                    <Button onClick={handleManualPreview}>
                                        Preview problem
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : (
                        <ProblemPreview
                            problem={preview}
                            onConfirm={handleConfirm}
                            onBack={() => setPreview(null)}
                            loading={loading}
                        />
                    )}
                </div>
            </main>

            <AlreadySolvedModal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                solveData={solveData}
                onInterview={handleInterview}
                onSolveAgain={handleSolveAgain}
            />
        </div>
    );
};

export default AddProblemPage;