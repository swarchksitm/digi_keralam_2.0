import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../auth/store';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { Users, UserCheck, Calendar, MapPin, TrendingUp, Award, Building2 } from 'lucide-react';
import { UserManagement } from '../../components/dashboard/UserManagement';
import api from '../../api/client';
import { useLanguage } from '../../contexts/LanguageContext';

interface StateStats {
    attendance: {
        total_attendance_records: number;
        unique_citizens_attended: number;
    };
    trainers: {
        master_trainers: number;
        field_trainers: number;
        total_trainers: number;
    };
    sessions: {
        total: number;
        scheduled: number;
        completed: number;
    };
    coverage: {
        districts_covered: number;
        total_districts: number;
        lsgis_covered: number;
    };
}

interface StateAdminDashboardProps {
    stats?: any;
    isLoading?: boolean;
}

export const StateAdminDashboard: React.FC<StateAdminDashboardProps> = ({ stats: propStats, isLoading: propIsLoading }) => {
    const { user } = useAuthStore();
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'DISTRICTS'>('OVERVIEW');
    const [stats, setStats] = useState<StateStats | null>(null);
    const [isLoading, setIsLoading] = useState(propIsLoading ?? true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setIsLoading(true);
                const response = await api.get('/training/state-analytics/summary/');
                setStats(response.data);
            } catch (err: any) {
                console.error('Failed to load state analytics:', err);
                setError(err.response?.data?.detail || 'Failed to load analytics data');
            } finally {
                setIsLoading(false);
            }
        };

        if (user && activeTab === 'OVERVIEW') {
            fetchStats();
        }
    }, [user, activeTab]);

    const renderContent = () => {
        switch (activeTab) {
            case 'DISTRICTS':
                return (
                    <div>
                        <UserManagement roleType="LSGD_DISTRICT_ADMIN" title={t('dashboard.district_management')} />
                    </div>
                );
            default:
                return (
                    <div className="space-y-6">
                        {isLoading && (
                            <div className="text-center py-20">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                                <p className="mt-4 text-gray-600">{t('common.loading')}</p>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <p className="text-red-800 font-medium">{error}</p>
                            </div>
                        )}

                        {!isLoading && !error && stats && (
                            <>
                                {/* Trainer Statistics */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.trainer_network')}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatsCard
                                            title={t('dashboard.master_trainers')}
                                            value={stats.trainers.master_trainers}
                                            icon={Award}
                                            color="purple"
                                            description={t('dashboard.desc_master_trainers')}
                                        />
                                        <StatsCard
                                            title={t('dashboard.field_trainers')}
                                            value={stats.trainers.field_trainers}
                                            icon={UserCheck}
                                            color="blue"
                                            description={t('dashboard.desc_field_trainers')}
                                        />
                                        <StatsCard
                                            title={t('dashboard.total_trainers')}
                                            value={stats.trainers.total_trainers}
                                            icon={Users}
                                            color="green"
                                            description={t('dashboard.desc_total_trainers')}
                                        />
                                    </div>
                                </div>

                                {/* Attendance Statistics */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.citizen_participation')}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <StatsCard
                                            title={t('dashboard.total_attendance')}
                                            value={stats.attendance.total_attendance_records}
                                            icon={TrendingUp}
                                            color="orange"
                                            description={t('dashboard.desc_total_attendance')}
                                        />
                                        <StatsCard
                                            title={t('dashboard.unique_citizens')}
                                            value={stats.attendance.unique_citizens_attended}
                                            icon={Users}
                                            color="blue"
                                            description={t('dashboard.desc_unique_citizens')}
                                        />
                                    </div>
                                </div>

                                {/* Session Statistics */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.training_sessions')}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatsCard
                                            title={t('dashboard.total_sessions')}
                                            value={stats.sessions.total}
                                            icon={Calendar}
                                            color="purple"
                                            description={t('dashboard.desc_total_sessions')}
                                        />
                                        <StatsCard
                                            title={t('dashboard.scheduled')}
                                            value={stats.sessions.scheduled}
                                            icon={Calendar}
                                            color="blue"
                                            description={t('dashboard.desc_scheduled')}
                                        />
                                        <StatsCard
                                            title={t('dashboard.completed')}
                                            value={stats.sessions.completed}
                                            icon={Calendar}
                                            color="green"
                                            description={t('dashboard.desc_completed')}
                                        />
                                    </div>
                                </div>

                                {/* Coverage Statistics */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-bold text-gray-900 mb-4">{t('dashboard.geographic_coverage')}</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <StatsCard
                                            title={t('dashboard.districts_covered')}
                                            value={stats.coverage.districts_covered}
                                            icon={MapPin}
                                            color="orange"
                                            description={`${t('dashboard.desc_districts_covered')} (${stats.coverage.total_districts})`}
                                        />
                                        <StatsCard
                                            title={t('dashboard.lsgis_reached')}
                                            value={stats.coverage.lsgis_covered}
                                            icon={MapPin}
                                            color="green"
                                            description={t('dashboard.desc_lsgis_covered')}
                                        />
                                        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-600">{t('dashboard.coverage_rate')}</span>
                                                <MapPin className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div className="text-3xl font-bold text-gray-900 mb-1">
                                                {stats.coverage.total_districts > 0
                                                    ? Math.round((stats.coverage.districts_covered / stats.coverage.total_districts) * 100)
                                                    : 0}%
                                            </div>
                                            <p className="text-sm text-gray-500">{t('dashboard.desc_coverage_rate')}</p>
                                            <div className="mt-3 bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-600 h-2 rounded-full transition-all"
                                                    style={{
                                                        width: `${stats.coverage.total_districts > 0
                                                            ? (stats.coverage.districts_covered / stats.coverage.total_districts) * 100
                                                            : 0}%`
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                                    <div
                                        className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => setActiveTab('DISTRICTS')}
                                    >
                                        <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                            <Building2 className="h-6 w-6" />
                                        </div>
                                        <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.district_management')}</h3>
                                        <p className="text-sm text-gray-500">{t('dashboard.desc_district_management')}</p>
                                    </div>
                                </div>

                                {/* Summary Card */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-8">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">{t('dashboard.program_summary')}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">{t('dashboard.avg_attendance')}:</span>
                                            <span className="font-semibold text-gray-900">
                                                {stats.sessions.total > 0
                                                    ? Math.round(stats.attendance.total_attendance_records / stats.sessions.total)
                                                    : 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">{t('dashboard.sessions_per_district')}:</span>
                                            <span className="font-semibold text-gray-900">
                                                {stats.coverage.districts_covered > 0
                                                    ? Math.round(stats.sessions.total / stats.coverage.districts_covered)
                                                    : 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">{t('dashboard.trainer_ratio')}:</span>
                                            <span className="font-semibold text-gray-900">
                                                1:{stats.trainers.total_trainers > 0
                                                    ? Math.round(stats.attendance.unique_citizens_attended / stats.trainers.total_trainers)
                                                    : 0}
                                            </span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-100">
                                            <span className="text-gray-600">{t('dashboard.completion_rate')}:</span>
                                            <span className="font-semibold text-gray-900">
                                                {stats.sessions.total > 0
                                                    ? Math.round((stats.sessions.completed / stats.sessions.total) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                );
        }
    };

    return (
        <div>
            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8 w-fit overflow-x-auto">
                {[
                    { id: 'OVERVIEW', label: t('dashboard.state_overview') },
                    { id: 'DISTRICTS', label: t('dashboard.district_management') }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-primary-50 text-primary-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {renderContent()}
        </div>
    );
};
