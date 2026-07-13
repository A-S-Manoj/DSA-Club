import styles from './Pagination.module.css';

const Pagination = ({ page, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    return (
        <div className={styles.container}>
            <button
                className={styles.btn}
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
            >
                Previous
            </button>
            <div className={styles.pages}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                        key={p}
                        className={`${styles.page} ${p === page ? styles.active : ''}`}
                        onClick={() => onPageChange(p)}
                    >
                        {p}
                    </button>
                ))}
            </div>
            <button
                className={styles.btn}
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;