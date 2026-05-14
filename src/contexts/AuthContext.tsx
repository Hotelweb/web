import {
    createContext,
    useContext,
    useState,
    useEffect,
    useCallback,
    type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import type { Admin } from '../types';

interface AuthContextValue {
    admin: Admin | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<Admin | null>(null);
    const navigate = useNavigate();

    // Restore session from localStorage on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        const storedAdmin = localStorage.getItem('admin');
        if (token && storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('admin');
            }
        }
    }, []);

    const login = useCallback(
        async (email: string, password: string) => {
            const response = await apiLogin(email, password);
            localStorage.setItem('token', response.accessToken);
            localStorage.setItem('admin', JSON.stringify(response.admin));
            setAdmin(response.admin);
            navigate('/admin/dashboard');
        },
        [navigate],
    );

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        setAdmin(null);
        navigate('/admin/login');
    }, [navigate]);

    const value: AuthContextValue = {
        admin,
        isAuthenticated: admin !== null,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
