import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Shield, Brain, Lightbulb, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthStore } from '../auth/store';
import { useNavigate } from 'react-router-dom';
import { getDashboardPath } from '../utils/roleUtils';

const Landing: React.FC = () => {
    const { isAuthenticated, user } = useAuthStore();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (isAuthenticated && user) {
            navigate(getDashboardPath(user.role));
        }
    }, [isAuthenticated, user, navigate]);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <main id="main-content">
                <section className="relative overflow-hidden bg-white py-24 sm:py-32">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary-100 via-white to-white opacity-60"></div>
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                        <div className="max-w-4xl mx-auto">
                            <h1 className="text-5xl sm:text-7xl font-bold text-gray-900 tracking-tight leading-tight mb-8">
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-primary-500">
                                    Empowering Every Citizen
                                </span>
                                with Digital Skills
                            </h1>
                            <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                                Join Kerala's massive digital literacy movement. Learn Safe Tech, AI, and Entrepreneurship skills to thrive in the modern world.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link to="/login">
                                    <Button size="lg" className="w-full sm:w-auto px-8 py-6 text-lg shadow-apple hover:scale-105 transition-transform">
                                        Get Started
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2 px-8 py-6 text-lg rounded-full border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                                    <Video className="h-5 w-5" /> Watch Video
                                </Button>
                            </div>
                        </div>

                        {/* Mascot / Video Section */}
                        <div className="mt-20 relative max-w-5xl mx-auto">
                            <div className="aspect-[21/9] glass-card rounded-3xl shadow-apple overflow-hidden border border-white/40 group relative">
                                <video
                                    className="w-full h-full object-cover"
                                    controls
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    poster="/images/dk-logo.png"
                                >
                                    <source src="/videos/mascot.mp4" type="video/mp4" />
                                    Your browser does not support the video tag.
                                </video>

                                {/* Decorative elements - Blurred overlay for depth */}
                                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(255,255,255,0.5)] rounded-3xl"></div>
                            </div>

                            {/* Background Glow Effects */}
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-secondary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob -z-10"></div>
                            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob animation-delay-2000 -z-10"></div>
                        </div>
                    </div>
                </section>

                {/* Pillars Section */}
                <section className="py-24 bg-gray-50/50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Three Pillars of Excellence</h2>
                        <p className="text-gray-500 max-w-2xl mx-auto text-lg">
                            Our comprehensive curriculum covers essential aspects of modern digital life.
                        </p>
                    </div>

                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Pillar 1 */}
                        <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="h-14 w-14 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                <Shield className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Safe Tech</h3>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                Identify and report scams, understand cyber hygiene, and protect your digital identity securely.
                            </p>
                        </div>

                        {/* Pillar 2 */}
                        <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="h-14 w-14 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                                <Brain className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Education</h3>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                Understand the basics of Artificial Intelligence and how you can use simple AI tools in daily life.
                            </p>
                        </div>

                        {/* Pillar 3 */}
                        <div className="glass-card p-8 hover:-translate-y-1 transition-transform duration-300">
                            <div className="h-14 w-14 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-500/20">
                                <Lightbulb className="h-7 w-7" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">DEED</h3>
                            <p className="text-gray-500 leading-relaxed text-lg">
                                Digitalisation of Every Essential Document. Learn to use digital tools for livelihood.
                            </p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
        </div>
    );
};

export default Landing;
