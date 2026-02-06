import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Button } from '../components/ui/Button';
import { Shield, Brain, Lightbulb, ArrowRight, Video } from 'lucide-react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative overflow-hidden bg-primary-50 py-20 sm:py-32">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
                                Empowering Every Citizen with Digital Skills
                            </h1>
                            <p className="text-lg text-gray-600 mb-8 leading-relaxed max-w-lg">
                                Join Kerala's massive digital literacy movement. Learn Safe Tech, AI, and Entrepreneurship skills to thrive in the modern world.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link to="/login">
                                    <Button size="lg" className="w-full sm:w-auto gap-2">
                                        Get Started <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                                    <Video className="h-4 w-4" /> Watch Video
                                </Button>
                            </div>
                        </div>

                        {/* Mascot / Video Placeholder */}
                        <div className="relative">
                            <div className="aspect-video bg-primary-200 rounded-2xl shadow-xl flex items-center justify-center overflow-hidden">
                                <span className="text-primary-800 font-medium text-lg">Mascot Video Placeholder</span>
                                {/* Decorative circles */}
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-secondary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
                                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pillars Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Three Pillars of Digital Literacy</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Our comprehensive curriculum covers essential aspects of modern digital life, ensuring no citizen is left behind.
                    </p>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Pillar 1 */}
                    <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                        <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                            <Shield className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Safe Tech</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Identify and report scams, understand cyber hygiene, and protect your digital identity securely.
                        </p>
                    </div>

                    {/* Pillar 2 */}
                    <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                        <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                            <Brain className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">AI Education</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Understand the basics of Artificial Intelligence and how you can use simple AI tools in daily life.
                        </p>
                    </div>

                    {/* Pillar 3 */}
                    <div className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-shadow border border-gray-100">
                        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                            <Lightbulb className="h-6 w-6" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">DEED</h3>
                        <p className="text-gray-600 leading-relaxed">
                            Digital Entrepreneurship and Employment Development. Learn to use digital tools for livelihood.
                        </p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-300 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="text-sm">
                        © 2024 Digi Keralam 2.0. A Government of Kerala Initiative.
                    </div>
                    <div className="flex gap-6 text-sm font-medium">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">Contact Support</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
