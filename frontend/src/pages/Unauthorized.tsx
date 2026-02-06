import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
                <h1 className="text-4xl font-bold text-red-600 mb-4">403</h1>
                <h2 className="text-2xl font-semibold mb-2">Unauthorized Access</h2>
                <p className="text-gray-600 mb-6">
                    You do not have permission to view this page.
                </p>
                <Link
                    to="/"
                    className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition"
                >
                    Go Home
                </Link>
            </div>
        </div>
    );
};

export default Unauthorized;
