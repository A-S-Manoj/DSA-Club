import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import PageLoader from '../PageLoader/PageLoader';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) return <PageLoader />;
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return children;
};

export default ProtectedRoute;