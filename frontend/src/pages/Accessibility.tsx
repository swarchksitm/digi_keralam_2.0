import React from 'react';
import { Navbar } from '../components/layout/Navbar';

const Accessibility: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Accessibility Help</h1>
                <div className="prose max-w-none text-gray-600">
                    <p className="mb-4">
                        Digi Keralam 2.0 is committed to ensuring digital accessibility for people with disabilities.
                        We are continually improving the user experience for everyone and applying the relevant accessibility standards.
                    </p>

                    <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Accessibility Features</h2>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Skip to Main Content:</strong> Keyboard users can bypass the navigation menu and jump directly to the main content.</li>
                        <li><strong>Screen Reader Access:</strong> Our application is designed to be compatible with popular screen readers.</li>
                        <li><strong>Keyboard Navigation:</strong> All interactive elements are accessible via keyboard.</li>
                        <li><strong>High Contrast:</strong> We maintain sufficient color contrast ratios for better readability.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Feedback</h2>
                    <p>
                        We welcome your feedback on the accessibility of Digi Keralam 2.0.
                        Please let us know if you encounter accessibility barriers on this site.
                    </p>
                </div>
            </main>
        </div>
    );
};

export default Accessibility;
