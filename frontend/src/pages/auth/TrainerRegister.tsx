import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle, UserCog } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { LocationService, type District, type LSGI, type Ward } from '../../services/locationService';

const TrainerRegister: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        age: '' as string | number,
        highest_qualification: '',
        district_id: '' as string | number,
        lsgi_id: '' as string | number,
        ward_ids: [] as number[]
    });

    // Location Data
    const [districts, setDistricts] = useState<District[]>([]);
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Load Districts on mount
        LocationService.getDistricts().then(setDistricts).catch(console.error);
    }, []);

    const handleDistrictChange = async (val: string | number) => {
        const districtId = Number(val);
        setFormData({ ...formData, district_id: districtId, lsgi_id: '', ward_ids: [] });
        setLsgis([]);
        setWards([]);

        if (districtId) {
            try {
                // Fetch LSGIs (Municipality, Corporation, GP only for field trainers typically)
                const allLsgis = await LocationService.getLSGIs({ district: districtId });
                // Filter relevant types? For now show all
                setLsgis(allLsgis);
            } catch (err) {
                console.error("Failed to load LSGIs", err);
            }
        }
    };

    const handleLsgiChange = async (val: string | number) => {
        const lsgiId = Number(val);
        setFormData({ ...formData, lsgi_id: lsgiId, ward_ids: [] });
        setWards([]);

        if (lsgiId) {
            try {
                const wardData = await LocationService.getWards(lsgiId);
                setWards(wardData);
            } catch (err) {
                console.error("Failed to load wards", err);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (!formData.lsgi_id) {
            setError("Please select an LSGI.");
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
                phone: formData.phone || undefined,
                role: 'LSGI_FIELD_TRAINER',
                age: Number(formData.age),
                highest_qualification: formData.highest_qualification,
                district_id: Number(formData.district_id),
                lsgi_id: Number(formData.lsgi_id),
                ward_ids: formData.ward_ids
            });

            // On success, redirect to login with a message?
            alert("Registration successful! Please login.");
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            const msg = err.response?.data?.detail
                || (typeof err.response?.data === 'object' ? Object.values(err.response.data)[0] : null)
                || JSON.stringify(err.response?.data)
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
                <Card className="w-full max-w-2xl shadow-lg my-8">
                    <CardHeader className="space-y-1 text-center bg-blue-50/50 pb-6 border-b border-gray-100">
                        <div className="mx-auto h-12 w-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-2">
                            <UserCog className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900">Field Trainer Registration</CardTitle>
                        <p className="text-sm text-gray-500">Join as an LSGI Field Trainer to conduct digital literacy sessions.</p>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    value={formData.first_name}
                                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Last Name"
                                    value={formData.last_name}
                                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Age"
                                    type="number"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Highest Qualification"
                                    value={formData.highest_qualification}
                                    onChange={(e) => setFormData({ ...formData, highest_qualification: e.target.value })}
                                    required
                                    placeholder="e.g. B.Tech, MCA, Plus Two"
                                />
                            </div>

                            <div className="space-y-4 border-t border-b border-gray-100 py-4">
                                <h3 className="text-sm font-medium text-gray-900">Assignment Location</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Select
                                        label="District"
                                        value={formData.district_id}
                                        onChange={handleDistrictChange}
                                        options={districts.map(d => ({ value: d.id, label: d.name }))}
                                        required
                                    />
                                    <Select
                                        label="LSGI"
                                        value={formData.lsgi_id}
                                        onChange={handleLsgiChange}
                                        options={lsgis.map(l => ({ value: l.id, label: `${l.name} (${l.lsgi_type})` }))}
                                        required
                                        disabled={!formData.district_id}
                                    />
                                    <div className="col-span-1 md:col-span-3">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Wards (Optional)</label>
                                        <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                                            {wards.length === 0 ? (
                                                <p className="text-sm text-gray-400 text-center py-2">Select an LSGI to view wards</p>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                                                    {wards.map(w => (
                                                        <label key={w.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                                            <input
                                                                type="checkbox"
                                                                checked={formData.ward_ids.includes(w.id)}
                                                                onChange={e => {
                                                                    const checked = e.target.checked;
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        ward_ids: checked
                                                                            ? [...prev.ward_ids, w.id]
                                                                            : prev.ward_ids.filter(id => id !== w.id)
                                                                    }));
                                                                }}
                                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                                <span className="font-semibold text-gray-900 w-6 inline-block">{w.ward_number}</span>
                                                                {w.name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Username"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    required
                                />
                            </div>

                            <Input
                                label="Email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="Password"
                                    type="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Confirm Password"
                                    type="password"
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
                                Register as Trainer
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

export default TrainerRegister;
