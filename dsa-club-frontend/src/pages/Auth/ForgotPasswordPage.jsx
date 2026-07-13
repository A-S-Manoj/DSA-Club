import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard/AuthCard';
import FormField from '../../components/auth/FormField/FormField';
import Input from '../../components/auth/Input/Input';
import Button from '../../components/auth/Button/Button';
import { api } from '../../services/api';
import styles from './Auth.module.css';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!email) {
            setError('Email is required');
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            setSent(true);
        } catch {
            setSent(true);
            // always show success — prevent enumeration
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <AuthCard
                title="Check your email"
                subtitle="If that email is registered you will receive a reset link shortly."
            >
                <p className={styles.switchAuth}>
                    <Link to="/login">Back to sign in</Link>
                </p>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Forgot password"
            subtitle="Enter your email and we will send a reset link."
        >
            <FormField label="Email" error={error}>
                <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                />
            </FormField>
            <Button loading={loading} onClick={handleSubmit}>
                Send reset link
            </Button>
            <p className={styles.switchAuth}>
                <Link to="/login">Back to sign in</Link>
            </p>
        </AuthCard>
    );
};

export default ForgotPasswordPage;