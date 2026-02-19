
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
        wards?: {
            id: number;
            name: string;
            ward_number: number;
        }[];
        age?: number;
        highest_qualification?: string;
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
    getAdminUsers: async (role?: string, additionalParams: any = {}) => {
        const params = { ...(role ? { role } : {}), ...additionalParams };
        const response = await api.get<AdminUser[]>('/auth/admin-users/', { params });
        return response.data;
    },

    createAdminUser: async (data: CreateAdminPayload) => {
        const response = await api.post<AdminUser>('/auth/admin-users/', data);
        return response.data;
    },

    deleteAdminUser: async (id: number) => {
        await api.delete(`/auth/admin-users/${id}/`);
    },

    updateAdminUser: async (id: number, data: any) => {
        const response = await api.patch(`/auth/admin-users/${id}/`, data);
        return response.data;
    },

    getAdminUser: async (id: number) => {
        const response = await api.get(`/auth/admin-users/${id}/`);
        return response.data;
    },

    approveUser: async (id: number, wardIds?: number[]) => {
        await api.post(`/auth/admin-users/${id}/approve/`, { ward_ids: wardIds });
    }
};
