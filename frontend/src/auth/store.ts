import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
    phone?: string;
    profile?: {
        district: number | { id: number; name: string } | null;
        block: number | { id: number; name: string } | null;
        lsgi: number | { id: number; name: string } | null;
        wards: (number | { id: number; name: string })[] | null;
    };
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
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
            updateProfile: async (data) => {
                // We need to import the API function. Since we can't easily add top-level imports in the middle of a file with this tool without multiple steps, 
                // I'll try to add the import in a separate step or just use the axios instance if I can't.
                // Actually, I should add the import first. But for now, let's implement the logic assuming the import exists, or using a dynamic import if needed (but that's ugly).
                // Better approach: I'll use the `api` default import which is likely already available or I can add it?
                // `client.ts` exports `default api`. `store.ts` doesn't import it yet.
                // I will add the method implementation here and then add the import in the next step.
                try {
                    const { updateUser } = await import('../api/client'); // Dynamic import to avoid messing up top of file for now, or just add import later.
                    const response = await updateUser(data);
                    set((state) => ({
                        user: { ...state.user, ...response.data } as User
                    }));
                } catch (error) {
                    console.error('Failed to update profile:', error);
                    throw error;
                }
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
        }
    )
);
