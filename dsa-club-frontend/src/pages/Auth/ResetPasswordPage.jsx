import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import AuthCard from '../../components/auth/AuthCard/AuthCard';
import FormField from '../../components/auth/FormField/FormField';
import Input from '../../components/auth/Input/Input';
import Button from '../../components/auth/Button/Button';
import { api } from '../../services/api';
import styles from './Auth.module.css';

const ResetPasswordPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');

    const [form, setForm] = useState({ newPassword: '', confirmPassword: '' });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    if (!token) {
        return (
            <AuthCard title="Invalid link" subtitle="This reset link is invalid or has expired.">
                <p className={styles.switchAuth}>
                    <Link to="/forgot-password">Request a new link</Link>
                </p>
            </AuthCard>
        );
    }

    const handleChange = (field) => (e) => {
        setForm(prev => ({ ...prev, [field]: e.target.value }));
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async () => {
        const newErrors = {};
        if (form.newPassword.length < 8) {
            newErrors.newPassword = 'Minimum 8 characters';
        }
        if (form.newPassword !== form.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (Object.keys(newErrors).length) {
            setErrors(newErrors);
            return;
        }

        setLoading(true);
        try {
            await api.post('/auth/reset-password', {
                token,
                newPassword: form.newPassword
            });
            navigate('/login', { replace: true });
        } catch (err) {
            if (err.code === 'AUTH_TOKEN_INVALID') {
                setErrors({ general: 'Reset link is invalid or expired' });
            } else {
                setErrors({ general: 'Something went wrong. Try again.' });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthCard title="Reset password" subtitle="Choose a new password.">
            {errors.general && (
                <div className={styles.generalError}>{errors.general}</div>
            )}
            <FormField label="New password" error={errors.newPassword}>
                <Input
                    type="password"
                    placeholder="Min 8 characters"
                    value={form.newPassword}
                    onChange={handleChange('newPassword')}
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
                Reset password
            </Button>
        </AuthCard>
    );
};

export default ResetPasswordPage;