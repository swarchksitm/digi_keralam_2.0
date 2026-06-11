
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedName } from '../../utils/languageUtils';

import { getLSGINames } from '../../data/lsgi_master';
import { LocationService, type LSGI, type District, type Block } from '../../services/locationService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import { ConfirmationModal } from '../ui/ConfirmationModal';

export const LSGIManager: React.FC = () => {
    const { t, language } = useLanguage();
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });

    // Auth Context for Role-Based Locking
    const { user } = useAuthStore();

    useEffect(() => {
        if ((user?.role === 'LSGD_DISTRICT_ADMIN' || user?.role === 'DISTRICT_MASTER_TRAINER') && user.profile?.district) {
            // Handle if district is object (depth=1 from serializer) or ID
            const dist = user.profile.district;
            let distId: number | undefined;

            if (typeof dist === 'object' && dist !== null && 'id' in dist) {
                distId = (dist as any).id;
            } else if (typeof dist === 'number') {
                distId = dist;
            }

            if (distId) {
                console.log("Auto-selecting district:", distId);
                setSelectedDistrict(distId);
            }
        }
    }, [user]);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<LSGI | null>(null);
    const [formData, setFormData] = useState<Partial<LSGI> & {
        admin_username?: string;
        admin_password?: string;
        admin_phone?: string;
    }>({
        name: '',
        lsgi_type: 'GP',
        district: undefined,
        block: undefined, // Block can be null for Corporations
        admin_username: '',
        admin_password: '',
        admin_phone: ''
    });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        setIsLoading(true);
        try {
            const [dData, bData, lData] = await Promise.all([
                LocationService.getDistricts(),
                LocationService.getBlocks(),
                LocationService.getLSGIs()
            ]);
            setDistricts(dData);
            setBlocks(bData);
            setLsgis(lData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (item?: LSGI) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                lsgi_type: item.lsgi_type,
                district: item.district,
                block: item.block || undefined,
                admin_username: item.admin_info?.username || '',
                admin_phone: item.admin_info?.phone || '',
                admin_password: '' // Password cannot be retrieved
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                lsgi_type: selectedType ? (selectedType as any) : 'GP',
                district: selectedDistrict ? selectedDistrict : (districts.length > 0 ? districts[0].id : undefined),
                block: undefined,
                admin_username: '',
                admin_password: '',
                admin_phone: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                district: Number(formData.district),
                block: formData.block ? Number(formData.block) : null
            };

            let responseItem: LSGI;
            if (editingItem) {
                responseItem = await LocationService.updateLSGI(editingItem.id, payload);
                setLsgis(prev => prev.map(item => item.id === responseItem.id ? responseItem : item));
            } else {
                responseItem = await LocationService.createLSGI(payload);
                setLsgis(prev => [responseItem, ...prev]);
            }

            // Optional: Re-fetch only if needed, but optimistic update is faster
            // const lData = await LocationService.getLSGIs();
            // setLsgis(lData);

            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Failed to save", error);
            const errorMsg = error.response?.data
                ? JSON.stringify(error.response.data)
                : t('dashboard.error_save_lsgi');
            alert(`${t('common.error')}: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;
        try {
            await LocationService.deleteLSGI(deleteConfirmation.id);
            setLsgis(prev => prev.filter(item => item.id !== deleteConfirmation.id));
            setDeleteConfirmation({ isOpen: false, id: null });
        } catch (error) {
            console.error("Failed to delete", error);
            alert(t('dashboard.error_delete_lsgi'));
        }
    };

    // Derived helpers for display
    const getDistrictName = (id: number) => {
        const d = districts.find(d => d.id === id);
        return d ? getLocalizedName(d, language) : id;
    };
    const getBlockName = (id: number | null) => {
        const b = blocks.find(b => b.id === id);
        return b ? getLocalizedName(b, language) : '-';
    };

    // Helper to get district name string for Master List lookup
    const getDistrictNameStr = (id: number) => districts.find(d => d.id === id)?.name || '';


    // Calculate available names based on selection
    const districtNameStr = getDistrictNameStr(Number(formData.district));
    console.log('DEBUG: DM Selection:', {
        id: formData.district,
        name: districtNameStr,
        type: formData.lsgi_type
    });

    const availableLSGINames = formData.district && formData.lsgi_type
        ? getLSGINames(districtNameStr, formData.lsgi_type)
        : [];

    console.log('DEBUG: Available Names:', availableLSGINames.length);


    // State for Filter Drill-down
    const [selectedDistrict, setSelectedDistrict] = useState<number | undefined>(undefined);
    const [selectedType, setSelectedType] = useState<LSGI['lsgi_type'] | ''>('');
    const [activeTab, setActiveTab] = useState<'PENDING' | 'ASSIGNED'>('PENDING');

    const filteredLSGIs = lsgis.filter(item => {
        // Tab Filter
        if (activeTab === 'PENDING' && item.admin_info) return false;
        if (activeTab === 'ASSIGNED' && !item.admin_info) return false;

        // Search term override
        if (searchTerm) {
            return getLocalizedName(item, language).toLowerCase().includes(searchTerm.toLowerCase());
        }

        // Strict Drill-down
        if (selectedDistrict && item.district !== selectedDistrict) return false;
        if (selectedType && item.lsgi_type !== selectedType) return false;

        return true;
    });

    // Unified Render
    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">{t('common.loading')}</div>;
    }

    const availableBlocks = blocks.filter(b => b.district === Number(formData.district));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col mb-6 gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('dashboard.title_manage_lsgis')}</h2>
                        <p className="text-sm text-gray-500">{t('dashboard.desc_manage_lsgis_sub')}</p>
                    </div>
                    {/* Only show Add New if NOT District Admin, or if District Admin needs to create manual LSGIs */}
                    <Button onClick={() => handleOpenModal()} className="rounded-full gap-2">
                        <Plus className="h-4 w-4" /> {t('common.add_new')}
                    </Button>
                </div>


                {/* Tabs for Filtering */}
                <div className="flex border-b border-gray-100 mb-6">
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'PENDING'
                            ? 'text-amber-600 border-b-2 border-amber-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('dashboard.pending_lsgis')}
                        <span className={`py-0.5 px-2 rounded-full text-xs ${activeTab === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                            {lsgis.filter(l => !l.admin_info).length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('ASSIGNED')}
                        className={`pb-3 px-4 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeTab === 'ASSIGNED'
                            ? 'text-primary-600 border-b-2 border-primary-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        {t('dashboard.assigned_lsgis')}
                        <span className={`py-0.5 px-2 rounded-full text-xs ${activeTab === 'ASSIGNED' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-600'}`}>
                            {lsgis.filter(l => l.admin_info).length}
                        </span>
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('dashboard.select_district')}</label>
                        <select
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 py-2 text-sm disabled:bg-gray-200 disabled:text-gray-500"
                            value={selectedDistrict || ''}
                            onChange={(e) => {
                                setSelectedDistrict(Number(e.target.value));
                                setSelectedType(''); // Reset type when district changes
                            }}
                            disabled={user?.role === 'LSGD_DISTRICT_ADMIN' || user?.role === 'DISTRICT_MASTER_TRAINER'}
                        >
                            <option value="">{t('dashboard.choose_district')}</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{getLocalizedName(d, language)}</option>
                            ))}
                        </select>

                    </div>

                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">{t('dashboard.select_type')}</label>
                        <select
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 py-2 text-sm"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as any)}
                            disabled={!selectedDistrict}
                        >
                            <option value="">{t('dashboard.choose_type')}</option>
                            <option value="GP">Grama Panchayat</option>
                            <option value="MUNICIPALITY">Municipality</option>
                            <option value="CORPORATION">Corporation</option>
                            <option value="BP">Block Panchayat</option>
                            <option value="DP">District Panchayat</option>
                        </select>
                    </div>
                </div>

                {/* Search Fallback */}
                <div className="relative mt-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder={t('dashboard.search_placeholder')}
                        className="pl-9 pr-4 py-2 w-full rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                {!filteredLSGIs.length ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        {(!searchTerm && !selectedDistrict) ? (
                            <p>{t('dashboard.select_district_view')}</p>
                        ) : (
                            <p>{t('dashboard.no_lsgis_found')}</p>
                        )}
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Name</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">District</th>
                                <th className="px-4 py-3">Block</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">{t('common.actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLSGIs.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{getLocalizedName(item, language)}</span>
                                            {item.admin_info ? (
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Admin: {item.admin_info.username}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                                    Pending Admin Allocation
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                                        ${item.lsgi_type === 'GP' ? 'bg-[#4edb80]/10 text-[#15803d]' :
                                                item.lsgi_type === 'MUNICIPALITY' ? 'bg-[#193756]/10 text-[#193756]' :
                                                    'bg-[#193756]/10 text-[#193756]'}`}>
                                            {item.lsgi_type}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{getDistrictName(item.district)}</td>
                                    <td className="px-4 py-3 text-gray-400">{getBlockName(item.block)}</td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenModal(item)}
                                                className="p-1.5 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                                                title={item.admin_info ? "Edit Details" : "Allocate Admin"}
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => setDeleteConfirmation({ isOpen: true, id: item.id })}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? t('dashboard.title_edit_lsgi') : t('dashboard.title_add_lsgi')}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-4">

                        {/* 1. District */}
                        <div>
                            <Select
                                label="District"
                                value={formData.district || ''}
                                onChange={(val) => setFormData({ ...formData, district: Number(val) })}
                                options={districts.map(d => ({ value: d.id, label: getLocalizedName(d, language) }))}
                                required
                            />
                        </div>

                        {/* 2. Type */}
                        <div>
                            <Select
                                label="Type"
                                value={formData.lsgi_type || 'GP'}
                                onChange={(val) => setFormData({ ...formData, lsgi_type: val as any })}
                                options={[
                                    { value: 'GP', label: t('dashboard.type_gp') },
                                    { value: 'MUNICIPALITY', label: t('dashboard.type_municipality') },
                                    { value: 'CORPORATION', label: t('dashboard.type_corporation') }
                                ]}
                            />
                        </div>

                        {/* 3. Name */}
                        <div>
                            {availableLSGINames.length > 0 ? (
                                <Select
                                    label={t('dashboard.label_lsgi_name')}
                                    value={availableLSGINames.includes(formData.name!) ? formData.name! : (formData.name ? 'OTHER' : '')}
                                    onChange={(val) => {
                                        setFormData({ ...formData, name: val === 'OTHER' ? '' : String(val) });
                                    }}
                                    required
                                    options={[
                                        ...availableLSGINames.map(name => ({ value: name, label: name })),
                                        { value: 'OTHER', label: 'Other (Type Manually)' }
                                    ]}
                                />
                            ) : (
                                <Input
                                    label={t('dashboard.label_lsgi_name')}
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder={t('dashboard.placeholder_lsgi_name')}
                                />
                            )}

                            {/* Manual Entry Fallback - Improved Logic */}
                            {(!availableLSGINames.includes(formData.name!) && availableLSGINames.length > 0) && (
                                <Input
                                    className="mt-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder={t('dashboard.type_custom_name')}
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* 4. Block (Conditional) */}
                        <div>
                            <Select
                                label={t('dashboard.label_block_optional')}
                                value={formData.block || ''}
                                onChange={(val) => setFormData({ ...formData, block: val ? Number(val) : undefined })}
                                disabled={!formData.district}
                                options={[
                                    { value: '', label: t('dashboard.option_none_corporation') },
                                    ...availableBlocks.map(b => ({ value: b.id, label: getLocalizedName(b, language) }))
                                ]}
                            />
                        </div>

                        {/* 5. Admin Credentials */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                {editingItem ? t('dashboard.admin_details_readonly') : t('dashboard.admin_credentials')}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label={t('dashboard.label_admin_username')}
                                    value={formData.admin_username}
                                    onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                                    placeholder={editingItem ? t('dashboard.placeholder_no_admin') : "e.g. tvm_corp_admin"}
                                    disabled={!!editingItem}
                                />
                                <Input
                                    label={t('dashboard.label_admin_phone')}
                                    value={formData.admin_phone}
                                    onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                                    placeholder={editingItem ? "N/A" : t('dashboard.placeholder_mobile')}
                                    disabled={!!editingItem}
                                />
                                <div className="sm:col-span-2">
                                    <Input
                                        label={t('dashboard.label_admin_password')}
                                        type="password"
                                        value={editingItem ? "********" : formData.admin_password}
                                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                        placeholder={editingItem ? "********" : t('dashboard.placeholder_set_password')}
                                        disabled={!!editingItem}
                                    />
                                    {editingItem && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            {t('dashboard.text_password_hidden')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            {t('common.cancel')}
                        </Button>
                        <Button type="submit" isLoading={isSaving}>
                            {editingItem ? t('common.edit') : t('common.create')}
                        </Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title={t('dashboard.confirm_delete_lsgi')}
                message={t('dashboard.warning_delete_lsgi')}
                variant="danger"
            />
        </div>
    );
};
