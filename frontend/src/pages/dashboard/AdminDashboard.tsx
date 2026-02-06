import React, { useEffect, useState } from 'react';
import { Navbar } from '../../components/layout/Navbar';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { BarChart3, CheckCircle, Map } from 'lucide-react';
import api from '../../api/client';
import { useAuthStore } from '../../auth/store';

interface AnalyticsSummary {
    total_sessions: number;
    completed_sessions: number;
    wards_covered: number;
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
            } catch (err) {
                console.error("Failed to load analytics", err);
                setError("Failed to load dashboard data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const getDashboardTitle = () => {
        if (user?.role === 'LSGD_STATE_ADMIN') return 'State Overview';
        if (user?.role === 'LSGD_DISTRICT_ADMIN') return 'District Overview';
        if (user?.role === 'KSITM_SUPER_ADMIN') return 'Super Admin Console';
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
                    <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-md">
                        {error}
                    </div>
                )}

                {isLoading ? (
                    <div className="text-center py-12 text-gray-500">Loading analytics...</div>
                ) : stats && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <StatsCard
                            title="Total Sessions"
                            value={stats.total_sessions}
                            icon={BarChart3}
                            color="blue"
                            description="All scheduled and completed sessions"
                        />
                        <StatsCard
                            title="Completed Sessions"
                            value={stats.completed_sessions}
                            icon={CheckCircle}
                            color="green"
                            description="Sessions marked as completed"
                        />
                        <StatsCard
                            title="Total Coverage"
                            value={stats.wards_covered}
                            icon={Map}
                            color="purple"
                            description="Unique Wards with at least one session"
                        />
                    </div>
                )}

                {/* Future: Add District/Block breakdown table here */}

            </div>
        </div>
    );
};

export default AdminDashboard;
