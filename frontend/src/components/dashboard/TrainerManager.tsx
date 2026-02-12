
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store';
import { UserService, type AdminUser } from '../../services/userService';
import { LocationService, type LSGI, type Ward } from '../../services/locationService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Plus, Trash2, UserCog, Search, Eye, X } from 'lucide-react';
import api from '../../api/client';

export const TrainerManager: React.FC = () => {
    const { user } = useAuthStore();
    const [trainers, setTrainers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<Record<number, { sessions_count: number; attendees_count: number }>>({});
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLsgiFilter, setSelectedLsgiFilter] = useState<number | 'ALL'>('ALL');

    // Details Modal State
    const [selectedTrainerId, setSelectedTrainerId] = useState<number | null>(null);
    const [attendeeDetails, setAttendeeDetails] = useState<any[]>([]);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        age: undefined as number | undefined,
        highest_qualification: '',
        lsgi_id: undefined as number | undefined,
        ward_ids: [] as number[]
    });

    const getRestrictedLsgiId = () => {
        const tempLsgi = user?.profile?.lsgi;
        return (tempLsgi && typeof tempLsgi === 'object' && 'id' in tempLsgi) ? tempLsgi.id : tempLsgi as number | undefined;
    };

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    // Ensure form data is correct when modal opens for restricted users
    useEffect(() => {
        if (isModalOpen) {
            const restrictedId = getRestrictedLsgiId();
            if (restrictedId) {
                setFormData(prev => ({ ...prev, lsgi_id: restrictedId }));
                // Wards might already be loaded from loadData, but just in case
                if (wards.length === 0) {
                    LocationService.getWards(restrictedId).then(setWards).catch(console.error);
                }
            }
        }
    }, [isModalOpen]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load Trainers
            const trainerData = await UserService.getAdminUsers('LSGI_FIELD_TRAINER');

            // Load Stats (if Master Trainer)
            if (user?.role === 'DISTRICT_MASTER_TRAINER') {
                try {
                    const statsRes = await api.get('/training/analytics/trainers/');
                    const statsMap: Record<number, any> = {};
                    statsRes.data.forEach((item: any) => {
                        statsMap[item.id] = {
                            sessions_count: item.sessions_count,
                            attendees_count: item.attendees_count
                        };
                    });
                    setStats(statsMap);
                } catch (e) {
                    console.error("Failed to load trainer stats", e);
                }
            }

            // Load LSGIs for dropdowns, filtered by user's district if available
            const tempDistrict = user?.profile?.district;
            const districtId = (tempDistrict && typeof tempDistrict === 'object' && 'id' in tempDistrict) ? tempDistrict.id : tempDistrict as number | undefined;

            const lsgiData = await LocationService.getLSGIs(districtId ? { district: districtId } : {});

            setTrainers(trainerData);

            // Filter LSGIs based on user role
            let filteredLsgis = lsgiData.filter(l => ['GP', 'MUNICIPALITY', 'CORPORATION'].includes(l.lsgi_type));

            // If user is restricted to a specific LSGI (LSGI_ADMIN or DISTRICT_MASTER_TRAINER with LSGI assignment)
            const tempLsgi = user?.profile?.lsgi;
            const restrictedLsgiId = (tempLsgi && typeof tempLsgi === 'object' && 'id' in tempLsgi) ? tempLsgi.id : tempLsgi as number | undefined;

            if (restrictedLsgiId) {
                filteredLsgis = filteredLsgis.filter(l => l.id === restrictedLsgiId);
            }

            setLsgis(filteredLsgis);

            // If only one LSGI is available, auto-select it for the filter and potentially fetch wards
            if (filteredLsgis.length === 1) {
                const lsgiId = filteredLsgis[0].id;
                setSelectedLsgiFilter(lsgiId);
                // Pre-load wards for the single LSGI
                LocationService.getWards(lsgiId).then(setWards).catch(console.error);
                // Also pre-fill the form data
                setFormData(prev => ({ ...prev, lsgi_id: lsgiId }));
            }
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLsgiChange = async (lsgiId: number) => {
        setFormData(prev => ({ ...prev, lsgi_id: lsgiId, ward_ids: [] }));
        try {
            const wardData = await LocationService.getWards(lsgiId);
            setWards(wardData);
        } catch (error) {
            console.error("Failed to load wards", error);
            setWards([]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Create user with role LSGI_FIELD_TRAINER
            // The backend AdminUserViewSet now handles this role and lsgi_id
            await api.post('/auth/admin-users/', {
                ...formData,
                role: 'LSGI_FIELD_TRAINER'
            });

            await loadData();
            setIsModalOpen(false);
            setFormData({
                username: '',
                password: '',
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                age: undefined,
                highest_qualification: '',
                lsgi_id: getRestrictedLsgiId(), // Reset to restricted ID if exists
                ward_ids: []
            });
            alert("Trainer created successfully!");
        } catch (error: any) {
            console.error("Failed to create trainer", error);
            alert("Failed to create trainer: " + (error.response?.data?.detail || JSON.stringify(error.response?.data)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this trainer?")) return;
        try {
            await UserService.deleteAdminUser(id);
            setTrainers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete trainer");
        }
    };

    const handleViewDetails = async (id: number) => {
        setSelectedTrainerId(id);
        setIsLoadingDetails(true);
        try {
            const response = await api.get(`/training/analytics/${id}/attendees/`);
            setAttendeeDetails(response.data);
        } catch (err) {
            alert("Failed to load attendee details");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    // Filter Logic
    const filteredTrainers = trainers.filter(trainer => {
        const matchesSearch = trainer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainer.first_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLsgi = selectedLsgiFilter === 'ALL' || trainer.profile?.lsgi?.id === selectedLsgiFilter;

        return matchesSearch && matchesLsgi;
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading trainers...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage LSGI Level Local Trainers</h2>
                        <p className="text-sm text-gray-500">Manage field trainers assigned to LSGIs in your district</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)} className="gap-2 rounded-full">
                        <Plus className="h-4 w-4" /> Add New Trainer
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search trainers..."
                            className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="rounded-lg border-gray-200 text-sm focus:ring-primary-500 py-2 px-4"
                        value={selectedLsgiFilter}
                        onChange={e => setSelectedLsgiFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
                    >
                        <option value="ALL">All LSGIs</option>
                        {lsgis.map(l => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Trainer</th>
                            <th className="px-4 py-3">LSGI / Ward</th>
                            {user?.role === 'DISTRICT_MASTER_TRAINER' && (
                                <>
                                    <th className="px-4 py-3 text-center">Sessions</th>
                                    <th className="px-4 py-3 text-center">Candidates</th>
                                </>
                            )}
                            <th className="px-4 py-3">Contact</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTrainers.map(trainer => (
                            <tr key={trainer.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                            <UserCog className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{trainer.username}</p>
                                            <p className="text-xs text-gray-500">{trainer.first_name} {trainer.last_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {trainer.profile?.lsgi?.name ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 w-fit">
                                                {trainer.profile.lsgi.name}
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {/* @ts-ignore : backend sends wards list */}
                                                {trainer.profile.wards && trainer.profile.wards.length > 0 ? (
                                                    // @ts-ignore
                                                    trainer.profile.wards.map((ward: any) => (
                                                        <span key={ward.id} className="text-xs text-gray-500 bg-gray-50 px-1 rounded border border-gray-100">
                                                            {ward.ward_number}: {ward.name}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">No Wards Assigned</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Unassigned</span>
                                    )}
                                </td>
                                {user?.role === 'DISTRICT_MASTER_TRAINER' && (
                                    <>
                                        <td className="px-4 py-3 text-center font-medium">
                                            {stats[trainer.id]?.sessions_count || 0}
                                        </td>
                                        <td className="px-4 py-3 text-center font-medium">
                                            {stats[trainer.id]?.attendees_count || 0}
                                        </td>
                                    </>
                                )}
                                <td className="px-4 py-3 text-gray-600">
                                    <div>{trainer.email}</div>
                                    <div className="text-xs">{trainer.phone}</div>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        {user?.role === 'DISTRICT_MASTER_TRAINER' && (
                                            <button
                                                onClick={() => handleViewDetails(trainer.id)}
                                                className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors"
                                                title="View Attendees"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button onClick={() => handleDelete(trainer.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredTrainers.length === 0 && (
                            <tr>
                                <td colSpan={user?.role === 'DISTRICT_MASTER_TRAINER' ? 6 : 4} className="text-center py-8 text-gray-500">
                                    No trainers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Field Trainer">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                        <Input label="Last Name" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                        <Input label="Age" type="number" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} required />
                    </div>

                    <Input label="Highest Qualification" value={formData.highest_qualification} onChange={e => setFormData({ ...formData, highest_qualification: e.target.value })} required />

                    {lsgis.length === 1 ? (
                        <Input
                            label="Assign to LSGI"
                            value={lsgis[0].name}
                            readOnly
                            className="bg-gray-50 text-gray-500"
                        />
                    ) : (
                        <div>
                            <Select
                                label="Assign to LSGI"
                                value={formData.lsgi_id || ''}
                                onChange={val => handleLsgiChange(Number(val))}
                                options={lsgis.map(l => ({ value: l.id, label: l.name }))}
                                required
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Wards (Optional)</label>
                        <div className="border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                            {wards.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-2">Select an LSGI first</p>
                            ) : (
                                <div className="space-y-2">
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
                        <p className="text-xs text-gray-500 mt-1">Select multiple wards if needed.</p>
                    </div>

                    <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder="Set strong password" />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>Create Trainer</Button>
                    </div>
                </form>
            </Modal>

            {/* Trainer Details Modal */}
            <Modal isOpen={!!selectedTrainerId} onClose={() => setSelectedTrainerId(null)} title="Trainer Performance Details">
                <div className="space-y-6">
                    {isLoadingDetails ? (
                        <div className="text-center py-8 text-gray-500">Loading details...</div>
                    ) : (
                        <>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Candidates</h3>
                                <div className="overflow-x-auto border rounded-lg">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                                            <tr>
                                                <th className="px-4 py-2">Name</th>
                                                <th className="px-4 py-2">Phone</th>
                                                <th className="px-4 py-2">Age</th>
                                                <th className="px-4 py-2">Session</th>
                                                <th className="px-4 py-2">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {attendeeDetails && attendeeDetails.length > 0 ? (
                                                attendeeDetails.map((att, idx) => (
                                                    <tr key={idx} className="hover:bg-gray-50">
                                                        <td className="px-4 py-2 font-medium">{att.name}</td>
                                                        <td className="px-4 py-2 text-gray-600">{att.phone}</td>
                                                        <td className="px-4 py-2 text-gray-600">{att.age || '-'}</td>
                                                        <td className="px-4 py-2 text-gray-600">{att.session_name}</td>
                                                        <td className="px-4 py-2 text-gray-600 text-xs">
                                                            {new Date(att.date).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan={5} className="text-center py-6 text-gray-500">
                                                        No candidates found for this trainer.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button variant="outline" onClick={() => setSelectedTrainerId(null)}>Close</Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};
