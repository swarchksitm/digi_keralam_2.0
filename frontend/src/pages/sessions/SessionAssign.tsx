import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { AlertCircle, UserCheck } from 'lucide-react';
import api from '../../api/client';
import type { TrainingSession } from '../../types/session';

interface Trainer {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

const SessionAssign: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [session, setSession] = useState<TrainingSession | null>(null);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [selectedTrainer, setSelectedTrainer] = useState('');

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Session Details
                const sessionRes = await api.get(`/training/sessions/${id}/`);
                const sessionData = sessionRes.data;
                setSession(sessionData);

                // 2. Fetch Trainers in Session's Ward
                // Session ward might be an object or ID. Handle both.
                const wardId = typeof sessionData.ward === 'object' ? sessionData.ward.id : sessionData.ward;

                const trainerRes = await api.get(`/users/trainers/?ward=${wardId}`);
                setTrainers(trainerRes.data);

            } catch (err) {
                console.error("Failed to load data", err);
                setError("Failed to load session or trainers.");
            } finally {
                setIsLoading(false);
            }
        };

        if (id) fetchData();
    }, [id]);

    const handleAssign = async () => {
        if (!session || !selectedTrainer) return;
        setIsSubmitting(true);
        setError(null);

        try {
            await api.post('/training/assignments/', {
                session: session.id,
                trainer: selectedTrainer // ID
            });
            setSuccess(true);
            setTimeout(() => navigate('/district/dashboard'), 1500);
        } catch (err: any) {
            console.error("Assignment failed", err);
            setError(JSON.stringify(err.response?.data) || "Failed to assign trainer.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-10 text-center">Loading...</div>;
    if (!session) return <div className="p-10 text-center text-red-500">Session not found.</div>;

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md text-center p-8">
                    <UserCheck className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Trainer Assigned!</h2>
                    <p className="text-gray-600">Redirecting to dashboard...</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Assign Trainer to Session</h1>
                    <p className="text-gray-600">Select a qualified Field Trainer for this session.</p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Session: {session.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 space-y-1">
                            <p><span className="font-semibold">Date:</span> {new Date(session.date_time).toLocaleString()}</p>
                            <p><span className="font-semibold">Venue:</span> {session.venue}</p>
                            <p><span className="font-semibold">Ward:</span> {typeof session.ward === 'object' ? `Ward ${session.ward.number}` : session.ward}</p>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm flex items-center gap-2">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <Select
                                label="Select Field Trainer"
                                value={selectedTrainer}
                                onChange={(e) => setSelectedTrainer(e.target.value)}
                                options={trainers.map(t => ({
                                    value: t.id,
                                    label: `${t.first_name} ${t.last_name} (${t.username})`
                                }))}
                                error={trainers.length === 0 ? "No trainers found in this ward." : undefined}
                            />

                            <div className="flex gap-4 pt-4">
                                <Button variant="outline" onClick={() => navigate('/district/dashboard')} className="flex-1">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleAssign}
                                    isLoading={isSubmitting}
                                    disabled={!selectedTrainer}
                                    className="flex-1"
                                >
                                    Confirm Assignment
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default SessionAssign;
