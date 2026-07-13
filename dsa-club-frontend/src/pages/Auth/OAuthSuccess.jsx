import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import PageLoader from '../../components/shared/PageLoader/PageLoader';

const OAuthSuccess = () => {
    const navigate = useNavigate();
    const { dispatch } = useAuth();

    useEffect(() => {
        const finishOAuth = async () => {
            try {
                const user = await api.get('/auth/profile');
                dispatch({ type: 'AUTH_SUCCESS', payload: user });
                navigate('/dashboard', { replace: true });
            } catch {
                navigate('/login', { replace: true });
            }
        };
        finishOAuth();
    }, []);

    return <PageLoader />;
};

export default OAuthSuccess;