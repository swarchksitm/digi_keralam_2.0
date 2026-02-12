import React, { useState } from 'react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { TrainerManager } from '../../components/dashboard/TrainerManager';
import { SessionManager } from '../../components/dashboard/SessionManager';
import { Users, Calendar, CheckCircle, MapPin } from 'lucide-react';

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <StatsCard
                                title="Total Sessions"
                                value={stats?.total_sessions || 0}
                                icon={Calendar}
                                description="Planned & Completed"
                                trend="neutral"
                                color="blue"
                            />
                            <StatsCard
                                title="Sessions Completed"
                                value={stats?.completed_sessions || 0}
                                icon={CheckCircle}
                                description="Successfully Conducted"
                                trend="up"
                                color="green"
                            />
                            <StatsCard
                                title="Wards Covered"
                                value={stats?.wards_covered || 0}
                                icon={MapPin}
                                description="Unique Wards"
                                trend="neutral"
                                color="purple"
                            />
                            <StatsCard
                                title="Total Candidates"
                                value={stats?.total_attendees || 0}
                                icon={Users}
                                description="Citizens Trained"
                                trend="up"
                                color="orange"
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
                                <h3 className="font-semibold text-gray-900 mb-1">Manage Field Trainers</h3>
                                <p className="text-sm text-gray-500">Create accounts and assign trainers to Wards/LSGIs.</p>
                            </div>

                            <div
                                className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => setActiveTab('SESSIONS')}
                            >
                                <div className="h-10 w-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center mb-4">
                                    <Calendar className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Session Management</h3>
                                <p className="text-sm text-gray-500">Schedule new sessions and view upcoming training.</p>
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
                    { id: 'TRAINERS', label: 'Field Trainers' },
                    { id: 'SESSIONS', label: 'Sessions' }
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
