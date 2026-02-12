
import React from 'react';
import { UserManagement } from '../../components/dashboard/UserManagement';

export const SuperAdminDashboard: React.FC = () => {
    return (
        <>
            <div className="mt-8">
                <UserManagement roleType="LSGD_STATE_ADMIN" title="State Admin Management" />
            </div>
            <div className="mt-8">
                <UserManagement roleType="LSGD_DISTRICT_ADMIN" title="District Admin Management" readOnly={true} />
            </div>
            {/* Future: Add System Analytics, Global Settings, etc. */}
        </>
    );
};
