
import React, { useState, useEffect } from 'react';
import { UserService, type AdminUser } from '../../services/userService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Plus, Trash2, UserCog, Search } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../auth/store';
import { LocationService, type LSGI } from '../../services/locationService';
import { useLanguage } from '../../contexts/LanguageContext';

export const MasterTrainerManager: React.FC = () => {
    const { t } = useLanguage();
    const { user } = useAuthStore();
    const [trainers, setTrainers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "Success", message: "" });

    // District Admin Features
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [selectedLsgi, setSelectedLsgi] = useState<string>('');

    // Wards State
    const [wards, setWards] = useState<any[]>([]);
    const [selectedWards, setSelectedWards] = useState<number[]>([]);

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
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            console.log("Loading data for user:", user);
            const districtId = user?.profile?.district
                ? (typeof user.profile.district === 'object' ? user.profile.district.id : user.profile.district)
                : undefined;

            const [usersReq, lsgisReq] = await Promise.all([
                UserService.getAdminUsers('DISTRICT_MASTER_TRAINER'),
                user?.role === 'LSGD_DISTRICT_ADMIN' && districtId
                    ? LocationService.getLSGIs({ district: districtId })
                    : Promise.resolve([])
            ]);
            setTrainers(usersReq);
            if (lsgisReq) setLsgis(lsgisReq);

            // Auto-select LSGI for LSGI Admins
            if (user?.profile?.lsgi) {
                console.log("User has LSGI profile:", user.profile.lsgi);
                const lsgiId = typeof user.profile.lsgi === 'object' ? user.profile.lsgi.id : user.profile.lsgi;
                console.log("Setting selected LSGI to:", lsgiId);
                setSelectedLsgi(lsgiId.toString());
            } else {
                console.log("User does not have LSGI profile or is not LSGI Admin");
            }
        } catch (error) {
            console.error("Failed to load master trainers", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Separate effect to ensure LSGI is selected even if user loads after initial mount
    useEffect(() => {
        if (user?.role === 'LSGI_ADMIN' && user?.profile?.lsgi) {
            const lsgiId = typeof user.profile.lsgi === 'object' ? user.profile.lsgi.id : user.profile.lsgi;
            console.log("Auto-selecting LSGI for LSGI Admin:", lsgiId);
            setSelectedLsgi(lsgiId.toString());
        }
    }, [user]);

    useEffect(() => {
        if (selectedLsgi) {
            LocationService.getWards(Number(selectedLsgi))
                .then(setWards)
                .catch(console.error);
        } else {
            setWards([]);
            setSelectedWards([]);
        }
    }, [selectedLsgi]);

    const toggleWard = (wardId: number) => {
        setSelectedWards(prev =>
            prev.includes(wardId)
                ? prev.filter(id => id !== wardId)
                : [...prev, wardId]
        );
    };

    const handleSelectAllWards = () => {
        if (selectedWards.length === wards.length) {
            setSelectedWards([]);
        } else {
            setSelectedWards(wards.map(w => w.id));
        }
    };

    const handleEdit = (trainer: AdminUser) => {
        setEditingId(trainer.id);
        setFormData({
            username: trainer.username,
            password: '', // Leave empty to keep unchanged
            first_name: trainer.first_name,
            last_name: trainer.last_name,
            email: trainer.email,
            phone: trainer.phone
        });

        if (trainer.profile?.lsgi) {
            setSelectedLsgi(trainer.profile.lsgi.id.toString());
        }

        if (trainer.profile?.wards) {
            setSelectedWards(trainer.profile.wards.map(w => w.id));
        } else {
            setSelectedWards([]);
        }

        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (user?.role === 'LSGD_DISTRICT_ADMIN' && !selectedLsgi) {
            alert("Please select an LSGI for the Master Trainer.");
            return;
        }

        setIsSaving(true);
        try {
            const payload: any = {
                ...formData,
                role: 'DISTRICT_MASTER_TRAINER',
                lsgi_id: selectedLsgi || undefined,
                ward_ids: selectedWards
            };

            // Remove password if empty during edit
            if (editingId && !payload.password) {
                delete payload.password;
            }

            if (editingId) {
                await api.patch(`/auth/admin-users/${editingId}/`, payload);
                setSuccessModal({
                    isOpen: true,
                    title: t('common.success'),
                    message: "Master Trainer updated successfully!"
                });
            } else {
                await api.post('/auth/admin-users/', payload);
                setSuccessModal({
                    isOpen: true,
                    title: t('common.success'),
                    message: "Master Trainer created successfully!"
                });
            }

            await loadData();
            setIsModalOpen(false);
            setEditingId(null);
            setFormData({
                username: '',
                password: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: ''
            });
            // Don't clear LSGI if District Admin? Maybe clear for fresh start.
            // Actually for LSGI Admin user, we shouldn't clear it.
            if (user?.role === 'LSGD_DISTRICT_ADMIN') {
                setSelectedLsgi('');
            }
            // For LSGI Admin (who is restricted), selectedLsgi is auto-set in loadData/effect, 
            // but we should arguably not clear it here if it's fixed.
            // However, loadData checks user profile and sets it.
            // But if we clear it here, the user has to wait for reload? 
            // Better to just clear selectedWards.

            if (user?.role === 'LSGD_DISTRICT_ADMIN') {
                setSelectedLsgi('');
            }
            setSelectedWards([]);

        } catch (error: any) {
            console.error("Failed to save trainer", error);
            alert("Failed to save trainer: " + (error.response?.data?.detail || JSON.stringify(error.response?.data)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;
        try {
            await UserService.deleteAdminUser(deleteConfirmation.id);
            setTrainers(prev => prev.filter(u => u.id !== deleteConfirmation.id));
            setDeleteConfirmation({ isOpen: false, id: null });
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
                        <Button onClick={() => {
                            setEditingId(null);
                            setFormData({
                                username: '', password: '', first_name: '', last_name: '', email: '', phone: ''
                            });
                            // If LSGI Admin, keep selectedLsgi. If District Admin, clear it.
                            if (user?.role === 'LSGD_DISTRICT_ADMIN') setSelectedLsgi('');
                            setSelectedWards([]);
                            setIsModalOpen(true);
                        }} className="gap-2 rounded-full">
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
                                        <div className="h-8 w-8 rounded-full bg-[#193756] text-white flex items-center justify-center">
                                            <UserCog className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{trainer.username}</p>
                                            <p className="text-xs text-gray-500">{trainer.first_name} {trainer.last_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[#193756]/10 text-[#193756]">
                                        LSGI Level
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    <div>{trainer.email}</div>
                                    <div className="text-xs">{trainer.phone}</div>
                                </td>
                                {user?.role !== 'LSGD_DISTRICT_ADMIN' && (
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleEdit(trainer)}
                                                className="text-blue-500 hover:bg-blue-50 p-2 rounded-full transition-colors"
                                                title="Edit Trainer"
                                            >
                                                <UserCog className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmation({ isOpen: true, id: trainer.id })}
                                                className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                title="Delete Trainer"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Master Trainer" : "Add New LSGI Master Trainer"}>
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

                    {/* Ward Selection (Only if LSGI selected) */}
                    {selectedLsgi && (
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Assign Wards (Optional)</label>
                                <button
                                    type="button"
                                    onClick={handleSelectAllWards}
                                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    {selectedWards.length === wards.length ? 'Deselect All' : 'Select All'}
                                </button>
                            </div>
                            <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                                {wards.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                        {wards.map(ward => (
                                            <label key={ward.id} className="flex items-center gap-2 p-1 hover:bg-white rounded cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedWards.includes(ward.id)}
                                                    onChange={() => toggleWard(ward.id)}
                                                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                />
                                                <span className="text-xs text-gray-700 truncate" title={ward.name}>
                                                    {ward.ward_number}. {ward.name}
                                                </span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs text-gray-400 text-center py-2">No wards found for this LSGI (ID: {selectedLsgi}).</p>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Selected: {selectedWards.length} wards</p>
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

                    <Input
                        label={editingId ? "Password (Leave blank to keep current)" : "Password"}
                        type="password"
                        value={formData.password}
                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                        required={!editingId}
                        placeholder="Set strong password"
                    />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>{editingId ? "Update Master Trainer" : "Create Master Trainer"}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title={t('dashboard.confirm_delete_master_trainer')}
                message={t('dashboard.warning_delete_master_trainer')}
                variant="danger"
            />

            {/* Success Modal */}
            <ConfirmationModal
                isOpen={successModal.isOpen}
                onClose={() => setSuccessModal({ ...successModal, isOpen: false })}
                onConfirm={() => setSuccessModal({ ...successModal, isOpen: false })}
                title={successModal.title}
                message={successModal.message}
                variant="success"
                confirmLabel="OK"
                singleButton={true}
            />
        </div>
    );
};
