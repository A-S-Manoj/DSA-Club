import { Component } from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className={styles.page}>
                    <div className={styles.content}>
                        <div className={styles.icon}>⚠</div>
                        <h1 className={styles.title}>Something went wrong</h1>
                        <p className={styles.desc}>
                            An unexpected error occurred. Refresh the page to continue.
                        </p>
                        <button
                            className={styles.btn}
                            onClick={() => window.location.reload()}
                        >
                            Refresh page
                        </button>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;