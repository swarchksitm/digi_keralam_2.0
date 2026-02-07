import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AccessibilityState {
    fontSize: number; // Percentage (e.g., 100, 110, 120)
    theme: 'normal' | 'dark' | 'high-contrast';
    increaseFont: () => void;
    decreaseFont: () => void;
    resetFont: () => void;
    setTheme: (theme: 'normal' | 'dark' | 'high-contrast') => void;
    resetAll: () => void;
}

export const useAccessibilityStore = create<AccessibilityState>()(
    persist(
        (set) => ({
            fontSize: 100,
            theme: 'normal',
            increaseFont: () => set((state) => ({
                fontSize: Math.min(state.fontSize + 10, 150) // Max 150%
            })),
            decreaseFont: () => set((state) => ({
                fontSize: Math.max(state.fontSize - 10, 80) // Min 80%
            })),
            resetFont: () => set({ fontSize: 100 }),
            setTheme: (theme) => set({ theme }),
            resetAll: () => set({ fontSize: 100, theme: 'normal' }),
        }),
        {
            name: 'accessibility-storage',
        }
    )
);
