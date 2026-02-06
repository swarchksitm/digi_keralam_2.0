import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    profile?: {
        district: number | null;
        block: number | null;
        lsgi: number | null;
        ward: number | null;
    };
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            login: (user, token) => {
                localStorage.setItem('token', token);
                set({ user, token, isAuthenticated: true });
            },
            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
