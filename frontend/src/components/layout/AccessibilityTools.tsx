import React, { useEffect } from 'react';
import { useAccessibilityStore } from '../../store/accessibilityStore';
import { Moon, Eye, Monitor } from 'lucide-react';

export const AccessibilityTools: React.FC = () => {
    const {
        fontSize,
        theme,
        increaseFont,
        decreaseFont,
        resetFont,
        setTheme
    } = useAccessibilityStore();

    // Apply changes to the document
    useEffect(() => {
        // Font Size
        document.documentElement.style.fontSize = `${fontSize}%`;

        // Theme
        document.documentElement.setAttribute('data-theme', theme);

        // Backward compatibility for index.css overrides if needed, 
        // essentially data-theme replaces data-high-contrast logic
        if (theme !== 'normal') {
            document.documentElement.setAttribute('data-high-contrast', 'true');
        } else {
            document.documentElement.removeAttribute('data-high-contrast');
        }
    }, [fontSize, theme]);

    return (
        <div className="flex items-center gap-4" role="group" aria-label="Accessibility Tools">
            <div className="flex items-center gap-1">
                <button
                    onClick={decreaseFont}
                    className="p-1 hover:text-primary-700 rounded text-xs font-bold w-6 h-6 flex items-center justify-center transition-colors"
                    aria-label="Decrease Font Size"
                    title="Decrease Font Size"
                >
                    A-
                </button>
                <button
                    onClick={resetFont}
                    className="p-1 hover:text-primary-700 rounded text-xs font-bold w-6 h-6 flex items-center justify-center transition-colors"
                    aria-label="Reset Font Size"
                    title="Reset Font Size"
                >
                    A
                </button>
                <button
                    onClick={increaseFont}
                    className="p-1 hover:text-primary-700 rounded text-sm font-bold w-6 h-6 flex items-center justify-center transition-colors"
                    aria-label="Increase Font Size"
                    title="Increase Font Size"
                >
                    A+
                </button>
            </div>



            <div className="flex items-center gap-1">
                <button
                    onClick={() => setTheme('normal')}
                    className={`p-1 rounded transition-colors ${theme === 'normal' ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-200 text-gray-500'}`}
                    aria-label="Standard Theme"
                    title="Standard Theme"
                >
                    <Monitor className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setTheme('dark')}
                    className={`p-1 rounded transition-colors ${theme === 'dark' ? 'bg-gray-800 text-white' : 'hover:bg-gray-200 text-gray-500'}`}
                    aria-label="Dark Mode"
                    title="Dark Mode"
                >
                    <Moon className="h-4 w-4" />
                </button>
                <button
                    onClick={() => setTheme('high-contrast')}
                    className={`p-1 rounded transition-colors ${theme === 'high-contrast' ? 'bg-yellow-400 text-black' : 'hover:bg-gray-200 text-gray-500'}`}
                    aria-label="High Contrast / Color Blind Mode"
                    title="High Contrast / Color Blind Mode"
                >
                    <Eye className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
