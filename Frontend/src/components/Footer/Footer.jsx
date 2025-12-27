import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Twitter, Facebook, Linkedin, Award, User, Mail } from 'lucide-react';
import { useTheme } from '../ui/theme-provider';

const Footer = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Reactive dark check
    const isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const footerClass = "bg-gray-50 dark:bg-black border-t border-gray-200 dark:border-white/10";
    const linkClass = "text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300 cursor-pointer flex items-center gap-2";
    const headerClass = "text-lg font-bold mb-4 text-gray-900 dark:text-white";

    const quickLinks = [
        { name: "Home", action: () => navigate('/') },
        { name: "Features", action: () => navigate('/features') },
        { name: "About Us", action: () => navigate('/about-us') },
        { name: "Contact", action: () => navigate('/contact') },
    ];

    const accountLinks = [
        { name: "Sign Up", action: () => navigate('/register') },
        { name: "Sign In", action: () => navigate('/login') },
        { name: "List Your Car", action: () => navigate('/add-car') },
    ];

    return (
        <footer className={footerClass}>
            <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">

                {/* Main Footer Grid */}
                {/* Responsive: 1 col mobile, 2 cols tablet, 5 cols desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

                    {/* Brand Info (Spans 2 cols on Desktop) */}
                    <div className="md:col-span-2 lg:col-span-2">
                        <div className="flex items-center gap-3 mb-4 cursor-pointer" onClick={() => navigate('/')}>
                            <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">VERIFLY</span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-sm leading-relaxed">
                            The AI-powered car marketplace built for trust. We eliminate guesswork with real-time AI damage detection and document verification.
                        </p>
                        <div className="flex space-x-4">
                            <button aria-label="Twitter" className="p-2 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-blue-500 dark:hover:bg-blue-600 text-gray-600 dark:text-gray-300 hover:text-white transition-all duration-300">
                                <Twitter className="w-5 h-5" />
                            </button>
                            <button aria-label="Facebook" className="p-2 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-blue-600 dark:hover:bg-blue-600 text-gray-600 dark:text-gray-300 hover:text-white transition-all duration-300">
                                <Facebook className="w-5 h-5" />
                            </button>
                            <button aria-label="LinkedIn" className="p-2 rounded-full bg-gray-200 dark:bg-white/10 hover:bg-blue-700 dark:hover:bg-blue-600 text-gray-600 dark:text-gray-300 hover:text-white transition-all duration-300">
                                <Linkedin className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div>
                        <h4 className={headerClass}>Explore</h4>
                        <ul className="space-y-3">
                            {quickLinks.map(link => (
                                <li key={link.name}>
                                    <button onClick={link.action} className={linkClass}>{link.name}</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Account Links */}
                    <div>
                        <h4 className={headerClass}>Account</h4>
                        <ul className="space-y-3">
                            {accountLinks.map(link => (
                                <li key={link.name}>
                                    <button onClick={link.action} className={linkClass}>{link.name}</button>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Developer Info (New Section) */}
                    <div>
                        <h4 className={headerClass}>Developer</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                <span>Prasad Bhot</span>
                            </li>
                            <li>
                                <a href="mailto:prasadbhot02@gmail.com" className={linkClass}>
                                    <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    <span>prasadbhot02@gmail.com</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-200 dark:border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                        &copy; {new Date().getFullYear()} Verifly. All rights reserved.
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-green-600 dark:text-green-400 font-semibold bg-green-50 dark:bg-green-900/20 px-3 py-1 rounded-full">
                        <Award className="w-4 h-4" />
                        <span>Verified Trust Partner</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

export default Footer;