
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Upload, Search, Phone } from 'lucide-react';
import api from '../../api/client';
import type { TrainingSession } from '../../types/session';

interface Attendee {
    id: number;
    citizen: {
        id: number;
        first_name: string;
        last_name: string;
        phone: string;
    };
    session: number;
    status: 'PRESENT' | 'ABSENT';
    marked_at: string;
}

interface AttendanceManagerProps {
    initialSessionId?: string;
}

export const AttendanceManager: React.FC<AttendanceManagerProps> = ({ initialSessionId }) => {
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [attendees, setAttendees] = useState<Attendee[]>([]);

    // Filters
    const [selectedSessionId, setSelectedSessionId] = useState<string>(initialSessionId || '');
    const [selectedDate, setSelectedDate] = useState<string>(initialSessionId ? '' : new Date().toISOString().split('T')[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const [isLoading, setIsLoading] = useState(false);

    // Upload Modal
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSessionId, setUploadSessionId] = useState<string>('');

    useEffect(() => {
        if (initialSessionId) {
            setSelectedSessionId(initialSessionId);
            setSelectedDate('');
        }
        fetchSessions();
    }, [initialSessionId]);

    useEffect(() => {
        fetchAttendees();
    }, [selectedSessionId, selectedDate]);

    const fetchSessions = async () => {
        try {
            const res = await api.get<TrainingSession[]>('/training/sessions/');
            setSessions(res.data);
        } catch (error) {
            console.error("Failed to load sessions", error);
        }
    };

    const fetchAttendees = async () => {
        setIsLoading(true);
        try {
            const params: any = {};
            if (selectedSessionId) params.session = selectedSessionId;
            if (selectedDate && !selectedSessionId) params.date = selectedDate;
            // Logic: If session selected, date filter is implicit in session details usually, 
            // but we can support both. If session is selected, date might be redundant or conflicting logic in backend?
            // Backend supports filtering by both. Let's send both if user sets them, or prioritize session.

            const res = await api.get<Attendee[]>('/training/attendance/', { params });
            setAttendees(res.data);
        } catch (error) {
            console.error("Failed to load attendees", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!uploadFile || !uploadSessionId) {
            alert("Please select a session and a file.");
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', uploadFile);
        formData.append('session_id', uploadSessionId);

        try {
            await api.post('/training/attendance/upload/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Attendees uploaded successfully!");
            setIsUploadModalOpen(false);
            setUploadFile(null);
            // Refresh list if applicable
            if (selectedSessionId === uploadSessionId) {
                fetchAttendees();
            } else {
                setSelectedSessionId(uploadSessionId);
            }
        } catch (error: any) {
            console.error("Upload failed", error);
            alert("Upload failed: " + (error.response?.data?.error || "Unknown error"));
        } finally {
            setIsUploading(false);
        }
    };

    // Filter attendees by search (client-side for now)
    const filteredAttendees = attendees.filter(a => {
        const name = `${a.citizen.first_name} ${a.citizen.last_name}`.toLowerCase();
        const phone = (a.citizen.phone || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || phone.includes(query);
    });

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Attendance Management</CardTitle>
                        <p className="text-sm text-gray-500 mt-1">View and manage attendees for your sessions</p>
                    </div>
                    <Button onClick={() => setIsUploadModalOpen(true)} className="gap-2">
                        <Upload className="h-4 w-4" /> Upload Attendees
                    </Button>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        {!initialSessionId && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Filter by Session</label>
                                <select
                                    className="w-full rounded-lg border-gray-200 text-sm py-2 px-3"
                                    value={selectedSessionId}
                                    onChange={e => {
                                        setSelectedSessionId(e.target.value);
                                        if (e.target.value) setSelectedDate('');
                                    }}
                                >
                                    <option value="">All Sessions</option>
                                    {sessions.map(s => (
                                        <option key={s.id} value={s.id}>{s.title} ({new Date(s.date_time).toLocaleDateString()})</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        {!initialSessionId && (
                            <div>
                                <label className="text-xs font-medium text-gray-500 mb-1 block">Filter by Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border-gray-200 text-sm py-2 px-3 disabled:bg-gray-100 disabled:text-gray-400"
                                    value={selectedDate}
                                    onChange={e => {
                                        setSelectedDate(e.target.value);
                                        if (e.target.value) setSelectedSessionId('');
                                    }}
                                    disabled={!!selectedSessionId}
                                />
                            </div>
                        )}
                        <div>
                            <label className="text-xs font-medium text-gray-500 mb-1 block">Search Attendees</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Name or Phone..."
                                    className="w-full pl-9 rounded-lg border-gray-200 text-sm py-2 px-3"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Attendees List */}
                    <div className="border rounded-lg overflow-hidden overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-4 py-3">Name</th>
                                    <th className="px-4 py-3">Phone</th>
                                    <th className="px-4 py-3">Session</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Marked At</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">Loading attendees...</td>
                                    </tr>
                                ) : filteredAttendees.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500">No attendees found for this selection.</td>
                                    </tr>
                                ) : (
                                    filteredAttendees.map(attendee => {
                                        const sessionTitle = sessions.find(s => s.id === attendee.session)?.title || `Session #${attendee.session}`;
                                        return (
                                            <tr key={attendee.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-3 font-medium text-gray-900">
                                                    {attendee.citizen.first_name} {attendee.citizen.last_name}
                                                </td>
                                                <td className="px-4 py-3 text-gray-600">
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-3 w-3" />
                                                        {attendee.citizen.phone}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-600 line-clamp-1 max-w-xs" title={sessionTitle}>
                                                    {sessionTitle}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${attendee.status === 'PRESENT' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {attendee.status}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">
                                                    {new Date(attendee.marked_at).toLocaleString()}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Upload Modal */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload Attendees (Excel/CSV)">
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                    <p className="text-sm text-gray-500">
                        Upload a file containing attendee details. <strong>Columns required: Name, Phone.</strong>
                    </p>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">Select Session</label>
                        <select
                            className="w-full rounded-lg border-gray-200 text-sm py-2 px-3 focus:ring-2 focus:ring-primary-500"
                            value={uploadSessionId}
                            onChange={e => setUploadSessionId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Session --</option>
                            {sessions.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">File (CSV or Excel)</label>
                        <Input
                            type="file"
                            accept=".csv, .xls, .xlsx"
                            onChange={e => setUploadFile(e.target.files?.[0] || null)}
                            required
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsUploadModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isUploading} disabled={!uploadFile || !uploadSessionId}>
                            Upload & Process
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
