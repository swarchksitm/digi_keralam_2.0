export const getDashboardPath = (role?: string) => {
    switch (role) {
        case 'KSITM_SUPER_ADMIN':
        case 'LSGD_STATE_ADMIN':
            return '/admin/dashboard';
        case 'LSGD_DISTRICT_ADMIN':
            return '/district/dashboard';
        case 'DISTRICT_MASTER_TRAINER':
        case 'LSGI_FIELD_TRAINER':
            return '/trainer/dashboard';
        case 'CITIZEN':
            return '/citizen/dashboard';
        default:
            return '/';
    }
};
