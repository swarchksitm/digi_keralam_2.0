import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type Language = 'en' | 'mal';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

import { translations } from '../utils/translations';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
    const [language, setLanguage] = useState<Language>('en');

    useEffect(() => {
        if (language === 'mal') {
            document.body.classList.add('font-malayalam');
        } else {
            document.body.classList.remove('font-malayalam');
        }
    }, [language]);

    const t = (key: string): string => {
        const keys = key.split('.');

        // Helper to get value from a translation object
        const getValue = (obj: any, path: string[]) => {
            let current = obj;
            for (const k of path) {
                if (current && typeof current === 'object' && k in current) {
                    current = current[k];
                } else {
                    return undefined;
                }
            }
            return typeof current === 'string' ? current : undefined;
        };

        // 1. Try current language
        let value = getValue(translations[language], keys);
        if (value) return value;

        // 2. Fallback to English if current is not English
        if (language !== 'en') {
            value = getValue(translations['en'], keys);
            if (value) return value;
        }

        // 3. Log warning in development
        if (import.meta.env.DEV) {
            console.warn(`Missing translation key: ${key} in language: ${language}`);
        }

        // 4. Fallback to last part of key (readable format)
        // e.g., 'dashboard.create_master_trainers' -> 'Create Master Trainers'
        const lastPart = keys[keys.length - 1];
        return lastPart
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
