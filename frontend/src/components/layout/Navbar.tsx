import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Globe } from 'lucide-react';
import { useAuthStore } from '../../auth/store';
import { AccessibilityTools } from './AccessibilityTools';
import { UserMenu } from './UserMenu';
import { getDashboardPath } from '../../utils/roleUtils';
import { useLanguage } from '../../contexts/LanguageContext';

export const Navbar: React.FC = () => {

    const { isAuthenticated, user } = useAuthStore();
    const { language, setLanguage } = useLanguage();

    const location = useLocation();
    const isLoginPage = location.pathname === '/login';

    const toggleLanguage = () => {
        setLanguage(language === 'en' ? 'mal' : 'en');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 font-sans shadow-sm transition-all duration-300 support-[backdrop-filter]:bg-white/60">
            {/* Top Bar - Government Branding */}
            <div className="border-b border-gray-100 hidden sm:block">
                <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-1 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-4">
                            <a href="https://lsgkerala.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-90 transition-opacity">
                                <img
                                    src="/images/lsgd-govt .svg"
                                    alt="LSGD Govt of Kerala"
                                    className="h-16 w-auto"
                                />
                            </a>
                            <span className="h-8 w-px bg-gray-300/80"></span>
                            <a href="https://itmission.kerala.gov.in/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-90 transition-opacity">
                                <img
                                    src="/images/itmission25.svg"
                                    alt="KSITM"
                                    className="h-12 w-auto"
                                />
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 ml-auto text-xs font-medium text-[#193756] tracking-wide">
                        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-[#193756] focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow-xl focus:font-bold outline-none">
                            Skip to Main Content
                        </a>

                        {!isLoginPage && (
                            <button
                                onClick={toggleLanguage}
                                className={`flex items-center gap-2 transition-all hover:text-[#193756]/80 ${language === 'mal' ? 'text-[#4edb80] font-bold bg-gray-100 px-2 py-1 rounded-md' : ''}`}
                            >
                                <Globe className="h-4 w-4" />
                                <span>{language === 'en' ? 'മലയാളം' : 'English'}</span>
                            </button>
                        )}

                        <div className="opacity-70 hover:opacity-100 transition-opacity">
                            <AccessibilityTools />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Navbar */}
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    <div className="flex items-center gap-4">
                        {/* Logo Area */}
                        <a
                            href={isAuthenticated && user?.role ? getDashboardPath(user.role) : "/"}
                            className="flex items-center gap-4 group"
                        >
                            <div className="relative transition-transform hover:scale-105">
                                <img
                                    src="/images/digikeralam2.0.svg"
                                    alt="Digi Keralam 2.0"
                                    className="h-16 w-auto"
                                />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xl sm:text-2xl font-bold text-[#193756] leading-none tracking-tight">
                                    Digi Keralam 2.0
                                </span>
                                <span className="text-xs sm:text-sm text-[#4edb80] font-medium tracking-wide mt-1 uppercase opacity-90">
                                    Empowering Digital Futures
                                </span>
                            </div>
                        </a>
                    </div>

                    <div className="flex items-center gap-6">
                        {isAuthenticated ? (
                            <UserMenu />
                        ) : !isLoginPage ? (
                            <Link to="/login">
                                <Button
                                    variant="primary"
                                    size="md"
                                    className="rounded-full px-6 py-2.5 shadow-lg shadow-[#4edb80]/20 hover:shadow-[#4edb80]/40 transition-all duration-300 font-semibold text-sm backdrop-blur-sm"
                                >
                                    Login
                                </Button>
                            </Link>
                        ) : null}
                    </div>
                </div>
            </div>
        </nav>
    );
};
