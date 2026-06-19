import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import styles from './LandingPage.module.css';

const LandingPage = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, isLoading]);

    return (
        <div className={styles.page}>
            <nav className={styles.nav}>
                <span className={styles.logo}>DSA Club</span>
                <div className={styles.navLinks}>
                    <Link to="/login" className={styles.navLink}>Sign in</Link>
                    <Link to="/register" className={styles.navBtn}>Get started</Link>
                </div>
            </nav>

            <main className={styles.main}>
                <div className={styles.hero}>
                    <div className={styles.badge}>Powered by AI</div>
                    <h1 className={styles.heading}>
                        The first rule of DSA Club —<br />
                        <span className={styles.accent}>
                            you do not look at the solution.
                        </span>
                    </h1>
                    <p className={styles.subheading}>
                        Stop copy-pasting solutions. DSA Club guides you to the answer
                        through Socratic hints — then tests your understanding in a
                        real interview simulation.
                    </p>
                    <div className={styles.cta}>
                        <Link to="/register" className={styles.ctaPrimary}>
                            Join DSA Club
                        </Link>
                        <Link to="/login" className={styles.ctaSecondary}>
                            Sign in
                        </Link>
                    </div>
                </div>

                <div className={styles.features}>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>⚡</div>
                        <h3 className={styles.featureTitle}>Socratic Hints</h3>
                        <p className={styles.featureDesc}>
                            Tyler Durden never gives you the answer.
                            He asks the question that makes you find it yourself.
                            Hints calibrate based on how stuck you are.
                        </p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>🎙️</div>
                        <h3 className={styles.featureTitle}>Voice Interview Mode</h3>
                        <p className={styles.featureDesc}>
                            After solving, explain your solution out loud.
                            Tyler plays interviewer — asking follow-ups on complexity,
                            edge cases, and optimisation.
                        </p>
                    </div>
                    <div className={styles.feature}>
                        <div className={styles.featureIcon}>📈</div>
                        <h3 className={styles.featureTitle}>Track Your Progress</h3>
                        <p className={styles.featureDesc}>
                            Streaks, topic breakdowns, hint usage, and time spent.
                            See exactly where you are strong and where you need work.
                        </p>
                    </div>
                </div>

                <div className={styles.quote}>
                    <blockquote>
                        "This is your life and it's ending one minute at a time."
                    </blockquote>
                    <cite>— Tyler Durden</cite>
                    <p className={styles.quoteNote}>
                        Stop wasting it on solutions you did not earn.
                    </p>
                </div>
            </main>

            <footer className={styles.footer}>
                <p>© 2024 DSA Club. Built for fighters.</p>
            </footer>
        </div>
    );
};

export default LandingPage;