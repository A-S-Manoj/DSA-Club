import { createContext, useReducer, useContext, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

const initialState = {
    user: null,
    isAuthenticated: false,
    isLoading: true
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'AUTH_LOADING':
            return { ...state, isLoading: true };
        case 'AUTH_SUCCESS':
            return { user: action.payload, isAuthenticated: true, isLoading: false };
        case 'AUTH_FAILURE':
            return { user: null, isAuthenticated: false, isLoading: false };
        case 'UPDATE_USER':
            return { ...state, user: { ...state.user, ...action.payload } };
        case 'LOGOUT':
            return { user: null, isAuthenticated: false, isLoading: false };
        default:
            return state;
    }
};

export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const user = await api.get('/auth/profile');
                dispatch({ type: 'AUTH_SUCCESS', payload: user });
            } catch (error) {
                dispatch({ type: 'AUTH_FAILURE' });
            }
        };
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, dispatch }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used inside AuthProvider');
    return context;
};