import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import api from '../../api/client';
import { useAuthStore } from '../../auth/store';
import type { Block, LSGI, Ward } from '../../types/location';
import { AlertCircle, CheckCircle } from 'lucide-react';

const SessionCreate: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        proficiency: '',
        mode: '',
        venue: '',
        date_time: '',
        ward: '',
    });

    // Location State
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);

    const [selectedBlock, setSelectedBlock] = useState('');
    const [selectedLSGI, setSelectedLSGI] = useState('');

    // UI State
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Fetch Blocks on Mount (filtered by User's District)
    useEffect(() => {
        const fetchBlocks = async () => {
            // If user is restricted to an LSGI, skip block fetching and set LSGI directly
            if (user?.profile?.lsgi) {
                const lsgiId = typeof user.profile.lsgi === 'object' ? user.profile.lsgi.id : user.profile.lsgi;
                setSelectedLSGI(String(lsgiId));
                return;
            }

            // Safety check for role and district
            if (!user?.profile?.district) {
                setError("User district not found. Cannot load locations.");
                return;
            }

            try {
                const response = await api.get(`/locations/blocks/?district=${user.profile.district}`);
                setBlocks(response.data);
            } catch (err) {
                console.error("Failed to fetch blocks", err);
                setError("Failed to load blocks.");
            }
        };

        fetchBlocks();
    }, [user]);

    // Fetch LSGIs when Block changes
    useEffect(() => {
        if (!selectedBlock) {
            setLsgis([]);
            return;
        }
        const fetchLsgis = async () => {
            try {
                const response = await api.get(`/locations/lsgis/?block=${selectedBlock}`);
                setLsgis(response.data);
            } catch (err) {
                console.error("Failed to fetch LSGIs", err);
            }
        };
        fetchLsgis();
    }, [selectedBlock]);

    // Fetch Wards when LSGI changes
    useEffect(() => {
        if (!selectedLSGI) {
            setWards([]);
            return;
        }
        const fetchWards = async () => {
            try {
                const response = await api.get(`/locations/wards/?lsgi=${selectedLSGI}`);
                setWards(response.data);
            } catch (err) {
                console.error("Failed to fetch Wards", err);
            }
        };
        fetchWards();
    }, [selectedLSGI]);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.post('/training/sessions/', formData);
            setSuccess(true);
            // Delay redirect slightly to show success
            setTimeout(() => {
                navigate('/district/dashboard');
            }, 1500);
        } catch (err: any) {
            console.error("Create session failed", err);
            const msg = err.response?.data?.detail
                || (err.response?.data && typeof err.response.data === 'object' ? Object.values(err.response.data).join(', ') : null)
                || JSON.stringify(err.response?.data)
                || "Failed to create session.";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md text-center p-8">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Session Created!</h2>
                    <p className="text-gray-600">Redirecting you to the dashboard...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Create New Training Session</h1>
                    <p className="text-gray-600">Schedule a new session in your district.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Session Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4" />
                                    {error}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Session Title"
                                    name="title"
                                    placeholder="e.g. Grandma's Guide to Smartphones"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                                <Select
                                    label="Category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    options={[
                                        { value: 'SAFE_TECH', label: 'Safe Tech' },
                                        { value: 'AI_EDU', label: 'AI Education' },
                                        { value: 'DEED', label: 'DEED (Entrepreneurship)' },
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Select
                                    label="Proficiency Level"
                                    name="proficiency"
                                    value={formData.proficiency}
                                    onChange={handleChange}
                                    required
                                    options={[
                                        { value: 'BEGINNER', label: 'Beginner' },
                                        { value: 'INTERMEDIATE', label: 'Intermediate' },
                                        { value: 'ADVANCED', label: 'Advanced' },
                                    ]}
                                />
                                <Select
                                    label="Mode"
                                    name="mode"
                                    value={formData.mode}
                                    onChange={handleChange}
                                    required
                                    options={[
                                        { value: 'OFFLINE', label: 'Offline' },
                                        { value: 'ONLINE', label: 'Online' },
                                    ]}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Input
                                    label="Date & Time"
                                    name="date_time"
                                    type="datetime-local"
                                    value={formData.date_time}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Venue / Link"
                                    name="venue"
                                    placeholder="e.g. Community Hall or Zoom Link"
                                    value={formData.venue}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    name="description"
                                    rows={3}
                                    placeholder="Briefly describe the session content..."
                                    value={formData.description}
                                    onChange={handleChange as any}
                                    required
                                />
                            </div>

                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">Location Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Select
                                        label="Block"
                                        value={selectedBlock}
                                        onChange={(e) => {
                                            setSelectedBlock(e.target.value);
                                            setSelectedLSGI('');
                                            setFormData(prev => ({ ...prev, ward: '' }));
                                        }}
                                        required
                                        options={blocks.map(b => ({ value: b.id, label: b.name }))}
                                    />
                                    <Select
                                        label="LSGI"
                                        value={selectedLSGI}
                                        onChange={(e) => {
                                            setSelectedLSGI(e.target.value);
                                            setFormData(prev => ({ ...prev, ward: '' }));
                                        }}
                                        required
                                        disabled={!selectedBlock}
                                        options={lsgis.map(l => ({ value: l.id, label: l.name }))}
                                    />
                                    <Select
                                        label="Ward"
                                        name="ward"
                                        value={formData.ward}
                                        onChange={handleChange}
                                        required
                                        disabled={!selectedLSGI}
                                        options={wards.map(w => ({ value: w.id, label: `Ward ${w.number}: ${w.name}` }))}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => navigate('/district/dashboard')}>
                                    Cancel
                                </Button>
                                <Button type="submit" isLoading={isLoading}>
                                    Create Session
                                </Button>
                            </div>

                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SessionCreate;
