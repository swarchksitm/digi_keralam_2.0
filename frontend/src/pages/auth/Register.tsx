import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { LocationService, type District, type LSGI, type Ward } from '../../services/locationService';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        district_id: '',
        lsgi_type: '',
        lsgi_id: '',
        ward_id: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Location Data State
    const [districts, setDistricts] = useState<District[]>([]);
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    useEffect(() => {
        // Fetch Districts on mount
        LocationService.getDistricts().then(setDistricts).catch(console.error);
    }, []);

    // Fetch LSGIs when District or Type changes
    useEffect(() => {
        if (formData.district_id && formData.lsgi_type) {
            LocationService.getLSGIs({
                district: Number(formData.district_id),
                lsgi_type: formData.lsgi_type
            }).then(setLsgis).catch(console.error);
        } else {
            setLsgis([]);
        }
    }, [formData.district_id, formData.lsgi_type]);

    // Fetch Wards when LSGI changes
    useEffect(() => {
        if (formData.lsgi_id) {
            LocationService.getWards(Number(formData.lsgi_id)).then(setWards).catch(console.error);
        } else {
            setWards([]);
        }
    }, [formData.lsgi_id]);

    const handleLsgiChange = (val: string | number) => {
        setFormData(prev => ({ ...prev, lsgi_id: String(val), ward_id: '' }));
    };

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
                role: 'CITIZEN',
                district_id: formData.district_id ? Number(formData.district_id) : null,
                lsgi_id: formData.lsgi_id ? Number(formData.lsgi_id) : null,
                ward_id: formData.ward_id ? Number(formData.ward_id) : null
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

                            {/* Location Section */}
                            <div className="space-y-4 pt-4 border-t border-gray-100">
                                <h3 className="text-sm font-medium text-gray-700">Location Details</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <Select
                                        label="District"
                                        options={districts.map(d => ({ value: d.id, label: d.name }))}
                                        value={formData.district_id}
                                        onChange={(val) => setFormData({ ...formData, district_id: String(val), lsgi_id: '', ward_id: '' })}
                                        required
                                    />
                                    <Select
                                        label="LSGI Type"
                                        options={[
                                            { value: 'GP', label: 'Grama Panchayat' },
                                            { value: 'MUNICIPALITY', label: 'Municipality' },
                                            { value: 'CORPORATION', label: 'Corporation' }
                                        ]}
                                        value={formData.lsgi_type}
                                        onChange={(val) => setFormData({ ...formData, lsgi_type: String(val), lsgi_id: '', ward_id: '' })}
                                        disabled={!formData.district_id}
                                        required
                                    />
                                </div>

                                <SearchableSelect
                                    label="LSGI"
                                    value={formData.lsgi_id}
                                    onChange={handleLsgiChange}
                                    options={lsgis.map(l => ({ value: l.id, label: l.name }))}
                                    required
                                    disabled={!formData.lsgi_type || lsgis.length === 0}
                                    placeholder="Type to search LSGI..."
                                />

                                <Select
                                    label="Ward"
                                    options={wards.map(w => ({ value: w.id, label: w.ward_number ? `${w.ward_number}: ${w.name}` : w.name }))}
                                    value={formData.ward_id}
                                    onChange={(val) => setFormData({ ...formData, ward_id: String(val) })}
                                    disabled={!formData.lsgi_id || wards.length === 0}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100">
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
                            </div>

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
                            <div className="text-center text-sm text-gray-500 pt-2 border-t border-gray-100">
                                Want to join as a Field Trainer?{' '}
                                <Link to="/register-trainer" className="text-blue-600 hover:underline font-medium">
                                    Register as Trainer
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
