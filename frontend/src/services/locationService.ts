import api from '../api/client';

export interface District {
    id: number;
    name: string;
    code: string;
}

export interface Block {
    id: number;
    name: string;
    code: string;
    district: number;
}

export interface LSGI {
    id: number;
    name: string;
    lsgi_type: 'GP' | 'MUNICIPALITY' | 'CORPORATION' | 'BP' | 'DP';
    block: number | null;
    district: number;
    // Helper fields for display
    district_name?: string;
    block_name?: string;
    admin_info?: {
        username: string;
        phone: string;
    } | null;
}

export interface LSGICreatePayload extends Partial<LSGI> {
    admin_username?: string;
    admin_password?: string;
    admin_email?: string;
    admin_phone?: string;
}

export const LocationService = {
    // Districts
    getDistricts: async () => {
        const response = await api.get<District[]>('/locations/districts/');
        return response.data;
    },

    // Blocks
    getBlocks: async (districtId?: number) => {
        const params = districtId ? { district: districtId } : {};
        const response = await api.get<Block[]>('/locations/blocks/', { params });
        return response.data;
    },

    // LSGIs
    getLSGIs: async (filters: { district?: number; block?: number } = {}) => {
        const response = await api.get<LSGI[]>('/locations/lsgis/', { params: filters });
        return response.data;
    },

    createLSGI: async (data: LSGICreatePayload) => {
        const response = await api.post<LSGI>('/locations/lsgis/', data);
        return response.data;
    },

    updateLSGI: async (id: number, data: Partial<LSGI>) => {
        const response = await api.put<LSGI>(`/locations/lsgis/${id}/`, data);
        return response.data;
    },

    deleteLSGI: async (id: number) => {
        await api.delete(`/locations/lsgis/${id}/`);
    }
};
