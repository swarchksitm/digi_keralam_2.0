import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import api from '../../api/client';
import { useAuthStore } from '../../auth/store';
import { DistrictAdminDashboard } from './DistrictAdminDashboard';
import { SuperAdminDashboard } from './SuperAdminDashboard';
import { StateAdminDashboard } from './StateAdminDashboard';

import { MasterTrainerDashboard } from './MasterTrainerDashboard';

interface AnalyticsSummary {
    total_sessions: number;
    completed_sessions: number;
    wards_covered: number;
    total_attendees?: number;
}

const AdminDashboard: React.FC = () => {
    const { user } = useAuthStore();
    const [stats, setStats] = useState<AnalyticsSummary | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/training/analytics/summary/');
                setStats(response.data);
            } catch (err: any) {
                console.error("Failed to load analytics", err);
                const msg = err.response?.data?.error || err.message || "Failed to load dashboard data.";
                if (err.response?.data?.trace) {
                    console.error("Backend Trace:", err.response.data.trace);
                }
                setError(msg);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getDashboardTitle = () => {
        if (user?.role === 'LSGD_STATE_ADMIN') return 'State Overview';
        if (user?.role === 'LSGD_DISTRICT_ADMIN') return 'District Overview';
        if (user?.role === 'DISTRICT_MASTER_TRAINER') return 'Master Trainer Overview';
        if (user?.role === 'KSITM_SUPER_ADMIN') return 'KSITM Console';
        return 'Dashboard';
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-10">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">{getDashboardTitle()}</h1>
                    <p className="text-gray-600">Real-time training program insights.</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md whitespace-pre-wrap">
                        {error}
                    </div>
                )}

                {/* Global Loading State */}
                {isLoading && (
                    <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
                )}

                {/* Role-Based Dashboard Rendering */}
                {!isLoading && (
                    <>
                        {user?.role === 'KSITM_SUPER_ADMIN' && <SuperAdminDashboard />}


                        {user?.role === 'LSGD_STATE_ADMIN' && <StateAdminDashboard />}

                        {user?.role === 'LSGD_DISTRICT_ADMIN' && (
                            <DistrictAdminDashboard stats={stats} isLoading={isLoading} />
                        )}

                        {user?.role === 'DISTRICT_MASTER_TRAINER' && (
                            <MasterTrainerDashboard stats={stats} />
                        )}
                    </>
                )}

            </div>
        </div>
    );
};

export default AdminDashboard;
