import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Globe } from 'lucide-react';
import { useAuthStore } from '../../auth/store';
import { AccessibilityTools } from './AccessibilityTools';
import { UserMenu } from './UserMenu';
import { getDashboardPath } from '../../utils/roleUtils';

export const Navbar: React.FC = () => {

    const { isAuthenticated, user } = useAuthStore();

    return (
        <nav className="glass sticky top-0 z-50 font-sans border-b border-white/20 transition-all duration-300">
            {/* Top Bar for Government Branding */}
            <div className="border-b border-gray-100/50 hidden sm:block bg-white/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <a href="https://kerala.gov.in/" target="_blank" rel="noopener noreferrer">
                            <img
                                src="/images/kerala-govt.svg"
                                alt="Govt of Kerala"
                                className="h-10 w-auto"
                            />
                        </a>
                        <span className="h-6 w-px bg-gray-300"></span>
                        <a href="https://itmission.kerala.gov.in/" target="_blank" rel="noopener noreferrer">
                            <img
                                src="/images/ksitm.svg"
                                alt="KSITM"
                                className="h-10 w-auto"
                            />
                        </a>
                    </div>
                    <div className="flex items-center gap-4 ml-auto text-[10px] font-medium text-gray-500">
                        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-white focus:p-4 focus:shadow-xl focus:text-primary-700 outline-none">
                            Skip to Main Content
                        </a>

                        <button className="flex items-center gap-1.5 hover:text-primary-700 transition-colors">
                            <Globe className="h-3.5 w-3.5" />
                            <span>English / മലയാളം</span>
                        </button>



                        <AccessibilityTools />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-4">
                        {/* Logo Area */}
                        <div className="flex flex-col">
                            <a
                                href={isAuthenticated && user?.role ? getDashboardPath(user.role) : "/"}
                                className="flex items-center gap-3 group"
                            >
                                <img
                                    src="/images/dk-logo.png"
                                    alt="Digi Keralam 2.0"
                                    className="h-10 w-auto"
                                />
                                <div className="flex flex-col">
                                    <span className="text-xl font-bold text-primary-900 leading-none tracking-tight group-hover:text-primary-700 transition-colors">
                                        Digi Keralam 2.0
                                    </span>
                                    <span className="text-xs text-secondary-600 font-medium tracking-wide mt-0.5">
                                        Empowering Citizens
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">


                        {isAuthenticated ? (
                            <UserMenu />
                        ) : (
                            <Link to="/login">
                                <Button variant="primary" size="md" className="rounded-full shadow-apple hover:shadow-lg transition-all duration-300">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
