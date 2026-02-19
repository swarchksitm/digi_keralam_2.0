import React, { useState } from 'react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { TrainerManager } from '../../components/dashboard/TrainerManager';
import { SessionManager } from '../../components/dashboard/SessionManager';
import { Users, Calendar, CheckCircle, MapPin } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuthStore } from '../../auth/store';
import { getLocalizedName } from '../../utils/languageUtils';

interface AnalyticsSummary {
    total_sessions: number;
    completed_sessions: number;
    wards_covered: number;
    total_attendees?: number;
}

interface MasterTrainerDashboardProps {
    stats: AnalyticsSummary | null;
}

export const MasterTrainerDashboard: React.FC<MasterTrainerDashboardProps> = ({ stats }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRAINERS' | 'SESSIONS'>('OVERVIEW');
    const { t, language } = useLanguage();
    const { user } = useAuthStore(); // Need user for profile card

    const renderContent = () => {
        switch (activeTab) {
            case 'TRAINERS':
                return <TrainerManager />;
            case 'SESSIONS':
                return <SessionManager />;
            default:
                return (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatsCard
                                title={t('dashboard.total_sessions')}
                                value={stats?.total_sessions || 0}
                                icon={Calendar}
                                description={t('dashboard.desc_planned_completed')}
                                trend="neutral"
                                color="blue"
                            />
                            <StatsCard
                                title={t('dashboard.sessions_completed')}
                                value={stats?.completed_sessions || 0}
                                icon={CheckCircle}
                                description={t('dashboard.desc_conducted')}
                                trend="up"
                                color="green"
                            />
                            <StatsCard
                                title={t('dashboard.wards')}
                                value={stats?.wards_covered || 0}
                                icon={MapPin}
                                description={t('dashboard.desc_unique_wards')}
                                trend="neutral"
                                color="purple"
                            />
                            <StatsCard
                                title={t('dashboard.total_attendees')}
                                value={stats?.total_attendees || 0}
                                icon={Users}
                                description={t('dashboard.desc_citizens_trained')}
                                trend="up"
                                color="orange"
                                onClick={() => setActiveTab('SESSIONS')} // Navigate to sessions for details
                                className="cursor-pointer hover:shadow-md transition-shadow"
                            />
                        </div>

                        {/* Quick Actions */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setActiveTab('TRAINERS')}
                            >
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{t('nav.trainers')}</h3>
                                <p className="text-sm text-gray-500">{t('dashboard.desc_create_accounts')}</p>
                            </div>

                            <div
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setActiveTab('SESSIONS')}
                            >
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.title_session_management')}</h3>
                                <p className="text-sm text-gray-500">{t('dashboard.desc_schedule_new')}</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div>
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">{t('common.welcome')}, {user?.first_name || 'Master Trainer'}</h2>
                <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                        <MapPin className="h-4 w-4 text-primary-600" />
                        <span className="font-medium">{t('dashboard.district')}:</span>
                        <span>
                            {user?.profile?.district
                                ? (typeof user.profile.district === 'object' ? getLocalizedName(user.profile.district, language) : user.profile.district)
                                : t('dashboard.not_assigned')}
                        </span>
                    </div>
                    {user?.profile?.lsgi && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <MapPin className="h-4 w-4 text-primary-600" />
                            <span className="font-medium">{t('dashboard.assigned_lsgi')}:</span>
                            <span>
                                {typeof user.profile.lsgi === 'object' ? getLocalizedName(user.profile.lsgi, language) : 'LSGI #' + user.profile.lsgi}
                            </span>
                        </div>
                    )}
                    {user?.profile?.wards && (
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">
                            <MapPin className="h-4 w-4 text-primary-600" />
                            <span className="font-medium">{t('dashboard.assigned_wards')}:</span>
                            <span>
                                {Array.isArray(user.profile.wards) && user.profile.wards.length > 0
                                    ? user.profile.wards.map((w: any) => typeof w === 'object' ? w.name : w).join(', ')
                                    : t('dashboard.no_wards_assigned')
                                }
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8 w-fit overflow-x-auto">
                {[
                    { id: 'OVERVIEW', label: t('dashboard.overview') },
                    { id: 'TRAINERS', label: t('nav.trainers') },
                    { id: 'SESSIONS', label: t('dashboard.training_sessions') }
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`
                            px-4 py-2 text-sm font-medium rounded-lg transition-all
                            ${activeTab === tab.id
                                ? 'bg-primary-50 text-primary-700 shadow-sm'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                        `}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {renderContent()}
        </div>
    );
};
