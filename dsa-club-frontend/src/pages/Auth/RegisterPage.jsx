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
import PageLoader from '../../components/shared/PageLoader/PageLoader';
import styles from './Auth.module.css';

const RegisterPage = () => {
    const navigate = useNavigate();
    const { dispatch, isAuthenticated, isLoading } = useAuth();
    const { showToast } = useToast();

    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    if (isLoading) {
        return <PageLoader />;
    }

    if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
        return null;
    }

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = 'Name is required';
        if (!form.email) newErrors.email = 'Email is required';
        if (form.password.length < 8) newErrors.password = 'Minimum 8 characters';
        if (form.password !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validate();
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            const { user } = await api.post('/auth/register', {
                name: form.name,
                email: form.email,
                password: form.password
            });
            dispatch({ type: 'AUTH_SUCCESS', payload: user });
            navigate('/dashboard', { replace: true });
        } catch (err) {
            if (err.code === 'AUTH_EMAIL_EXISTS') {
                setErrors({ email: 'Email already registered' });
            } else {
                showToast('Something went wrong. Try again.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Create account" subtitle="Join DSA Club">
            <FormField label="Name" error={errors.name}>
                <Input
                    placeholder="Your name"
                    value={form.name}
                    onChange={handleChange('name')}
                />
            </FormField>
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
                    placeholder="Min 8 characters"
                    value={form.password}
                    onChange={handleChange('password')}
                />
            </FormField>
            <FormField label="Confirm password" error={errors.confirmPassword}>
                <Input
                    type="password"
                    placeholder="Repeat password"
                    value={form.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                />
            </FormField>
            <Button loading={loading} onClick={handleSubmit}>
                Create account
            </Button>
            <div className={styles.divider}><span>or</span></div>
            <GoogleOAuthButton />
            <p className={styles.switchAuth}>
                Already have an account? <Link to="/login">Sign in</Link>
            </p>
        </AuthCard>
    );
};

export default RegisterPage;