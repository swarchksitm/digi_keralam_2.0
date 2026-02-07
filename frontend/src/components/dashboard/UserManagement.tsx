
import React, { useState, useEffect } from 'react';
import { UserService, type AdminUser } from '../../services/userService';
import { LocationService, type District } from '../../services/locationService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Plus, Trash2, UserCog } from 'lucide-react';

interface UserManagementProps {
    roleType: 'LSGD_STATE_ADMIN' | 'LSGD_DISTRICT_ADMIN';
    title: string;
    readOnly?: boolean;
}

export const UserManagement: React.FC<UserManagementProps> = ({ roleType, title, readOnly = false }) => {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

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
        setIsLoading(true);
        try {
            const [uData, dData] = await Promise.all([
                UserService.getAdminUsers(roleType),
                LocationService.getDistricts()
            ]);
            setUsers(uData);
            setDistricts(dData);
        } catch (error) {
            console.error("Failed to load users", error);
        } finally {
            setIsLoading(false);
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
            alert("Failed to create user: " + (error.response?.data?.detail || JSON.stringify(error.response?.data)));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure?")) return;
        try {
            await UserService.deleteAdminUser(id);
            setUsers(prev => prev.filter(u => u.id !== id));
        } catch (error) {
            alert("Failed to delete user");
        }
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <p className="text-sm text-gray-500">Manage access for {roleType === 'LSGD_STATE_ADMIN' ? 'State' : 'District'} Level</p>
                </div>
                {!readOnly && (
                    roleType === 'LSGD_STATE_ADMIN' && users.length > 0 ? (
                        <div className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
                            Single Account Limit Reached
                        </div>
                    ) : (
                        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
                            <Plus className="h-4 w-4" /> Add New
                        </Button>
                    )
                )}
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">User</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Contact</th>
                            {roleType === 'LSGD_DISTRICT_ADMIN' && <th className="px-4 py-3">Assigned District</th>}
                            {!readOnly && <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center">
                                            <UserCog className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.username}</p>
                                            <p className="text-xs text-gray-500">{user.first_name} {user.last_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-medium">
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    <div>{user.email}</div>
                                    <div className="text-xs">{user.phone}</div>
                                </td>
                                {roleType === 'LSGD_DISTRICT_ADMIN' && (
                                    <td className="px-4 py-3 text-gray-600">
                                        {user.profile?.district?.name || '-'}
                                    </td>
                                )}
                                {!readOnly && (
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => handleDelete(user.id)} className="text-red-500 hover:bg-red-50 p-2 rounded-full">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center py-8 text-gray-500">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Create ${title}`}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Username" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required />
                        <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="First Name" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                        <Input label="Last Name" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} required />
                    </div>
                    <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />

                    {roleType === 'LSGD_DISTRICT_ADMIN' && (
                        <div>
                            <Select
                                label="Assign District"
                                value={formData.district_id || ''}
                                onChange={val => setFormData({ ...formData, district_id: Number(val) })}
                                options={districts.map(d => ({ value: d.id, label: d.name }))}
                                required
                            />
                        </div>
                    )}

                    <Input label="Password" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder="Set strong password" />

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>Create User</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
