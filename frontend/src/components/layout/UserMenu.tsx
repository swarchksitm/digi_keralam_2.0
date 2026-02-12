import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import { LogOut, User, LayoutDashboard, ChevronDown } from 'lucide-react';

export const UserMenu: React.FC = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getDashboardPath = (role?: string) => {
        switch (role) {
            case 'KSITM_SUPER_ADMIN':
            case 'LSGD_STATE_ADMIN':
                return '/admin/dashboard';
            case 'LSGD_DISTRICT_ADMIN':
            case 'DISTRICT_MASTER_TRAINER':
                return '/district/dashboard';
            case 'LSGI_FIELD_TRAINER':
                return '/trainer/dashboard';
            case 'CITIZEN':
                return '/citizen/dashboard';
            default:
                return '/';
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) return null;

    const getRoleLabel = () => {
        if (!user) return '';
        if (user.role === 'DISTRICT_MASTER_TRAINER') {
            const lsgiName = typeof user.profile?.lsgi === 'object' ? user.profile.lsgi?.name : '';
            return lsgiName ? `${lsgiName} MASTER TRAINER` : 'LSGI MASTER TRAINER';
        }
        if (user.role === 'LSGI_ADMIN') {
            const lsgiName = typeof user.profile?.lsgi === 'object' ? user.profile.lsgi?.name : '';
            return lsgiName ? `${lsgiName} ADMIN` : 'LSGI ADMIN';
        }
        return user.role?.replace(/_/g, ' ');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 pl-4 border-l border-gray-200 ml-2 focus:outline-none group"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <div className="hidden md:flex flex-col items-end mr-1 text-right">
                    <span className="text-sm font-bold text-gray-900 leading-none group-hover:text-primary-700 transition-colors">
                        {user.first_name} {user.last_name || user.username}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-primary-600 mt-1 font-semibold">
                        {getRoleLabel()}
                    </span>
                </div>
                <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold group-hover:bg-primary-200 transition-colors">
                    {user.first_name?.charAt(0) || user.username.charAt(0)}
                </div>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50 transform origin-top-right transition-all">
                    <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                        <p className="text-sm text-gray-500">Signed in as</p>
                        <p className="text-sm font-bold text-gray-900 truncate">{user.username}</p>
                    </div>

                    <div className="py-1">
                        {!location.pathname.includes('dashboard') && (
                            <Link
                                to={getDashboardPath(user.role)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-700"
                                onClick={() => setIsOpen(false)}
                            >
                                <LayoutDashboard className="h-4 w-4" />
                                My Dashboard
                            </Link>
                        )}
                        <Link
                            to="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-700"
                            onClick={() => setIsOpen(false)}
                        >
                            <User className="h-4 w-4" />
                            My Profile
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 py-1">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign out
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
