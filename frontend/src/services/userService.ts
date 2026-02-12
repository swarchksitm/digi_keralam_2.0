
import api from '../api/client';

export interface AdminUser {
    id: number;
    username: string;
    email: string;
    phone: string;
    role: string;
    first_name: string;
    last_name: string;
    district_id?: number;
    profile?: {
        district: {
            id: number;
            name: string;
        } | null;
        lsgi?: {
            id: number;
            name: string;
        } | null;
    };
}

export interface CreateAdminPayload {
    username: string;
    email: string;
    phone: string;
    password: string;
    first_name: string;
    last_name: string;
    district_id?: number; // Required for District Admin
}

export const UserService = {
    getAdminUsers: async (role?: string) => {
        const params = role ? { role } : {};
        const response = await api.get<AdminUser[]>('/auth/admin-users/', { params });
        return response.data;
    },

    createAdminUser: async (data: CreateAdminPayload) => {
        const response = await api.post<AdminUser>('/auth/admin-users/', data);
        return response.data;
    },

    deleteAdminUser: async (id: number) => {
        await api.delete(`/auth/admin-users/${id}/`);
    }
};
