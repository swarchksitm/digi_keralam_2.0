import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../auth/store';
import { User, Mail, Phone, MapPin, Building, Shield } from 'lucide-react';
import { Button } from '../components/ui/Button';

const ProfileField: React.FC<{ icon: any, label: string, value?: string | null }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
        <div className="p-2 bg-white rounded-md shadow-sm text-primary-600">
            <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">{value || 'Not provided'}</p>
        </div>
    </div>
);

const Profile: React.FC = () => {
    const { user, updateProfile } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                phone: user.phone || ''
            });
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await updateProfile({
                first_name: formData.first_name,
                last_name: formData.last_name,
                phone: formData.phone
            });
            setSuccess('Profile updated successfully!');
            setIsEditing(false);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <p>Please log in to view profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
            <Navbar />

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage your account settings and personal information</p>
                        </div>
                        <div className="flex gap-2">
                            {isEditing ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setError('');
                                            setSuccess('');
                                            // Reset form
                                            setFormData({
                                                first_name: user.first_name || '',
                                                last_name: user.last_name || '',
                                                phone: user.phone || ''
                                            });
                                        }}
                                        disabled={isLoading}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={handleSave}
                                        isLoading={isLoading}
                                    >
                                        Save Changes
                                    </Button>
                                </>
                            ) : (
                                <Button
                                    variant="outline"
                                    onClick={() => setIsEditing(true)}
                                >
                                    Edit Profile
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="p-4 rounded-md bg-red-50 text-red-700 text-sm border border-red-200">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="p-4 rounded-md bg-green-50 text-green-700 text-sm border border-green-200">
                            {success}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* User Card */}
                        <div className="md:col-span-1">
                            <Card className="h-full">
                                <CardContent className="pt-6 flex flex-col items-center text-center">
                                    <div className="h-24 w-24 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-3xl font-bold mb-4 shadow-inner">
                                        {user.first_name?.charAt(0) || user.username.charAt(0)}
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">{user.first_name} {user.last_name}</h2>
                                    <p className="text-sm text-gray-500 mb-4">@{user.username}</p>

                                    <div className="w-full pt-4 border-t border-gray-100">
                                        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
                                            <Shield className="h-3 w-3 mr-1.5" />
                                            {user.role?.replace(/_/g, ' ')}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Details */}
                        <div className="md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {isEditing ? (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.first_name}
                                                    onChange={handleInputChange}
                                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.last_name}
                                                    onChange={handleInputChange}
                                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                                <input
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                                />
                                            </div>
                                            {/* Read Only Fields during Edit */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-500">Username (Read-only)</label>
                                                <input
                                                    type="text"
                                                    value={user.username}
                                                    disabled
                                                    className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-500">Email (Read-only)</label>
                                                <input
                                                    type="text"
                                                    value={user.email}
                                                    disabled
                                                    className="flex h-10 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <ProfileField icon={User} label="Username" value={user.username} />
                                            <ProfileField icon={Mail} label="Email Address" value={user.email} />
                                            <ProfileField icon={Phone} label="Phone Number" value={user.phone || "Not provided"} />
                                            <ProfileField icon={MapPin} label="District" value="Thiruvananthapuram" />
                                            <ProfileField icon={Building} label="LSGI" value="Trivandrum Corporation" />
                                            <ProfileField icon={MapPin} label="Ward" value="Ward 12" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
