import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Column 1: Logos & About */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 bg-white p-3 rounded-lg w-fit">
                            <a href="https://kerala.gov.in/" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="/images/kerala-govt.svg"
                                    alt="Government of Kerala Logo"
                                    className="h-12 w-auto"
                                />
                            </a>
                            <div className="h-8 w-px bg-gray-200"></div>
                            <a href="https://itmission.kerala.gov.in/" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="/images/itmission25.svg"
                                    alt="Kerala State IT Mission Logo"
                                    className="h-12 w-auto"
                                />
                            </a>
                        </div>
                        <p className="text-sm text-gray-400 leading-relaxed">
                            Digi Keralam 2.0 is a comprehensive digital literacy initiative by the Government of Kerala, led by the Kerala State IT Mission, to empower every citizen with essential digital skills.
                        </p>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/" className="hover:text-primary-400 transition">Home</Link></li>
                            <li><Link to="/login" className="hover:text-primary-400 transition">Login</Link></li>
                            <li><a href="#" className="hover:text-primary-400 transition">About the Mission</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition">Training Modules</a></li>
                            <li><a href="#" className="hover:text-primary-400 transition">Become a Trainer</a></li>
                        </ul>
                    </div>

                    {/* Column 3: Contact Info */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Contact Us</h3>
                        <ul className="space-y-4 text-sm">
                            <li className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>
                                    Kerala State IT Mission,<br />
                                    Pattom.P.O, Vrindavan Gardens, Saankethika,<br />
                                    Thiruvananthapuram, Kerala-695004
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>0471-2726881, 2314307</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary-500 shrink-0" />
                                <span>admin.ksitm@kerala.gov.in</span>
                            </li>
                        </ul>
                    </div>

                    {/* Column 4: Social Media */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <a href="#" className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition group">
                                <Facebook className="h-5 w-5 group-hover:scale-110 transition" />
                            </a>
                            <a href="#" className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition group">
                                <Twitter className="h-5 w-5 group-hover:scale-110 transition" />
                            </a>
                            <a href="#" className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition group">
                                <Instagram className="h-5 w-5 group-hover:scale-110 transition" />
                            </a>
                            <a href="#" className="h-10 w-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-primary-600 hover:text-white transition group">
                                <Youtube className="h-5 w-5 group-hover:scale-110 transition" />
                            </a>
                        </div>
                        <div className="mt-8">
                            <p className="text-xs text-gray-500">
                                © {new Date().getFullYear()} Government of Kerala. <br />
                                All Rights Reserved.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-white transition">Privacy Policy</a>
                        <a href="#" className="hover:text-white transition">Terms of Service</a>
                        <a href="#" className="hover:text-white transition">Accessibility Statement</a>
                    </div>
                    <div>
                        Powered by <strong>Kerala State IT Mission</strong>
                    </div>
                </div>
            </div>
        </footer>
    );
};
