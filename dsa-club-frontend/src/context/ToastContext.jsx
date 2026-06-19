import { createContext, useReducer, useContext } from 'react';

const ToastContext = createContext(null);

const toastReducer = (state, action) => {
    switch (action.type) {
        case 'ADD_TOAST':
            return { toasts: [...state.toasts, action.payload] };
        case 'REMOVE_TOAST':
            return { toasts: state.toasts.filter(t => t.id !== action.payload) };
        default:
            return state;
    }
};

export const ToastProvider = ({ children }) => {
    const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

    const showToast = (message, type = 'info') => {
        const id = Date.now();
        dispatch({ type: 'ADD_TOAST', payload: { id, message, type } });
        setTimeout(() => dispatch({ type: 'REMOVE_TOAST', payload: id }), 3000);
    };

    return (
        <ToastContext.Provider value={{ toasts: state.toasts, showToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast must be used inside ToastProvider');
    return context;
};