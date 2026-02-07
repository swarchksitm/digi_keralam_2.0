import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../auth/store';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { getDashboardPath } from '../../utils/roleUtils';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const login = useAuthStore((state) => state.login);
    const { isAuthenticated, user } = useAuthStore((state) => state);

    React.useEffect(() => {
        if (isAuthenticated && user) {
            navigate('/');
        }
    }, [isAuthenticated, user, navigate]);

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
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-gray-900">Sign in to your account</CardTitle>
                        <p className="text-sm text-gray-500">Welcome back to Digi Keralam 2.0</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <Input
                                label="Username"
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                Sign In
                            </Button>

                            <div className="text-center text-sm text-gray-500 mt-4">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-primary-600 hover:underline font-medium">
                                    Register here
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Login;
