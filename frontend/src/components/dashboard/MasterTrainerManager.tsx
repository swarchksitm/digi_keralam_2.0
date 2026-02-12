
import React, { useState, useEffect } from 'react';
import { UserService, type AdminUser } from '../../services/userService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Plus, Trash2, UserCog, Search } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../auth/store';
import { LocationService, type LSGI } from '../../services/locationService';

export const MasterTrainerManager: React.FC = () => {
    const { user } = useAuthStore();
    const [trainers, setTrainers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // District Admin Features
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [selectedLsgi, setSelectedLsgi] = useState<string>('');

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        // Load LSGIs if District Admin
        if (user?.role === 'LSGD_DISTRICT_ADMIN' && isModalOpen) {
            LocationService.getLSGIs().then(setLsgis).catch(console.error);
        }
    }, [user?.role, isModalOpen]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load LSGI Master Trainers
            const trainerData = await UserService.getAdminUsers('DISTRICT_MASTER_TRAINER');
            setTrainers(trainerData);
        } catch (error) {
            console.error("Failed to load master trainers", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user?.role === 'LSGD_DISTRICT_ADMIN' && !selectedLsgi) {
            alert("Please select an LSGI for the Master Trainer.");
            return;
        }

        setIsSaving(true);
        try {
            // Create user with role DISTRICT_MASTER_TRAINER (LSGI Master Trainer)
            await api.post('/auth/admin-users/', {
                ...formData,
                role: 'DISTRICT_MASTER_TRAINER',
                lsgi_id: selectedLsgi || undefined // Optional if LSGI Admin (auto-assigned backend)
            });

            await loadData();
            setIsModalOpen(false);
            setFormData({
                username: '',
                password: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: ''
            });
            setSelectedLsgi('');
            alert("Master Trainer created successfully!");
        } catch (error: any) {
            console.error("Failed to create trainer", error);
            alert("Failed to create trainer: " + (error.response?.data?.detail || JSON.stringify(error.response?.data)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this master trainer?")) return;
        try {
            await UserService.deleteAdminUser(id);
            setTrainers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete trainer");
        }
    };

    // Filter Logic
    const filteredTrainers = trainers.filter(trainer => {
        return trainer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainer.first_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading master trainers...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage Master Trainers</h2>
                        <p className="text-sm text-gray-500">Create and manage LSGI Master Trainers.</p>
                    </div>
                    {user?.role !== 'LSGD_DISTRICT_ADMIN' && (
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2 rounded-full">
                            <Plus className="h-4 w-4" /> Add Master Trainer
                        </Button>
                    )}
                </div>

                {/* Filters */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search master trainers..."
                        className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Trainer</th>
                            <th className="px-4 py-3">Assigned LSGI</th>
                            <th className="px-4 py-3">Contact</th>
                            {user?.role !== 'LSGD_DISTRICT_ADMIN' && (
                                <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTrainers.map(trainer => (
                            <tr key={trainer.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                                            <UserCog className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{trainer.username}</p>
                                            <p className="text-xs text-gray-500">{trainer.first_name} {trainer.last_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700">
                                        {/* Since backend returns user objects, we need to ensure profile is populated or handled */}
                                        {/* For now simplified as "LSGI Scope" or if possible fetch name */}
                                        LSGI Level
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    <div>{trainer.email}</div>
                                    <div className="text-xs">{trainer.phone}</div>
                                </td>
                                {user?.role !== 'LSGD_DISTRICT_ADMIN' && (
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDelete(trainer.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New LSGI Master Trainer">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* District Admin MUST select LSGI */}
                    {user?.role === 'LSGD_DISTRICT_ADMIN' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Assign LSGI</label>
                            <select
                                className="w-full rounded-lg border border-gray-300 p-2 text-sm focus:ring-2 focus:ring-primary-500"
                                value={selectedLsgi}
                                onChange={e => setSelectedLsgi(e.target.value)}
                                required
                            >
                                <option value="">Select LSGI...</option>
                                {lsgis.map(l => (
                                    <option key={l.id} value={l.id}>{l.name} ({l.lsgi_type})</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-1">Master Trainer will be scoped to this LSGI.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                        <Input label="Last Name" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                    </div>

                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />

                    <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder="Set strong password" />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>Create Master Trainer</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
