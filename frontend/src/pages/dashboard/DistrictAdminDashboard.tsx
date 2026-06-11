
import React, { useState } from 'react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { BarChart3, CheckCircle, Map, UserCog } from 'lucide-react';
import { LSGIManager } from '../../components/dashboard/LSGIManager';
import { MasterTrainerManager } from '../../components/dashboard/MasterTrainerManager';
import { SessionManager } from '../../components/dashboard/SessionManager';
import { useLanguage } from '../../contexts/LanguageContext';

interface DistrictDashboardProps {
    stats: any; // Using any for now to match flexible stats structure, or import the interface
    isLoading: boolean;
}

export const DistrictAdminDashboard: React.FC<DistrictDashboardProps> = ({ stats, isLoading }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LSGI' | 'MASTER_TRAINERS' | 'SESSIONS'>('OVERVIEW');
    const { t } = useLanguage();

    const renderContent = () => {
        switch (activeTab) {
            case 'LSGI':
                return <LSGIManager />;
            case 'MASTER_TRAINERS':
                return <MasterTrainerManager />;
            case 'SESSIONS':
                return <SessionManager />;
            default:
                return (
                    <div className="space-y-6">
                        {/* Stats Row */}
                        {!isLoading && stats && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                <StatsCard
                                    title={t('dashboard.upcoming_sessions')}
                                    value={stats.upcoming_sessions || 0}
                                    icon={BarChart3}
                                    color="blue"
                                    description={t('dashboard.desc_upcoming_sessions')}
                                />
                                <StatsCard
                                    title={t('dashboard.total_attendees')}
                                    value={stats.total_attendees || 0}
                                    icon={UserCog}
                                    color="green"
                                    description={t('dashboard.desc_citizens_attended')}
                                />
                                <StatsCard
                                    title={t('dashboard.lsgis_engaged')}
                                    value={stats.lsgis_completed || 0}
                                    icon={Map}
                                    color="green"
                                    description={t('dashboard.desc_lsgis_engaged')}
                                />
                                <StatsCard
                                    title={t('dashboard.total_sessions')}
                                    value={stats.total_sessions}
                                    icon={CheckCircle}
                                    color="blue"
                                    description={t('dashboard.desc_scheduled_completed')}
                                />
                                <StatsCard
                                    title={t('dashboard.wards_covered')}
                                    value={stats.wards_covered}
                                    icon={Map}
                                    color="blue"
                                    description={t('dashboard.desc_wards_reached')}
                                />
                            </div>
                        )}

                        {/* Quick Actions / Shortcuts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('LSGI')}>
                                <div className="h-10 w-10 bg-[#193756] text-white rounded-lg flex items-center justify-center mb-4">
                                    <Map className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.lsgi_management')}</h3>
                                <p className="text-sm text-gray-500">{t('dashboard.manage_lsgis')}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('MASTER_TRAINERS')}>
                                <div className="h-10 w-10 bg-[#193756] text-white rounded-lg flex items-center justify-center mb-4">
                                    <UserCog className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.master_trainers')}</h3>
                                <p className="text-sm text-gray-500">{t('dashboard.create_master_trainers')}</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('SESSIONS')}>
                                <div className="h-10 w-10 bg-[#193756] text-white rounded-lg flex items-center justify-center mb-4">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">{t('dashboard.training_sessions')}</h3>
                                <p className="text-sm text-gray-500">{t('dashboard.manage_sessions')}</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div>
            {/* Tabs Navigation */}
            <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8 w-fit overflow-x-auto">
                {[
                    { id: 'OVERVIEW', label: t('dashboard.overview') },
                    { id: 'LSGI', label: t('dashboard.lsgi_management') },
                    { id: 'MASTER_TRAINERS', label: t('dashboard.master_trainers') },
                    { id: 'SESSIONS', label: t('dashboard.training_sessions') }
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
