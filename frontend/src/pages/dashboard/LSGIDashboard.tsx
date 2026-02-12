
import React, { useState, useEffect } from 'react';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { BarChart3, CheckCircle, Map, UserCog, Users } from 'lucide-react';
import { MasterTrainerManager } from '../../components/dashboard/MasterTrainerManager';
import { LocalTrainerList } from '../../components/dashboard/LocalTrainerList';
import { SessionManager } from '../../components/dashboard/SessionManager';
import { Navbar } from '../../components/layout/Navbar';


const LSGIDashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'MASTER_TRAINERS' | 'LOCAL_TRAINERS' | 'SESSIONS'>('OVERVIEW');

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setIsLoading(true);
        try {
            // Placeholder: Fetch stats from new endpoint or reuse existing if capable
            // const response = await api.get('/dashboard/stats/'); 
            // setStats(response.data);

            // Mock stats for now to unblock UI
            setStats({
                upcoming_sessions: 0,
                total_attendees: 0,
                total_sessions: 0,
                wards_covered: 0
            });
        } catch (error) {
            console.error("Failed to load stats", error);
        } finally {
            setIsLoading(false);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'MASTER_TRAINERS':
                return <MasterTrainerManager />;
            case 'LOCAL_TRAINERS':
                return <LocalTrainerList />;
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
                                    value={stats.upcoming_sessions}
                                    icon={BarChart3}
                                    color="blue"
                                    description="Planned Training Events"
                                />
                                <StatsCard
                                    title="Total Attendance"
                                    value={stats.total_attendees}
                                    icon={Users}
                                    color="orange"
                                    description="Citizens Attended"
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
                                    color="green"
                                    description="Unique wards reached"
                                />
                            </div>
                        )}

                        {/* Quick Actions / Shortcuts */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('MASTER_TRAINERS')}>
                                <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                                    <UserCog className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Manage Master Trainers</h3>
                                <p className="text-sm text-gray-500">Create and manage District Master Trainers.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('LOCAL_TRAINERS')}>
                                <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                    <Users className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">View Local Trainers</h3>
                                <p className="text-sm text-gray-500">View Field Trainers created by Master Trainers.</p>
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => setActiveTab('SESSIONS')}>
                                <div className="h-10 w-10 bg-green-50 text-green-600 rounded-lg flex items-center justify-center mb-4">
                                    <CheckCircle className="h-6 w-6" />
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">Training Sessions</h3>
                                <p className="text-sm text-gray-500">Manage sessions and attendance.</p>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">LSGI Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage trainers and sessions for your Local Self Government Institution.</p>
                </div>

                {/* Tabs Navigation */}
                <div className="flex space-x-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200 mb-8 w-fit overflow-x-auto">
                    {[
                        { id: 'OVERVIEW', label: 'Overview' },
                        { id: 'MASTER_TRAINERS', label: 'Master Trainers' },
                        { id: 'LOCAL_TRAINERS', label: 'Local Trainers' },
                        { id: 'SESSIONS', label: 'Sessions & Attendance' }
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
        </div>
    );
};

export default LSGIDashboard;
