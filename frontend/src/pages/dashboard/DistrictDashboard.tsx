import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { SessionList } from '../../components/dashboard/SessionList';
import { Button } from '../../components/ui/Button';
import { Plus } from 'lucide-react';
import api from '../../api/client';
import type { TrainingSession } from '../../types/session';

const DistrictDashboard: React.FC = () => {
    const [sessions, setSessions] = useState<TrainingSession[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSessions = async () => {
            try {
                const response = await api.get('/training/sessions/');
                setSessions(response.data);
            } catch (error) {
                console.error('Failed to fetch sessions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSessions();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">District Dashboard</h1>
                        <p className="text-gray-600">Overview of all training sessions in the district.</p>
                    </div>
                    <Link to="/district/sessions/create">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" /> Create New Session
                        </Button>
                    </Link>
                </div>

                <SessionList
                    title="District Sessions"
                    sessions={sessions}
                    isLoading={loading}
                    emptyMessage="No sessions found in the district."
                    renderAction={(session) => (
                        !session.is_assigned ? (
                            <Link to={`/district/sessions/${session.id}/assign`} className="w-full">
                                <Button size="sm" variant="outline" className="w-full">
                                    Assign Trainer
                                </Button>
                            </Link>
                        ) : (
                            <div className="text-xs text-green-600 font-medium flex items-center justify-center gap-1 bg-green-50 py-1 rounded">
                                <span className="h-2 w-2 bg-green-500 rounded-full"></span> Trainer Assigned
                            </div>
                        )
                    )}
                />
            </div>
        </div>
    );
};

export default DistrictDashboard;
