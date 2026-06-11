
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { getDashboardPath } from '../../utils/roleUtils';
import { useLanguage } from '../../contexts/LanguageContext';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { isAuthenticated, user } = useAuthStore((state) => state);

    const { setLanguage } = useLanguage();

    React.useEffect(() => {
        setLanguage('en');
        if (isAuthenticated && user) {
            navigate(getDashboardPath(user.role));
        }
    }, [isAuthenticated, user, navigate, setLanguage]);

    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        // Clear any existing tokens to prevent 401s from invalid headers
        localStorage.removeItem('token');
        localStorage.removeItem('refresh');

        try {
            // Adjust endpoint if needed (using 'token/' for simplejwt)
            const response = await api.post('/auth/login/', formData);
            const { access, refresh } = response.data;

            // Assuming backend returns role/user details on login. 
            // If standard simplejwt, we might need to decode token or fetch profile separately.
            // For this phase, let's assume we customized the TokenObtainView or fetch profile after.

            // To be robust: Fetch Profile immediately after token
            localStorage.setItem('token', access);
            localStorage.setItem('refresh', refresh);

            // Fetch me
            const meResponse = await api.get('/auth/profile/');
            const user = meResponse.data;

            login(user, access);

            // Redirect to Role-Based Dashboard
            navigate(getDashboardPath(user.role));

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.detail || 'Invalid credentials. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <div className="flex-1 flex flex-col md:flex-row relative">
                {/* Left Side - Professional/Branding */}
                <div className="hidden md:flex md:w-1/2 lg:w-5/12 bg-[#193756] flex-col justify-between p-12 text-white relative overflow-hidden">
                    {/* Abstract Pattern overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
                    {/* No Gradient - Strict Solid Color */}

                    <div className="relative z-10 pt-8">
                        <div className="flex items-center gap-4 mb-8 bg-white/10 w-fit p-3 rounded-xl">
                            <img src="/images/kerala-govt.png" alt="Govt Logo" className="h-20 w-auto" />
                            <div className="h-12 w-px bg-white/20"></div>
                            <img src="/images/ksitm.png" alt="KSITM Logo" className="h-14 w-auto" />
                        </div>

                        <h1 className="text-4xl font-bold font-sans leading-tight mb-6 tracking-tight text-white">
                            Digi Keralam 2.0
                        </h1>
                        <p className="text-white/90 text-lg leading-relaxed max-w-md font-light text-justify">
                            The official unified portal for the Kerala Digital Literacy Mission. Empowering citizens through technology, streamlined administration, and verified training programs.
                        </p>
                    </div>

                    <div className="relative z-10 space-y-6 pb-12">
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-white">Secure Authentication</h3>
                                <p className="text-white/80 text-sm mt-1">Enterprise-grade security standards for data protection.</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <div className="bg-white/10 p-2 rounded-lg">
                                <CheckCircle2 className="h-6 w-6 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg text-white">Real-time Monitoring</h3>
                                <p className="text-white/80 text-sm mt-1">Comprehensive analytics across wards and districts.</p>
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 text-xs text-white/60 font-medium">
                        &copy; {new Date().getFullYear()} Government of Kerala. All rights reserved.
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-white relative">
                    <div className="w-full max-w-md space-y-8">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Sign in to your account</h2>
                            <p className="mt-2 text-sm text-gray-600">
                                Please enter your credentials to access the administrative portal.
                            </p>
                        </div>

                        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                                        </div>
                                        <div className="ml-3">
                                            <h3 className="text-sm font-medium text-red-800">Authentication Failed</h3>
                                            <div className="mt-1 text-sm text-red-700">
                                                {error}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Username
                                    </label>
                                    <div className="mt-1">
                                        <Input
                                            id="username"
                                            name="username"
                                            type="text"
                                            autoComplete="username"
                                            required
                                            value={formData.username}
                                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="h-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm bg-gray-50 focus:bg-white transition-colors"
                                            placeholder="Enter your registered username"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Password
                                    </label>
                                    <div className="mt-1">
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            autoComplete="current-password"
                                            required
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="h-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-600 focus:ring-primary-600 sm:text-sm bg-gray-50 focus:bg-white transition-colors"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-600 border-gray-300 rounded cursor-pointer"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer select-none">
                                        Remember me
                                    </label>
                                </div>

                                <div className="text-sm">
                                    <a href="#" className="font-medium text-primary-700 hover:text-primary-800 hover:underline transition-all">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div>

                            <div>
                                <Button
                                    type="submit"
                                    variant="primary"
                                    size="lg"
                                    className="w-full h-12 flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-700 hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-600 transition-all duration-200"
                                    isLoading={isLoading}
                                >
                                    Sign In
                                </Button>
                            </div>

                            <div className="mt-8">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-200" />
                                    </div>
                                    <div className="relative flex justify-center text-sm">
                                        <span className="px-4 bg-white text-gray-500 font-medium">New User?</span>
                                    </div>
                                </div>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <Link
                                        to="/register"
                                        className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 text-center"
                                    >
                                        Register New Account
                                    </Link>
                                    <Link
                                        to="/register-trainer"
                                        className="w-full inline-flex justify-center items-center px-4 py-2.5 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 text-center"
                                    >
                                        Register as Trainer
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
