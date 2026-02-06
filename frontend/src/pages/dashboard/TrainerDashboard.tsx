import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { SessionList } from '../../components/dashboard/SessionList';
import api from '../../api/client';
import type { TrainingSession } from '../../types/session';

const TrainerDashboard: React.FC = () => {
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
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Trainer Dashboard</h1>
                    <p className="text-gray-600">Manage your assigned training sessions.</p>
                </div>

                <SessionList
                    title="Assigned Sessions"
                    sessions={sessions}
                    isLoading={loading}
                    emptyMessage="You have no assigned sessions."
                />
            </div>
        </div>
    );
};

export default TrainerDashboard;
