import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { SessionList } from '../../components/dashboard/SessionList';
import { StatsCard } from '../../components/dashboard/StatsCard'; // Ensure this is exported
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import api from '../../api/client';
import type { TrainingSession } from '../../types/session';
import { Calendar, Users, CheckSquare, Upload, FileSpreadsheet, MapPin, Home } from 'lucide-react';
import { useAuthStore } from '../../auth/store';

const TrainerDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [loading, setLoading] = useState(true);

    // Upload Modal State
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const response = await api.get('/training/sessions/');
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, []);

    // Analytics Calculations
    const totalSessions = sessions.length;
    const totalAttendees = sessions.reduce((sum, s) => sum + (s.attendees_count || 0), 0);
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;

    const handleOpenUpload = (sessionId: number) => {
        setSelectedSessionId(sessionId);
        setUploadFile(null);
        setIsUploadModalOpen(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadFile(e.target.files[0]);
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !selectedSessionId) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('session_id', selectedSessionId.toString());

        try {
            await api.post('/training/attendance/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('Attendees uploaded successfully!');
            setIsUploadModalOpen(false);
            fetchSessions(); // Refresh data to update counts
        } catch (error: any) {
            console.error('Upload failed:', error);
            alert('Upload failed: ' + (error.response?.data?.error || error.message));
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Trainer Dashboard</h1>
                    <p className="text-gray-600">Manage your assigned training sessions and track progress.</p>
                </div>

                {/* Trainer Profile Card */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Welcome, {user?.first_name || 'Trainer'}</h2>
                    <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <MapPin className="h-4 w-4 text-primary-600" />
                            <span className="font-medium">Assigned LSGI:</span>
                            <span>
                                {user?.profile?.lsgi
                                    ? (typeof user.profile.lsgi === 'object' ? user.profile.lsgi.name : 'LSGI #' + user.profile.lsgi)
                                    : 'Not Assigned'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 flex-1">
                            <Home className="h-4 w-4 text-primary-600 flex-shrink-0" />
                            <span className="font-medium whitespace-nowrap">Assigned Wards:</span>
                            <div className="flex flex-wrap gap-1">
                                {user?.profile?.wards && user.profile.wards.length > 0
                                    ? user.profile.wards.map((ward: any) => (
                                        <span key={ward.id} className="text-xs bg-white px-1.5 py-0.5 rounded border border-gray-200 text-gray-700">
                                            {ward.ward_number}: {ward.name}
                                        </span>
                                    ))
                                    : <span className="text-gray-500 italic">Not Assigned (Area Wide)</span>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                {/* Analytics Section */}
                {!loading && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatsCard
                            title="Total Sessions"
                            value={totalSessions}
                            icon={Calendar}
                            color="blue"
                            description="Assigned"
                        />
                        <StatsCard
                            title="Total Attendees"
                            value={totalAttendees}
                            icon={Users}
                            color="green"
                            description="Across all sessions"
                        />
                        <StatsCard
                            title="Completed"
                            value={completedSessions}
                            icon={CheckSquare}
                            color="purple"
                            description="Sessions conducted"
                        />
                    </div>
                )}

                <SessionList
                    title="Assigned Sessions"
                    sessions={sessions}
                    isLoading={loading}
                    emptyMessage="You have no assigned sessions."
                    renderAction={(session) => (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 text-xs"
                            onClick={() => handleOpenUpload(session.id)}
                        >
                            <Upload className="h-3 w-3" />
                            Upload Attendees
                        </Button>
                    )}
                />

                {/* Upload Modal */}
                <Modal
                    isOpen={isUploadModalOpen}
                    onClose={() => setIsUploadModalOpen(false)}
                    title="Upload Attendance"
                >
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                        <div className="p-4 bg-blue-50 text-blue-800 rounded-lg text-sm">
                            <p className="font-medium mb-1">Instructions:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>Upload Excel (.xlsx) or CSV file.</li>
                                <li>File must contain <strong>Name</strong> and <strong>Phone</strong> columns.</li>
                                <li>Attendees will be automatically added to the selected session.</li>
                            </ul>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-gray-50">
                                <FileSpreadsheet className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                                <input
                                    type="file"
                                    accept=".csv, .xlsx, .xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                    required
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <span className="text-blue-600 font-medium hover:underline">Click to upload</span>
                                    <span className="text-gray-500 block text-xs mt-1">
                                        {uploadFile ? uploadFile.name : "or drag and drop"}
                                    </span>
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                            <Button type="submit" isLoading={isUploading}>Upload & Process</Button>
                        </div>
                    </form>
                </Modal>
            </div>
        </div>
    );
};

export default TrainerDashboard;
