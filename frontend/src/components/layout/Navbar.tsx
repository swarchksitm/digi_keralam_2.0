import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Globe, LogOut } from 'lucide-react';
import { useAuthStore } from '../../auth/store';

export const Navbar: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, logout, user } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center gap-3">
                        {/* Placeholder for Logo */}
                        <div className="h-8 w-8 bg-primary-600 rounded-md flex items-center justify-center text-white font-bold">DK</div>
                        <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight hover:text-primary-600 transition-colors">
                            Digi Keralam 2.0
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium">
                            <Globe className="h-4 w-4" />
                            <span>English / മലയാളം</span>
                        </button>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-4 pl-4 border-l border-gray-200">
                                <div className="hidden md:flex flex-col items-end mr-2">
                                    <span className="text-sm font-semibold text-gray-900 leading-none">
                                        {user?.first_name} {user?.last_name || user?.username}
                                    </span>
                                    <span className="text-xs text-gray-500 mt-1 capitalize">
                                        {user?.role?.replace(/_/g, ' ').toLowerCase()}
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleLogout}
                                    className="gap-2"
                                >
                                    <LogOut className="h-4 w-4" />
                                    <span className="hidden sm:inline">Logout</span>
                                </Button>
                            </div>
                        ) : (
                            <Link to="/login">
                                <Button variant="primary" size="sm">Login</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
