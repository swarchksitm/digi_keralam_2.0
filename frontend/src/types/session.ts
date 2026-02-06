export interface Ward {
    id: number;
    number: number;
    name: string;
}

export interface TrainingSession {
    id: number;
    title: string;
    description: string;
    ward: number | Ward; // ID or object depending on serializer depth
    category: 'SAFE_TECH' | 'AI_EDU' | 'DEED';
    proficiency: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    mode: 'OFFLINE' | 'ONLINE';
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
    date_time: string;
    venue: string;
    is_assigned?: boolean;
}
