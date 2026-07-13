import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { api } from '../../../services/api';
import styles from './Navbar.module.css';

const Navbar = ({ sessionLabel, timer }) => {
    const { user, dispatch } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout');
            dispatch({ type: 'LOGOUT' });
            navigate('/login', { replace: true });
        } catch {
            showToast('Logout failed', 'error');
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={styles.nav}>
            <div className={styles.left}>
                <Link to="/dashboard" className={styles.logo}>DSA Club</Link>
                {sessionLabel && (
                    <>
                        <div className={styles.divider} />
                        <span className={styles.sessionLabel}>{sessionLabel}</span>
                    </>
                )}
            </div>

            <div className={styles.right}>
                {timer && <span className={styles.timer}>{timer}</span>}
                {!sessionLabel && (
                    <>
                        <Link
                            to="/dashboard"
                            className={`${styles.link} ${isActive('/dashboard') ? styles.active : ''}`}
                        >
                            Dashboard
                        </Link>
                        <Link
                            to="/history"
                            className={`${styles.link} ${isActive('/history') ? styles.active : ''}`}
                        >
                            History
                        </Link>
                    </>
                )}
                <div className={styles.avatar} onClick={handleLogout} title="Logout">
                    {user?.name?.charAt(0).toUpperCase()}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;