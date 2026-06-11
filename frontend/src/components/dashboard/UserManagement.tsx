
import React, { useState, useEffect } from 'react';
import { UserService, type AdminUser } from '../../services/userService';
import { LocationService, type District } from '../../services/locationService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Plus, Trash2, UserCog } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getLocalizedName } from '../../utils/languageUtils';

interface UserManagementProps {
    roleType: 'LSGD_STATE_ADMIN' | 'LSGD_DISTRICT_ADMIN';
    title: string;
    readOnly?: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({ roleType, title, readOnly = false }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; id: number | null }>({ isOpen: false, id: null });
    const { t, language } = useLanguage();

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        phone: '',
        password: '',
        first_name: '',
        last_name: '',
        district_id: undefined as number | undefined
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [uData, dData] = await Promise.all([
                UserService.getAdminUsers(roleType),
                LocationService.getDistricts()
            ]);
            setUsers(uData);
            setDistricts(dData);
        } catch (error) {
            console.error("Failed to load users", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await UserService.createAdminUser(formData);
            await loadData(); // Reload list
            setIsModalOpen(false);
            setFormData({
                username: '',
                email: '',
                phone: '',
                password: '',
                first_name: '',
                last_name: '',
                district_id: undefined
            });
        } catch (error: any) {
            alert(`${t('dashboard.error_create_user')}: ` + (error.response?.data?.detail || JSON.stringify(error.response?.data)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirmation.id) return;
        try {
            await UserService.deleteAdminUser(deleteConfirmation.id);
            setUsers(prev => prev.filter(u => u.id !== deleteConfirmation.id));
            setDeleteConfirmation({ isOpen: false, id: null });
        } catch (error) {
            alert(t('dashboard.error_delete_user'));
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">{t('dashboard.manage_access')} {roleType === 'LSGD_STATE_ADMIN' ? t('dashboard.state') : t('dashboard.district')} {t('dashboard.level')}</p>
                </div>
                {!readOnly && (
                    roleType === 'LSGD_STATE_ADMIN' && users.length > 0 ? (
                        <div className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                            {t('dashboard.single_account_limit')}
                        </div>
                    ) : (
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" /> {t('dashboard.add_new')}
                        </Button>
                    )
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">{t('dashboard.username')}</th>
                            <th className="px-4 py-3">{t('dashboard.role')}</th>
                            <th className="px-4 py-3">{t('dashboard.contact')}</th>
                            {roleType === 'LSGD_DISTRICT_ADMIN' && <th className="px-4 py-3">{t('dashboard.assigned_district')}</th>}
                            {!readOnly && <th className="px-4 py-3 rounded-r-lg text-right">{t('dashboard.actions')}</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-[#193756] text-white flex items-center justify-center">
                                            <UserCog className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.username}</p>
                                            <p className="text-xs text-gray-500">{user.first_name} {user.last_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-[#193756]/10 text-[#193756] px-2 py-1 rounded-md text-xs font-medium">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    <div>{user.email}</div>
                                    <div className="text-xs">{user.phone}</div>
                                </td>
                                {roleType === 'LSGD_DISTRICT_ADMIN' && (
                                    <td className="px-4 py-3 text-gray-600">
                                        {user.profile?.district ? getLocalizedName(user.profile.district, language) : '-'}
                                    </td>
                                )}
                                {!readOnly && (
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            onClick={() => setDeleteConfirmation({ isOpen: true, id: user.id })}
                                            className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors"
                                            title={t('common.delete')}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">{t('dashboard.no_data')}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`${t('dashboard.create_user')}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={t('dashboard.username')} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        <Input label={t('dashboard.phone')} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label={t('dashboard.first_name')} value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                        <Input label={t('dashboard.last_name')} value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                    </div>
                    <Input label={t('dashboard.email')} type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />

                    {roleType === 'LSGD_DISTRICT_ADMIN' && (
                        <div>
                            <Select
                                label={t('dashboard.assign_district')}
                                value={formData.district_id || ''}
                                onChange={val => setFormData({ ...formData, district_id: Number(val) })}
                                options={districts.map(d => ({ value: d.id, label: getLocalizedName(d, language) }))}
                                required
                            />
                        </div>
                    )}

                    <Input label={t('dashboard.password')} type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder={t('dashboard.placeholder_password')} />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>{t('common.cancel')}</Button>
                        <Button type="submit" isLoading={isSaving}>{t('dashboard.create_user')}</Button>
                    </div>
                </form>
            </Modal>

            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={() => setDeleteConfirmation({ isOpen: false, id: null })}
                onConfirm={handleDelete}
                title={t('common.confirm_delete')}
                message={t('dashboard.warning_delete_user')}
                variant="danger"
            />
        </div>
    );
};
