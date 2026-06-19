import { createContext, useReducer, useContext } from 'react';

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