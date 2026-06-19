import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { api } from '../../../services/api';
import PageLoader from '../PageLoader/PageLoader';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading, dispatch } = useAuth();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log('Checking auth...');
                const user = await api.get('/auth/profile');
                console.log('User fetched:', user);
                dispatch({ type: 'AUTH_SUCCESS', payload: user });
            } catch (error) {
                console.error('Auth check failed:', error);
                dispatch({ type: 'AUTH_FAILURE' });
            }
        };
        if (isLoading) checkAuth();
    }, []);

    if (isLoading) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;