
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store';
import { LocationService, type LSGI, type Ward } from '../../services/locationService';
import { UserService, type AdminUser } from '../../services/userService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Modal } from '../ui/Modal';
import { Plus, Search, Calendar, MapPin, UserCheck, Clock, FileText, Trash2, Edit2 } from 'lucide-react';
import { TimePicker } from '../ui/TimePicker';
import api from '../../api/client';
import { getMediaUrl } from '../../utils/url';

interface Session {
    id: number;
    title: string;
    description: string;
    ward: { id: number; name: string; lsgi: { id: number; name: string } };
    date_time: string;
    venue: string;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    is_assigned: boolean;
    trainer_name?: string | null;
    resources?: {
        id: number;
        title: string;
        file: string;
        resource_type: string;
    }[];
}

export const SessionManager: React.FC = () => {
    const { user } = useAuthStore();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [lsgis, setLsgis] = useState<LSGI[]>([]);
    const [wards, setWards] = useState<Ward[]>([]);
    const [trainers, setTrainers] = useState<AdminUser[]>([]);

    // Dummy Wards for Master Trainer (Temporary)
    const DUMMY_WARDS: Ward[] = [
        { id: 991, name: 'Ward 1 - Central', ward_number: 1, lsgi: { id: 0, name: 'Demo LSGI', lsgi_type: 'MUNICIPALITY', district: { id: 0, name: 'Demo' } } },
        { id: 992, name: 'Ward 2 - North', ward_number: 2, lsgi: { id: 0, name: 'Demo LSGI', lsgi_type: 'MUNICIPALITY', district: { id: 0, name: 'Demo' } } },
        { id: 993, name: 'Ward 3 - South', ward_number: 3, lsgi: { id: 0, name: 'Demo LSGI', lsgi_type: 'MUNICIPALITY', district: { id: 0, name: 'Demo' } } },
        { id: 994, name: 'Ward 4 - East', ward_number: 4, lsgi: { id: 0, name: 'Demo LSGI', lsgi_type: 'MUNICIPALITY', district: { id: 0, name: 'Demo' } } },
        { id: 995, name: 'Ward 5 - West', ward_number: 5, lsgi: { id: 0, name: 'Demo LSGI', lsgi_type: 'MUNICIPALITY', district: { id: 0, name: 'Demo' } } },
    ];

    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedSessionId, setSelectedSessionId] = useState<number | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    // Filter Logic
    const [selectedLsgiFilter, setSelectedLsgiFilter] = useState<number | 'ALL'>('ALL');

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        lsgi_id: '' as string | number,
        ward_id: '' as string | number,
        date: '',
        time: '',
        venue: '',
        category: 'AI_EDU',
        proficiency: 'BEGINNER',
        mode: 'OFFLINE',
        trainer_id: '' as string | number // Optional: Pre-assign trainer
    });

    const [assignmentData, setAssignmentData] = useState({
        trainer_id: '' as string | number
    });

    // Trainers available for selection (filtered by LSGI)
    const [availableTrainers, setAvailableTrainers] = useState<AdminUser[]>([]);

    const getRestrictedLsgiId = () => {
        const tempLsgi = user?.profile?.lsgi;
        return (tempLsgi && typeof tempLsgi === 'object' && 'id' in tempLsgi) ? tempLsgi.id : tempLsgi as number | undefined;
    };

    // Ensure form data is correct when modal opens for restricted users
    useEffect(() => {
        if (isCreateModalOpen) {
            const restrictedId = getRestrictedLsgiId();
            if (restrictedId) {
                setFormData(prev => ({ ...prev, lsgi_id: restrictedId }));
                // Wards might already be loaded if we auto-fetch in loadData or here
                if (wards.length === 0) {
                    LocationService.getWards(restrictedId).then(setWards).catch(console.error);
                }
            }
        }
    }, [isCreateModalOpen]);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const apiCalls: Promise<any>[] = [api.get<Session[]>('/training/sessions/')];

            // Fetch LSGIs filtered by district if available
            const tempDistrict = user?.profile?.district;
            const districtId = (tempDistrict && typeof tempDistrict === 'object' && 'id' in tempDistrict) ? tempDistrict.id : tempDistrict as number | undefined;

            apiCalls.push(LocationService.getLSGIs(districtId ? { district: districtId } : {}));

            const [sessionRes, lsgiRes] = await Promise.all(apiCalls);

            setSessions(sessionRes.data);

            // Filter LSGIs to only Municipality, Corporation, and GP
            let filteredLsgis = lsgiRes.filter((l: any) => ['GP', 'MUNICIPALITY', 'CORPORATION'].includes(l.lsgi_type));

            const restrictedId = getRestrictedLsgiId();
            if (restrictedId) {
                // RESTRICTION 1: Master Trainer tied to single LSGI
                filteredLsgis = filteredLsgis.filter((l: any) => l.id === restrictedId);
            }

            setLsgis(filteredLsgis);

            // If restricted and only one LSGI, auto-set form data
            if (restrictedId && filteredLsgis.length === 1) {
                setFormData(prev => ({ ...prev, lsgi_id: restrictedId }));
                // Pre-load wards
                LocationService.getWards(restrictedId).then(setWards).catch(console.error);

                // Pre-load trainers for this LSGI
                UserService.getAdminUsers('LSGI_FIELD_TRAINER').then(users => {
                    const lsgiTrainers = users.filter(t => t.profile?.lsgi?.id === restrictedId);
                    setAvailableTrainers(lsgiTrainers);
                }).catch(console.error);
            }

        } catch (error) {
            console.error("Failed to load sessions", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLsgiChange = async (val: string | number) => {
        const lsgiId = String(val);
        setFormData({ ...formData, lsgi_id: lsgiId, ward_id: '', trainer_id: '' });

        if (lsgiId) {
            // Fetch Wards
            let wardData = await LocationService.getWards(Number(lsgiId));

            // Inject Dummy Data if enabled or empty and user is Master Trainer
            if (user?.role === 'DISTRICT_MASTER_TRAINER' && (wardData.length === 0 || true)) { // Force dummy for now as requested
                // Adapt dummy wards to selected LSGI
                const adaptedDummy = DUMMY_WARDS.map(w => ({ ...w, lsgi: { ...w.lsgi, id: Number(lsgiId) } }));
                wardData = [...wardData, ...adaptedDummy];
            }

            setWards(wardData);

            // Fetch Trainers for this LSGI
            try {
                // Ideally backend endpoint for this, but reusing getAdminUsers and filtering client-side
                const allTrainers = await UserService.getAdminUsers('LSGI_FIELD_TRAINER');
                const lsgiTrainers = allTrainers.filter(t => t.profile?.lsgi?.id === Number(lsgiId));
                setAvailableTrainers(lsgiTrainers);
            } catch (error) {
                console.error("Failed to load trainers", error);
            }
        } else {
            setWards([]);
            setAvailableTrainers([]);
        }
    };

    const [resourceFile, setResourceFile] = useState<File | null>(null);

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // Combine Date and Time
            const localDate = new Date(`${formData.date}T${formData.time}`);
            const dateTime = localDate.toISOString();

            let res;
            if (isEditing && selectedSessionId) {
                res = await api.put(`/training/sessions/${selectedSessionId}/`, {
                    ...formData,
                    date_time: dateTime,
                    trainer_id: undefined, // Don't re-assign trainer here, handle separately? Or allow if supported.
                    ward_id: formData.ward_id || null // Ensure ward_id is sent
                });
            } else {
                res = await api.post('/training/sessions/', {
                    ...formData,
                    date_time: dateTime,
                    trainer_id: formData.trainer_id || null,
                    ward_id: formData.ward_id || null
                });
            }

            // Upload Resource if present
            if (resourceFile && res.data.id) {
                const session_id = res.data.id;
                const uploadData = new FormData();
                uploadData.append('file', resourceFile);
                uploadData.append('title', resourceFile.name);
                uploadData.append('session', session_id);
                uploadData.append('resource_type', 'PDF'); // Default or infer

                await api.post('/training/resources/', uploadData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }

            await loadData();
            setIsCreateModalOpen(false);
            await loadData();
            setIsCreateModalOpen(false);
            setFormData({
                title: '', description: '', lsgi_id: '', ward_id: '',
                date: '', time: '', venue: '', category: 'AI_EDU', proficiency: 'BEGINNER', mode: 'OFFLINE',
                trainer_id: ''
            });
            setIsEditing(false);
            setResourceFile(null);
            alert(isEditing ? "Session updated successfully!" : "Session created successfully!");
        } catch (error: any) {
            console.error("Failed to create session", error);
            alert("Failed to create session: " + JSON.stringify(error.response?.data));
        } finally {
            setIsSaving(false);
        }
    };

    const openAssignModal = async (session: Session) => {
        setSelectedSessionId(session.id);
        setAssignmentData({ trainer_id: '' });

        // Fetch eligible trainers for this session (same District/LSGI scope)
        // ideally backend filters this, but here we can just fetch all trainers and filter client-side or assume getAdminUsers returns district trainers
        try {
            const allTrainers = await UserService.getAdminUsers('LSGI_FIELD_TRAINER');
            // Basic filtering: In real app, maybe strict backend filtering
            // For now show all district trainers, backend validates assignment
            setTrainers(allTrainers);
            setIsAssignModalOpen(true);
        } catch (e) {
            console.error(e);
            alert("Failed to load trainers");
        }
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSessionId || !assignmentData.trainer_id) return;

        setIsSaving(true);
        try {
            await api.post('/training/assignments/', {
                session: selectedSessionId,
                trainer: assignmentData.trainer_id
            });
            await loadData();
            setIsAssignModalOpen(false);
            alert("Trainer assigned successfully!");
        } catch (error: any) {
            console.error("Failed to assign trainer", error);
            alert("Failed to assign trainer: " + JSON.stringify(error.response?.data));
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (sessionId: number) => {
        if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) return;

        // Optimistic UI or loading state? Global loading is simplest
        setIsLoading(true);
        try {
            await api.delete(`/training/sessions/${sessionId}/`);
            // Remove locally to avoid full reload delay
            setSessions(prev => prev.filter(s => s.id !== sessionId));
            alert("Session deleted successfully.");
        } catch (error: any) {
            console.error("Failed to delete session", error);
            alert("Failed to delete session: " + (error.response?.data?.detail || "Unknown error"));
            await loadData(); // Reload on error to ensure sync
        } finally {
            setIsLoading(false);
        }
    };

    // Filtered Sessions
    // Filtered Sessions
    const filteredSessions = sessions.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.ward && typeof s.ward !== 'number' && s.ward.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesLsgi = selectedLsgiFilter === 'ALL' ||
            (s.ward && typeof s.ward !== 'number' && s.ward.lsgi?.id === selectedLsgiFilter) ||
            !s.ward; // Show sessions with pending location to allow management

        return matchesSearch && matchesLsgi;
    });

    const handleEdit = (session: Session) => {
        setSelectedSessionId(session.id);
        setIsEditing(true);

        let date = '';
        let time = '';
        if (session.date_time) {
            const dt = new Date(session.date_time);
            date = dt.toISOString().split('T')[0];
            // Get local time string HH:MM
            time = dt.toTimeString().slice(0, 5);
        }

        setFormData({
            title: session.title,
            description: session.description,
            lsgi_id: session.ward && typeof session.ward === 'object' ? session.ward.lsgi.id : '',
            ward_id: session.ward && typeof session.ward === 'object' ? session.ward.id : '',
            date: date,
            time: time,
            venue: session.venue,
            category: 'AI_EDU', // Default or fetch if available in session object (not in interface currently)
            proficiency: 'BEGINNER',
            mode: 'OFFLINE',
            trainer_id: '' // Don't pre-fill trainer for now
        });

        // Load wards for selected LSGI
        if (session.ward && typeof session.ward === 'object') {
            LocationService.getWards(session.ward.lsgi.id).then(setWards).catch(console.error);
        }

        setIsCreateModalOpen(true);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Training Sessions</h2>
                        <p className="text-sm text-gray-500">Schedule and manage sessions in your district</p>
                    </div>
                    <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 rounded-full">
                        <Plus className="h-4 w-4" /> Create Session
                    </Button>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search sessions..."
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-full text-center py-10 text-gray-500">Loading sessions...</div>
                ) : filteredSessions.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-gray-500">No sessions found.</div>
                ) : (
                    filteredSessions.map(session => (
                        <div key={session.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-white">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <h3 className="font-semibold text-gray-900 line-clamp-1">{session.title}</h3>
                                    <div className="flex items-center text-xs text-gray-500 mt-1">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {session.ward && typeof session.ward === 'object'
                                            ? `${session.ward.lsgi?.name || 'LSGI'} - Ward ${session.ward.name}`
                                            : 'Location Pending'}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${session.status === 'SCHEDULED' ? 'bg-blue-50 text-blue-700' :
                                        session.status === 'COMPLETED' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {session.status}
                                    </span>

                                    {user?.role === 'DISTRICT_MASTER_TRAINER' && (
                                        <>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEdit(session);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Edit Session"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(session.id);
                                                }}
                                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                                title="Delete Session"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-sm text-gray-600">
                                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                                    {new Date(session.date_time).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                                    {new Date(session.date_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            {/* Resources Section */}
                            {session.resources && session.resources.length > 0 && (
                                <div className="mb-4 pt-3 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Training Materials:</h4>
                                    <div className="space-y-1">
                                        {session.resources.map((res: any) => (
                                            <a
                                                key={res.id}
                                                href={getMediaUrl(res.file)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-blue-600 hover:underline p-1 hover:bg-blue-50 rounded"
                                            >
                                                <FileText className="h-3 w-3" />
                                                {res.title || 'View Document'}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                {session.is_assigned ? (
                                    <span className="text-xs font-medium text-green-600 flex items-center">
                                        <UserCheck className="h-3 w-3 mr-1" /> {session.trainer_name || 'Assigned'}
                                    </span>
                                ) : (
                                    <span className="text-xs font-medium text-amber-600 flex items-center">
                                        Trainer Pending
                                    </span>
                                )}

                                {session.status === 'SCHEDULED' && !session.is_assigned && (
                                    <button
                                        onClick={() => openAssignModal(session)}
                                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                    >
                                        Assign Trainer
                                    </button>
                                )}
                            </div>
                        </div>
                    )))}
            </div>

            {/* Create/Edit Session Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => { setIsCreateModalOpen(false); setIsEditing(false); }} title={isEditing ? "Edit Session" : "Schedule New Session"}>
                <form onSubmit={handleCreateSubmit} className="space-y-4">
                    <Input label="Session Title" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            {lsgis.length === 1 ? (
                                <Input
                                    label="LSGI"
                                    value={lsgis[0].name}
                                    readOnly
                                    className="bg-gray-50 text-gray-500"
                                />
                            ) : (
                                <Select
                                    label="LSGI"
                                    value={formData.lsgi_id || ''}
                                    onChange={handleLsgiChange}
                                    options={lsgis.map(l => ({ value: l.id, label: l.name }))}
                                    required
                                />
                            )}
                        </div>
                        <div>
                            <Select
                                label="Ward"
                                value={formData.ward_id}
                                onChange={val => setFormData({ ...formData, ward_id: val })}
                                options={wards.map(w => ({ value: w.id, label: `${w.ward_number}: ${w.name}` }))}
                                disabled={!formData.lsgi_id}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label className="text-sm font-medium text-gray-700 mb-1">Date</label>
                            <input
                                type="date"
                                className="rounded-lg border-gray-200 text-sm focus:ring-primary-500 py-2 px-3 w-full"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex flex-col">
                            <TimePicker
                                label="Time"
                                value={formData.time}
                                onChange={val => setFormData({ ...formData, time: val })}
                            />
                        </div>
                    </div>
                    <Input label="Venue" value={formData.venue} onChange={e => setFormData({ ...formData, venue: e.target.value })} required />

                    <div className="grid grid-cols-1 gap-4">
                        <Select
                            label="Assign Field Trainer (Optional)"
                            value={formData.trainer_id}
                            onChange={val => setFormData({ ...formData, trainer_id: val })}
                            options={[
                                { value: '', label: 'Select Later (Pending)' },
                                ...availableTrainers.map(t => ({
                                    value: t.id,
                                    label: `${t.first_name} ${t.last_name || ''}`.trim() || t.username
                                }))
                            ]}
                            disabled={!formData.lsgi_id || availableTrainers.length === 0}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Category"
                            value={formData.category}
                            onChange={val => setFormData({ ...formData, category: String(val) })}
                            options={[
                                { value: 'AI_EDU', label: 'AI Education' },
                                { value: 'SAFE_TECH', label: 'Safe Tech' },
                                { value: 'DEED', label: 'DEED' }
                            ]}
                        />
                        <Select
                            label="Proficiency"
                            value={formData.proficiency}
                            onChange={val => setFormData({ ...formData, proficiency: String(val) })}
                            options={[
                                { value: 'BEGINNER', label: 'Beginner' },
                                { value: 'INTERMEDIATE', label: 'Intermediate' },
                                { value: 'ADVANCED', label: 'Advanced' }
                            ]}
                        />
                    </div>

                    {/* Resource Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Session Materials (Optional)
                        </label>
                        <Input
                            type="file"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setResourceFile(file);
                            }}
                            className="text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">Upload PDF, PPT, or other materials for the trainer.</p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving}>Schedule Session</Button>
                    </div>
                </form>
            </Modal>

            {/* Assign Trainer Modal */}
            <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title="Assign Trainer">
                <form onSubmit={handleAssignSubmit} className="space-y-4">
                    <p className="text-sm text-gray-500">Select a Field Trainer to conduct this session.</p>

                    <div className="max-h-60 overflow-y-auto border rounded-lg p-2">
                        {trainers.length === 0 ? (
                            <div className="text-center py-4 text-gray-500">No trainers found.</div>
                        ) : (
                            trainers.map(t => (
                                <label key={t.id} className="flex items-center p-3 hover:bg-gray-50 rounded cursor-pointer border-b last:border-0 border-gray-100">
                                    <input
                                        type="radio"
                                        name="trainer"
                                        value={t.id}
                                        checked={String(assignmentData.trainer_id) === String(t.id)}
                                        onChange={() => setAssignmentData({ trainer_id: t.id })}
                                        className="mr-3 h-4 w-4 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <div className="font-medium text-gray-900">{t.first_name} {t.last_name || t.username}</div>
                                        <div className="text-xs text-gray-500">{t.profile?.lsgi?.name || 'Unassigned LSGI'}</div>
                                    </div>
                                </label>
                            ))
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAssignModalOpen(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isSaving} disabled={!assignmentData.trainer_id}>Confirm Assignment</Button>
                    </div>
                </form>
            </Modal >
        </div >
    );
};
