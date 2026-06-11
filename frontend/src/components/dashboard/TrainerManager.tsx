import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store';
import { UserService, type AdminUser } from '../../services/userService';
import { LocationService, type LSGI, type Ward } from '../../services/locationService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Plus, Trash2, UserCog, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import api from '../../api/client';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedName } from '../../utils/languageUtils';
import { ConfirmationModal } from '../ui/ConfirmationModal';

export const TrainerManager: React.FC = () => {
    const { user } = useAuthStore();
    const { t, language } = useLanguage();
    const [trainers, setTrainers] = useState<AdminUser[]>([]);
    const [pendingTrainers, setPendingTrainers] = useState<AdminUser[]>([]);
    const [stats, setStats] = useState<Record<number, { sessions_count: number; attendees_count: number }>>({});
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const [successModal, setSuccessModal] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "Success", message: "" });
    const [selectedLsgiFilter, setSelectedLsgiFilter] = useState<number | 'ALL'>('ALL');
    const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING'>('ACTIVE');

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
                // Load wards immediately for the restricted LSGI
                LocationService.getWards(restrictedId).then(setWards).catch(console.error);
            }
        }
    }, [isModalOpen]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load Active Trainers
            const activeData = await UserService.getAdminUsers('LSGI_FIELD_TRAINER', { is_verified: true });

            // Load Pending Trainers (if allowed)
            let pendingData: AdminUser[] = [];
            try {
                pendingData = await UserService.getAdminUsers('LSGI_FIELD_TRAINER', { is_verified: false });
            } catch (err) {
                console.warn("Could not load pending trainers", err);
            }

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

            // Load LSGIs for dropdowns
            const tempDistrict = user?.profile?.district;
            const districtId = (tempDistrict && typeof tempDistrict === 'object' && 'id' in tempDistrict) ? tempDistrict.id : tempDistrict as number | undefined;
            const lsgiData = await LocationService.getLSGIs(districtId ? { district: districtId } : {});

            setTrainers(activeData);
            setPendingTrainers(pendingData);

            // Filter LSGIs based on user role
            let filteredLsgis = lsgiData.filter(l => ['GP', 'MUNICIPALITY', 'CORPORATION'].includes(l.lsgi_type));
            const restrictedLsgiId = getRestrictedLsgiId();

            if (restrictedLsgiId) {
                filteredLsgis = filteredLsgis.filter(l => l.id === restrictedLsgiId);
            }

            setLsgis(filteredLsgis);

            if (filteredLsgis.length === 1) {
                const lsgiId = filteredLsgis[0].id;
                setSelectedLsgiFilter(lsgiId);
                LocationService.getWards(lsgiId).then(setWards).catch(console.error);
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

    const handleViewDetails = async (id: number) => {
        setSelectedTrainerId(id);
        setIsLoadingDetails(true);
        try {
            const response = await api.get(`/training/analytics/${id}/attendees/`);
            setAttendeeDetails(response.data);
        } catch (error) {
            console.error("Failed to load details", error);
            setAttendeeDetails([]);
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);

    // Qualification Options
    const QUALIFICATION_OPTIONS = [
        { value: 'SSLC', label: 'SSLC' },
        { value: 'HSE', label: 'HSE' },
        { value: 'DIPLOMA', label: 'DIPLOMA' },
        { value: 'UG', label: 'UG' },
        { value: 'PG', label: 'PG' },
        { value: 'PHD', label: 'PHD' },
        { value: 'OTHER', label: 'OTHER' }
    ];

    const handleEdit = (trainer: AdminUser) => {
        setFormData({
            username: trainer.username,
            password: '', // Password optional on edit
            first_name: trainer.first_name || '',
            last_name: trainer.last_name || '',
            email: trainer.email,
            phone: trainer.phone || '',
            // Ensure age is set, even if 0 or null, default to undefined if truly missing
            age: (trainer.profile?.age !== undefined && trainer.profile?.age !== null) ? trainer.profile.age : undefined,
            highest_qualification: trainer.profile?.highest_qualification || 'SSC', // Default to first option if missing? Or keep empty? Let's generic it.
            // @ts-ignore
            lsgi_id: trainer.profile?.lsgi?.id || getRestrictedLsgiId(),
            // @ts-ignore
            ward_ids: trainer.profile?.wards ? trainer.profile.wards.map(w => w.id) : []
        });

        // If LSGI is set, load wards for it
        // @ts-ignore
        const lsgiId = trainer.profile?.lsgi?.id || getRestrictedLsgiId();
        if (lsgiId) {
            handleLsgiChange(lsgiId);
        }

        setEditId(trainer.id);
        setIsEditMode(true);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            if (isEditMode && editId) {
                // Update
                const payload: any = { ...formData };
                if (!payload.password) delete payload.password; // Don't send empty password

                await UserService.updateAdminUser(editId, payload);
                setSuccessModal({
                    isOpen: true,
                    title: t('common.success'),
                    message: "Trainer updated successfully!"
                });
            } else {
                // Create
                await api.post('/auth/admin-users/', {
                    ...formData,
                    role: 'LSGI_FIELD_TRAINER'
                });
                setSuccessModal({
                    isOpen: true,
                    title: t('common.success'),
                    message: "Trainer created successfully!"
                });
            }

            await loadData();
            setIsModalOpen(false);
            resetForm();
        } catch (error: any) {
            console.error("Failed to save trainer", error);
            alert("Failed to save trainer: " + (error.response?.data?.detail || JSON.stringify(error.response?.data)));
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            username: '',
            password: '',
            first_name: '',
            last_name: '',
            email: '',
            phone: '',
            age: undefined,
            highest_qualification: '',
            lsgi_id: getRestrictedLsgiId(),
            ward_ids: []
        });
        setIsEditMode(false);
        setEditId(null);
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;
        try {
            await UserService.deleteAdminUser(deleteConfirmation.id);
            setTrainers(prev => prev.filter(u => u.id !== deleteConfirmation.id));
            setPendingTrainers(prev => prev.filter(u => u.id !== deleteConfirmation.id));
            setDeleteConfirmation({ isOpen: false, id: null });
        } catch (error) {
            alert("Failed to delete trainer");
        }
    };

    // ... existing approval logic ...
    // Approval Modal State
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [trainerToApprove, setTrainerToApprove] = useState<number | null>(null);
    const [selectedApproveWardIds, setSelectedApproveWardIds] = useState<number[]>([]);
    const [isApproving, setIsApproving] = useState(false);

    const handleApproveClick = (id: number) => {
        setTrainerToApprove(id);
        setSelectedApproveWardIds([]);
        setIsApproveModalOpen(true);
    };

    const handleApproveSubmit = async () => {
        if (!trainerToApprove) return;

        setIsApproving(true);
        try {
            await UserService.approveUser(trainerToApprove, selectedApproveWardIds);
            await loadData();
            setIsApproveModalOpen(false);
            setTrainerToApprove(null);
            setSelectedApproveWardIds([]);
            setSuccessModal({
                isOpen: true,
                title: t('common.success'),
                message: "Trainer approved successfully!"
            });
        } catch (error) {
            console.error("Failed to approve trainer", error);
            alert("Failed to approve trainer");
        } finally {
            setIsApproving(false);
        }
    };

    // Filter Logic
    const currentList = activeTab === 'ACTIVE' ? trainers : pendingTrainers;
    const filteredTrainers = currentList.filter(trainer => {
        const matchesSearch = trainer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainer.first_name?.toLowerCase().includes(searchTerm.toLowerCase());

        // LSGI Filter applies to both tabs
        // But for pending trainers, we want to show them even if they don't have LSGI assigned yet? 
        // No, if master trainer selects LSGI filter, show pending ones for that LSGI.
        const matchesLsgi = selectedLsgiFilter === 'ALL' || trainer.profile?.lsgi?.id === selectedLsgiFilter;

        return matchesSearch && matchesLsgi;
    });

    // Wards for selection in Modal
    // If Master Trainer, filter wards to only those assigned to them
    const allowedWards = wards.filter(w => {
        if (user?.role === 'DISTRICT_MASTER_TRAINER' && user.profile?.wards && user.profile.wards.length > 0) {
            // @ts-ignore
            const assignedWardIds = user.profile.wards.map(aw => aw.id);
            return assignedWardIds.includes(w.id);
        }
        return true;
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">{t('common.loading')}...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('dashboard.title_manage_local_trainers') || 'Manage Local Trainers'}</h2>
                        <p className="text-sm text-gray-500">{t('dashboard.desc_manage_local_trainers') || 'Manage field trainers assigned to LSGIs'}</p>
                    </div>
                    <Button onClick={() => { resetForm(); setIsModalOpen(true); }} className="gap-2 rounded-full">
                        <Plus className="h-4 w-4" /> {t('common.add_new')}
                    </Button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('ACTIVE')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'ACTIVE'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Active Trainers
                        <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded-full text-xs">
                            {trainers.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'PENDING'
                            ? 'text-amber-600 border-b-2 border-amber-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Pending Approvals
                        {pendingTrainers.length > 0 && (
                            <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-xs">
                                {pendingTrainers.length}
                            </span>
                        )}
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={t('dashboard.search_trainers') || "Search trainers..."}
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
                        <option value="ALL">{t('dashboard.all_lsgis')}</option>
                        {lsgis.map(l => (
                            <option key={l.id} value={l.id}>{getLocalizedName(l, language)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">{t('dashboard.trainer')}</th>
                            <th className="px-4 py-3">LSGI / {t('dashboard.ward')}</th>
                            {activeTab === 'ACTIVE' && user?.role === 'DISTRICT_MASTER_TRAINER' && (
                                <>
                                    <th className="px-4 py-3 text-center">{t('dashboard.sessions')}</th>
                                    <th className="px-4 py-3 text-center">{t('dashboard.candidates')}</th>
                                </>
                            )}
                            <th className="px-4 py-3">{t('dashboard.contact')}</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">{t('common.actions')}</th>
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
                                    {trainer.profile?.lsgi ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 w-fit">
                                                {getLocalizedName(trainer.profile.lsgi, language)}
                                            </span>
                                            <div className="flex flex-wrap gap-1">
                                                {/* @ts-ignore */}
                                                {trainer.profile.wards && trainer.profile.wards.length > 0 ? (
                                                    // @ts-ignore
                                                    trainer.profile.wards.map((ward: any) => (
                                                        <span key={ward.id} className="text-xs text-gray-500 bg-gray-50 px-1 rounded border border-gray-100">
                                                            {ward.ward_number ? `${ward.ward_number}: ` : ''}{getLocalizedName(ward, language)}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">{t('dashboard.no_wards_assigned')}</span>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">{t('dashboard.unassigned')}</span>
                                    )}
                                </td>
                                {activeTab === 'ACTIVE' && user?.role === 'DISTRICT_MASTER_TRAINER' && (
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
                                        {activeTab === 'PENDING' ? (
                                            <>
                                                <button
                                                    onClick={() => handleApproveClick(trainer.id)}
                                                    className="p-1.5 text-green-600 hover:bg-green-50 rounded-full transition-colors flex items-center gap-1"
                                                    title="Approve"
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Approve</span>
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmation({ isOpen: true, id: trainer.id })}
                                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors flex items-center gap-1"
                                                    title="Reject"
                                                >
                                                    <XCircle className="h-4 w-4" />
                                                    <span className="text-xs font-medium">Reject</span>
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                {user?.role === 'DISTRICT_MASTER_TRAINER' && (
                                                    <button
                                                        onClick={() => handleViewDetails(trainer.id)}
                                                        className="text-primary-600 hover:bg-primary-50 p-2 rounded-full transition-colors"
                                                        title="View Attendees"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleEdit(trainer)}
                                                    className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition-colors"
                                                    title="Edit"
                                                >
                                                    <UserCog className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteConfirmation({ isOpen: true, id: trainer.id })}
                                                    className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredTrainers.length === 0 && (
                            <tr>
                                <td colSpan={user?.role === 'DISTRICT_MASTER_TRAINER' ? 6 : 4} className="text-center py-8 text-gray-500">
                                    {activeTab === 'ACTIVE'
                                        ? t('dashboard.no_trainers_found')
                                        : "No pending approval requests found."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Trainer Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title={isEditMode ? "Edit Field Trainer" : "Create Field Trainer"} size="2xl">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Two Column Layout for Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* Left Column: Account & Personal */}
                        <div className="space-y-6">
                            {/* Account Details */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                                <div className="flex items-center gap-2 text-primary-700 mb-2">
                                    <div className="p-1.5 bg-primary-100 rounded-lg">
                                        <UserCog className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-semibold text-sm">Account Details</h3>
                                </div>
                                <Input
                                    label={t('dashboard.username')}
                                    value={formData.username}
                                    onChange={e => setFormData({ ...formData, username: e.target.value })}
                                    required
                                    placeholder="e.g. trainer_tvm_01"
                                    disabled={isEditMode} // Disable username edit
                                />
                                {!isEditMode && (
                                    <Input
                                        label={t('dashboard.password')}
                                        type="password"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        placeholder="••••••••"
                                    />
                                )}
                                {isEditMode && (
                                    <div className="text-xs text-gray-500">
                                        Leave password blank to keep unchanged.
                                    </div>
                                )}
                            </div>

                            {/* Personal Information */}
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100">
                                <div className="flex items-center gap-2 text-primary-700 mb-2">
                                    <div className="p-1.5 bg-primary-100 rounded-lg">
                                        <Eye className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-semibold text-sm">Personal Information</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input label={t('dashboard.first_name')} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                                    <Input label={t('dashboard.last_name')} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                                </div>
                                <Input label={t('dashboard.email')} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Input label={t('dashboard.phone')} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                                    <Input label={t('dashboard.age')} type="number" value={formData.age || ''} onChange={e => setFormData({ ...formData, age: Number(e.target.value) })} required />
                                </div>
                                <Select
                                    label={t('dashboard.highest_qualification')}
                                    value={formData.highest_qualification}
                                    onChange={val => setFormData({ ...formData, highest_qualification: val })}
                                    options={QUALIFICATION_OPTIONS}
                                    required
                                />
                            </div>
                        </div>

                        {/* Right Column: Assignment */}
                        <div className="space-y-6">
                            <div className="bg-gray-50 p-4 rounded-xl space-y-4 border border-gray-100 h-full flex flex-col">
                                <div className="flex items-center gap-2 text-primary-700 mb-2">
                                    <div className="p-1.5 bg-primary-100 rounded-lg">
                                        <Search className="h-4 w-4" />
                                    </div>
                                    <h3 className="font-semibold text-sm">Assignment</h3>
                                </div>

                                {lsgis.length === 1 ? (
                                    <Input
                                        label={t('dashboard.assign_lsgi')}
                                        value={getLocalizedName(lsgis[0], language)}
                                        readOnly
                                        className="bg-white border-gray-200 text-gray-700 font-medium"
                                    />
                                ) : (
                                    <Select
                                        label={t('dashboard.assign_lsgi')}
                                        value={formData.lsgi_id || ''}
                                        onChange={val => handleLsgiChange(Number(val))}
                                        options={lsgis.map(l => ({ value: l.id, label: getLocalizedName(l, language) }))}
                                        required
                                        className="bg-white"
                                        disabled={isEditMode} // Disable LSGI change for now to simplify logic
                                    />
                                )}

                                <div className="flex-1 flex flex-col min-h-[300px]">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">{t('dashboard.assign_wards_optional')}</label>
                                        <div className="text-xs space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, ward_ids: allowedWards.map(w => w.id) }))}
                                                className="text-primary-600 hover:text-primary-700 font-medium"
                                            >
                                                Select All
                                            </button>
                                            <span className="text-gray-300">|</span>
                                            <button
                                                type="button"
                                                onClick={() => setFormData(prev => ({ ...prev, ward_ids: [] }))}
                                                className="text-gray-500 hover:text-gray-700"
                                            >
                                                Clear
                                            </button>
                                        </div>
                                    </div>

                                    <div className="border border-gray-200 rounded-lg p-1 bg-white flex-1 overflow-y-auto max-h-[400px]">
                                        {allowedWards.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                                                <div className="text-gray-300 mb-2">
                                                    <Search className="h-8 w-8 mx-auto" />
                                                </div>
                                                <p className="text-sm text-gray-500 font-medium">
                                                    {wards.length > 0
                                                        ? "No wards available in your assignment range."
                                                        : t('dashboard.select_lsgi_first')}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-1 p-1">
                                                {allowedWards.map(w => {
                                                    const isSelected = formData.ward_ids.includes(w.id);
                                                    return (
                                                        <div
                                                            key={w.id}
                                                            onClick={() => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    ward_ids: isSelected
                                                                        ? prev.ward_ids.filter(id => id !== w.id)
                                                                        : [...prev.ward_ids, w.id]
                                                                }));
                                                            }}
                                                            className={`
                                                                cursor-pointer rounded-md p-2 text-sm border transition-all flex items-start gap-2
                                                                ${isSelected
                                                                    ? 'bg-primary-50 border-primary-200'
                                                                    : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                                                                }
                                                            `}
                                                        >
                                                            <div className={`
                                                                w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors
                                                                ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white'}
                                                            `}>
                                                                {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className={`font-semibold text-xs ${isSelected ? 'text-primary-800' : 'text-gray-900'}`}>Ward {w.ward_number}</span>
                                                                <span className={`text-xs leading-tight ${isSelected ? 'text-primary-600' : 'text-gray-500'}`}>{getLocalizedName(w, language)}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 text-center bg-yellow-50 p-2 rounded border border-yellow-100">
                                        {formData.ward_ids.length} wards selected
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button type="button" variant="outline" size="lg" onClick={() => { setIsModalOpen(false); resetForm(); }}>{t('common.cancel')}</Button>
                        <Button type="submit" isLoading={isSaving} size="lg" className="px-8">
                            {isEditMode ? "Save Changes" : "Create Trainer"}
                        </Button>
                    </div>
                </form>
            </Modal>


            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title={t('dashboard.confirm_delete_trainer')}
                message={t('dashboard.warning_delete_trainer')}
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

            {/* Approve Modal */}
            <Modal isOpen={isApproveModalOpen} onClose={() => setIsApproveModalOpen(false)} title="Approve & Assign Wards" size="md">
                <div className="space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                        Please assign wards to this trainer before approving. If no wards are selected, the trainer will be approved without specific ward assignments.
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-medium text-gray-700">Select Wards to Assign</label>
                            <div className="text-xs space-x-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedApproveWardIds(allowedWards.map(w => w.id))}
                                    className="text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Select All
                                </button>
                                <span className="text-gray-300">|</span>
                                <button
                                    type="button"
                                    onClick={() => setSelectedApproveWardIds([])}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-1 bg-white max-h-[300px] overflow-y-auto">
                            {allowedWards.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    No wards available for assignment.
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-1 p-1">
                                    {allowedWards.map(w => {
                                        const isSelected = selectedApproveWardIds.includes(w.id);
                                        return (
                                            <div
                                                key={w.id}
                                                onClick={() => {
                                                    setSelectedApproveWardIds(prev =>
                                                        isSelected ? prev.filter(id => id !== w.id) : [...prev, w.id]
                                                    );
                                                }}
                                                className={`
                                                    cursor-pointer rounded-md p-2 text-sm border transition-all flex items-start gap-2
                                                    ${isSelected
                                                        ? 'bg-primary-50 border-primary-200'
                                                        : 'hover:bg-gray-50 border-transparent hover:border-gray-100'
                                                    }
                                                `}
                                            >
                                                <div className={`
                                                    w-4 h-4 rounded border flex items-center justify-center mt-0.5 flex-shrink-0 transition-colors
                                                    ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-gray-300 bg-white'}
                                                `}>
                                                    {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className={`font-semibold text-xs ${isSelected ? 'text-primary-800' : 'text-gray-900'}`}>Ward {w.ward_number}</span>
                                                    <span className={`text-xs leading-tight ${isSelected ? 'text-primary-600' : 'text-gray-500'}`}>{getLocalizedName(w, language)}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 text-right">
                            {selectedApproveWardIds.length} wards selected
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <Button variant="outline" onClick={() => setIsApproveModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button onClick={handleApproveSubmit} isLoading={isApproving} className="px-6">
                            Approve & Assign
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* View Details Modal */}
            <Modal isOpen={!!selectedTrainerId} onClose={() => setSelectedTrainerId(null)} title={t('dashboard.uploaded_candidates')} size="lg">
                <div className="space-y-6">
                    {isLoadingDetails ? (
                        <div className="text-center py-8 text-gray-500">{t('common.loading')}...</div>
                    ) : (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold text-gray-900">{t('dashboard.uploaded_candidates')}</h3>
                                {attendeeDetails && attendeeDetails.length > 0 && (
                                    <Button
                                        onClick={() => {
                                            // Simple CSV Export
                                            const headers = ["Name", "Phone", "Age", "Session", "Date"];
                                            const csvContent = [
                                                headers.join(","),
                                                ...attendeeDetails.map(row => [
                                                    `"${row.name || ''}"`,
                                                    `"${row.phone || ''}"`,
                                                    `"${row.age || ''}"`,
                                                    `"${row.session_name || ''}"`,
                                                    `"${new Date(row.date).toLocaleDateString()}"`
                                                ].join(","))
                                            ].join("\n");

                                            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                                            const url = URL.createObjectURL(blob);
                                            const link = document.createElement("a");
                                            link.setAttribute("href", url);
                                            link.setAttribute("download", `candidates_trainer_${selectedTrainerId}.csv`);
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        variant="outline"
                                        size="sm"
                                        className="gap-2"
                                    >
                                        <div className="h-4 w-4 rotate-180">↓</div>
                                        {t('dashboard.download_list')}
                                    </Button>
                                )}
                            </div>

                            <div className="overflow-x-auto border rounded-lg max-h-96">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase sticky top-0">
                                        <tr>
                                            <th className="px-4 py-2">{t('dashboard.name')}</th>
                                            <th className="px-4 py-2">{t('dashboard.phone')}</th>
                                            <th className="px-4 py-2">{t('dashboard.age')}</th>
                                            <th className="px-4 py-2">{t('dashboard.session')}</th>
                                            <th className="px-4 py-2">{t('dashboard.date')}</th>
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
                                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                                    {t('dashboard.no_candidates_found')}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <div className="flex justify-end pt-4">
                                <Button onClick={() => setSelectedTrainerId(null)} variant="outline">
                                    {t('dashboard.close')}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </Modal>
        </div>
    );
};
