
import React, { useState } from 'react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { BarChart3, CheckCircle, Map, UserCog } from 'lucide-react';
import { LSGIManager } from '../../components/dashboard/LSGIManager';
import { MasterTrainerManager } from '../../components/dashboard/MasterTrainerManager';
import { SessionManager } from '../../components/dashboard/SessionManager';

interface DistrictDashboardProps {
    stats: any; // Using any for now to match flexible stats structure, or import the interface
    isLoading: boolean;
}

export const DistrictAdminDashboard: React.FC<DistrictDashboardProps> = ({ stats, isLoading }) => {
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LSGI' | 'MASTER_TRAINERS' | 'SESSIONS'>('OVERVIEW');

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
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                <StatsCard
                                    title="Upcoming Sessions"
                                    value={stats.upcoming_sessions || 0}
                                    icon={BarChart3}
                                    color="blue"
                                    description="Planned Training Events"
                                />
                                <StatsCard
                                    title="Total Attendance"
                                    value={stats.total_attendees || 0}
                                    icon={UserCog}
                                    color="orange"
                                    description="Citizens Attended"
                                />
                                <StatsCard
                                    title="LSGIs Engaged"
                                    value={stats.lsgis_completed || 0}
                                    icon={Map}
                                    color="green"
                                    description="LSGIs with Completed Sessions"
                                />
                                <StatsCard
                                    title="Total Sessions"
                                    value={stats.total_sessions}
                                    icon={CheckCircle}
                                    color="purple"
                                    description="All scheduled and completed"
                                />
                                <StatsCard
                                    title="Wards Covered"
                                    value={stats.wards_covered}
                                    icon={Map}
                                    color="blue"
                                    description="Unique wards reached"
                                />
                            </div>
                        )}

                        {/* Quick Actions / Shortcuts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('LSGI')}>
                                <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mb-4">
                                    <Map className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">LSGI Management</h3>
                                <p className="text-sm text-gray-500">Manage Corporations, Municipalities, and Panchayats.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('MASTER_TRAINERS')}>
                                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <UserCog className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Master Trainers</h3>
                                <p className="text-sm text-gray-500">Create LSGI Master Trainers.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('SESSIONS')}>
                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Training Sessions</h3>
                                <p className="text-sm text-gray-500">Schedule and monitor training sessions.</p>
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
                    { id: 'OVERVIEW', label: 'Overview' },
                    { id: 'LSGI', label: 'LSGI Management' },
                    { id: 'MASTER_TRAINERS', label: 'Master Trainers' },
                    { id: 'SESSIONS', label: 'Sessions' }
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
