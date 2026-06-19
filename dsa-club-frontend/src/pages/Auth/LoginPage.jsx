import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard/AuthCard';
import FormField from '../../components/auth/FormField/FormField';
import Input from '../../components/auth/Input/Input';
import Button from '../../components/auth/Button/Button';
import GoogleOAuthButton from '../../components/auth/GoogleOAuthButton/GoogleOAuthButton';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import styles from './Auth.module.css';

const LoginPage = () => {
    const navigate = useNavigate();
    const { dispatch, isAuthenticated } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (!form.email) newErrors.email = 'Email is required';
        if (!form.password) newErrors.password = 'Password is required';
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const { user } = await api.post('/auth/login', form);
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            if (err.code === 'AUTH_INVALID_CREDENTIALS') {
                setErrors({ general: 'Incorrect email or password' });
            } else if (err.code === 'RATE_LIMIT_EXCEEDED') {
                setErrors({ general: 'Too many attempts. Try again later.' });
            } else {
                showToast('Something went wrong. Try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Welcome back" subtitle="Sign in to continue">
            {errors.general && (
                <div className={styles.generalError}>{errors.general}</div>
            )}
            <FormField label="Email" error={errors.email}>
                <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange('email')}
                />
            </FormField>
            <FormField label="Password" error={errors.password}>
                <Input
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange('password')}
                />
            </FormField>
            <div className={styles.forgot}>
                <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <Button loading={loading} onClick={handleSubmit}>
                Sign in
            </Button>
            <div className={styles.divider}><span>or</span></div>
            <GoogleOAuthButton />
            <p className={styles.switchAuth}>
                No account? <Link to="/register">Sign up</Link>
            </p>
        </AuthCard>
    );
};

export default LoginPage;