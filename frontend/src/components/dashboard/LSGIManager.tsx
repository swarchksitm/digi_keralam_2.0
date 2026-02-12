import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store';

import { getLSGINames } from '../../data/lsgi_master';
import { LocationService, type LSGI, type District, type Block } from '../../services/locationService';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

export const LSGIManager: React.FC = () => {
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
                : "Failed to save changes. Please try again.";
            alert(`Error: ${errorMsg}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this LSGI?")) return;
        try {
            await LocationService.deleteLSGI(id);
            setLsgis(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error("Failed to delete", error);
            alert("Failed to delete LSGI.");
        }
    };

    // Derived helpers for display
    const getDistrictName = (id: number) => districts.find(d => d.id === id)?.name || id;
    const getBlockName = (id: number | null) => blocks.find(b => b.id === id)?.name || '-';

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

    const filteredLSGIs = lsgis.filter(item => {
        // Search term override
        if (searchTerm) {
            return item.name.toLowerCase().includes(searchTerm.toLowerCase());
        }

        // Strict Drill-down
        if (selectedDistrict && item.district !== selectedDistrict) return false;
        if (selectedType && item.lsgi_type !== selectedType) return false;

        return true;
    });

    // Unified Render
    if (isLoading) {
        return <div className="py-8 text-center text-gray-500">Loading LSGD Data...</div>;
    }

    const availableBlocks = blocks.filter(b => b.district === Number(formData.district));

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col mb-6 gap-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Manage LSGIs</h2>
                        <p className="text-sm text-gray-500">Add, edit, or remove Local Self Govt Institutions</p>
                    </div>
                    <Button onClick={() => handleOpenModal()} className="rounded-full gap-2">
                        <Plus className="h-4 w-4" /> Add New
                    </Button>
                </div>


                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-4 rounded-xl">
                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">1. Select District</label>
                        <select
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 py-2 text-sm disabled:bg-gray-200 disabled:text-gray-500"
                            value={selectedDistrict || ''}
                            onChange={(e) => {
                                setSelectedDistrict(Number(e.target.value));
                                setSelectedType(''); // Reset type when district changes
                            }}
                            disabled={user?.role === 'LSGD_DISTRICT_ADMIN' || user?.role === 'DISTRICT_MASTER_TRAINER'}
                        >
                            <option value="">-- Choose District --</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>

                    </div>

                    <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">2. Select Type</label>
                        <select
                            className="w-full rounded-lg border-gray-300 focus:ring-primary-500 py-2 text-sm"
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value as any)}
                            disabled={!selectedDistrict}
                        >
                            <option value="">-- Choose Type --</option>
                            <option value="GP">Grama Panchayat</option>
                            <option value="MUNICIPALITY">Municipality</option>
                            <option value="CORPORATION">Corporation</option>
                            <option value="BP">Block Panchayat</option>
                            <option value="DP">District Panchayat</option>
                        </select>
                    </div>
                </div>

                {/* Search Fallback */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Or search by name directly..."
                        className="pl-9 pr-4 py-2 w-full rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                {(!filteredLSGIs.length && !searchTerm && (!selectedDistrict)) ? (
                    <div className="flex flex-col items-center justify-center h-40 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                        <p>Please select a **District** to view LSGIs.</p>
                    </div>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                            <tr>
                                <th className="px-4 py-3 rounded-l-lg">Name</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">District</th>
                                <th className="px-4 py-3">Block</th>
                                <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredLSGIs.map(item => (
                                <tr key={item.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{item.name}</span>
                                            {item.admin_info && (
                                                <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                    Admin: {item.admin_info.username} ({item.admin_info.phone})
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                                        ${item.lsgi_type === 'GP' ? 'bg-green-50 text-green-700' :
                                                item.lsgi_type === 'MUNICIPALITY' ? 'bg-blue-50 text-blue-700' :
                                                    'bg-purple-50 text-purple-700'}`}>
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
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredLSGIs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                                        No LSGIs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Edit LSGI' : 'Add New LSGI'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-4">

                        {/* 1. District */}
                        <div>
                            <Select
                                label="District"
                                value={formData.district || ''}
                                onChange={(val) => setFormData({ ...formData, district: Number(val) })}
                                options={districts.map(d => ({ value: d.id, label: d.name }))}
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
                                    { value: 'GP', label: 'Grama Panchayat' },
                                    { value: 'MUNICIPALITY', label: 'Municipality' },
                                    { value: 'CORPORATION', label: 'Corporation' }
                                ]}
                            />
                        </div>

                        {/* 3. Name */}
                        <div>
                            {availableLSGINames.length > 0 ? (
                                <Select
                                    label="LSGI Name"
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
                                    label="LSGI Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="Enter Name (e.g., Thiruvananthapuram Corporation)"
                                />
                            )}

                            {/* Manual Entry Fallback - Improved Logic */}
                            {(!availableLSGINames.includes(formData.name!) && availableLSGINames.length > 0) && (
                                <Input
                                    className="mt-2"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Type Custom Name..."
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* 4. Block (Conditional) */}
                        <div>
                            <Select
                                label="Block (Optional)"
                                value={formData.block || ''}
                                onChange={(val) => setFormData({ ...formData, block: val ? Number(val) : undefined })}
                                disabled={!formData.district}
                                options={[
                                    { value: '', label: 'None (e.g. for Corporation)' },
                                    ...availableBlocks.map(b => ({ value: b.id, label: b.name }))
                                ]}
                            />
                        </div>

                        {/* 5. Admin Credentials */}
                        <div className="pt-4 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-900 mb-3">
                                {editingItem ? 'LSGI Admin Details (Read Only)' : 'LSGI Admin Credentials'}
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Input
                                    label="Admin Username"
                                    value={formData.admin_username}
                                    onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                                    placeholder={editingItem ? "No Admin Assigned" : "e.g. tvm_corp_admin"}
                                    disabled={!!editingItem}
                                />
                                <Input
                                    label="Admin Phone"
                                    value={formData.admin_phone}
                                    onChange={(e) => setFormData({ ...formData, admin_phone: e.target.value })}
                                    placeholder={editingItem ? "N/A" : "Mobile Number"}
                                    disabled={!!editingItem}
                                />
                                <div className="sm:col-span-2">
                                    <Input
                                        label="Admin Password"
                                        type="password"
                                        value={editingItem ? "********" : formData.admin_password}
                                        onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                                        placeholder={editingItem ? "********" : "Set a strong password"}
                                        disabled={!!editingItem}
                                    />
                                    {editingItem && (
                                        <p className="text-xs text-gray-400 mt-1">
                                            Password is hidden for security. Admin details cannot be edited here.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isSaving}>
                            {editingItem ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
