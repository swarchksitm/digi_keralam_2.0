
import React, { useState, useEffect } from 'react';
import { UserService, type AdminUser } from '../../services/userService';

import { UserCog, Search } from 'lucide-react';

export const LocalTrainerList: React.FC = () => {
    const [trainers, setTrainers] = useState<AdminUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            // Load Trainers
            const trainerData = await UserService.getAdminUsers('LSGI_FIELD_TRAINER');
            setTrainers(trainerData);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Filter Logic
    const filteredTrainers = trainers.filter(trainer => {
        return trainer.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trainer.first_name?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading local trainers...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex flex-col gap-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Local Field Trainers</h2>
                        <p className="text-sm text-gray-500">View field trainers assigned to your LSGIs (Created by Master Trainers)</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search trainers..."
                            className="pl-9 pr-4 py-2 w-full rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Trainer</th>
                            <th className="px-4 py-3">LSGI / Ward</th>
                            <th className="px-4 py-3">Contact</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredTrainers.map(trainer => (
                            <tr key={trainer.id} className="hover:bg-gray-50/50">
                                <td className="px-4 py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="h-8 w-8 rounded-full bg-[#193756] text-white flex items-center justify-center">
                                            <UserCog className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{trainer.username}</p>
                                            <p className="text-xs text-gray-500">{trainer.first_name} {trainer.last_name}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    {trainer.profile?.lsgi?.name ? (
                                        <div className="flex flex-col gap-1">
                                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 w-fit">
                                                {trainer.profile.lsgi.name}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                {/* @ts-ignore */}
                                                {trainer.profile.ward ? `Ward: ${trainer.profile.ward.name} (${trainer.profile.ward.ward_number})` : 'All Wards'}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-gray-400 italic">Unassigned</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-gray-600">
                                    <div>{trainer.email}</div>
                                    <div className="text-xs">{trainer.phone}</div>
                                </td>
                            </tr>
                        ))}
                        {filteredTrainers.length === 0 && (
                            <tr>
                                <td colSpan={3} className="text-center py-8 text-gray-500">
                                    No trainers found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
