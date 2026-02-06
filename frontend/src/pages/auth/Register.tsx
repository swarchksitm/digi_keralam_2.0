import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            await api.post('/auth/register/', {
                username: formData.username,
                password: formData.password,
                email: formData.email,
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone,
                role: 'CITIZEN'
            });

            // On success, redirect to login
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail
                || (typeof err.response?.data === 'object' ? Object.values(err.response.data)[0] : null)
                || 'Registration failed. Please try again.';
            setError(String(msg));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md shadow-lg my-8">
                    <CardHeader className="space-y-1 text-center">
                        <CardTitle className="text-2xl font-bold text-gray-900">Create an Account</CardTitle>
                        <p className="text-sm text-gray-500">Join Digi Keralam 2.0 as a Citizen</p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    type="text"
                                    placeholder="John"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                />
                                <Input
                                    label="Last Name"
                                    type="text"
                                    placeholder="Doe"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                />
                            </div>

                            <Input
                                label="Username"
                                type="text"
                                placeholder="Choose a username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />

                            <Input
                                label="Email"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />

                            <Input
                                label="Phone"
                                type="tel"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />

                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />

                            <Input
                                label="Confirm Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />

                            <Button
                                type="submit"
                                className="w-full"
                                size="lg"
                                isLoading={isLoading}
                            >
                                Register
                            </Button>

                            <div className="text-center text-sm text-gray-500 mt-4">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-600 hover:underline font-medium">
                                    Sign in here
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Register;
