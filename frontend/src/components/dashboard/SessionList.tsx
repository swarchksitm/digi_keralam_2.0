import React from 'react';
import type { TrainingSession } from '../../types/session';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Calendar, MapPin, Users, Wifi, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { getMediaUrl } from '../../utils/url';

interface SessionListProps {
    sessions: TrainingSession[];
    isLoading: boolean;
    emptyMessage?: string;
    title: string;
    renderAction?: (session: TrainingSession) => React.ReactNode;
}

export const SessionList: React.FC<SessionListProps> = ({
    sessions,
    isLoading,
    emptyMessage = "No sessions found.",
    title,
    renderAction
}) => {
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading sessions...</div>;
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center p-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sessions.map((session) => (
                    <Card key={session.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-2">
                                <CardTitle className="text-lg font-bold text-primary-900 leading-tight">
                                    {session.title}
                                </CardTitle>
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${session.status === 'SCHEDULED' ? 'bg-[#193756]/10 text-[#193756]' :
                                    session.status === 'COMPLETED' ? 'bg-[#4edb80]/10 text-[#15803d]' : 'bg-red-50 text-red-600'
                                    }`}>
                                    {session.status}
                                </span>
                            </div>
                            <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                                {session.description}
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>{format(new Date(session.date_time), 'PPp')}</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span>
                                    {session.ward ? (
                                        typeof session.ward === 'object' ?
                                            `Ward ${session.ward.number || session.ward.name}` :
                                            `Ward ${session.ward}`
                                    ) : 'No Ward Assigned'}
                                    {session.venue && ` • ${session.venue}`}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <span className="capitalize">{session.proficiency.toLowerCase()} Level</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Wifi className="h-4 w-4 text-gray-400" />
                                <span className="capitalize">{session.mode.toLowerCase()}</span>
                            </div>

                            <div className="pt-2 flex flex-wrap gap-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                    {session.category.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Resources Section */}
                            {session.resources && session.resources.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-gray-100">
                                    <h4 className="text-xs font-semibold text-gray-700 mb-2">Training Materials:</h4>
                                    <div className="space-y-1">
                                        {session.resources.map((res: any) => (
                                            <a
                                                key={res.id}
                                                href={getMediaUrl(res.file)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 text-xs text-[#193756] hover:underline p-1 hover:bg-[#193756]/10 rounded"
                                            >
                                                <FileText className="h-3 w-3" />
                                                {res.title || 'View Document'}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {renderAction && (
                                <div className="pt-4 border-t border-gray-100">
                                    {renderAction(session)}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div >
    );
};
