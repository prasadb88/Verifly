import React, { useState, useEffect, useCallback } from 'react';
import {
    CheckCircle, Shield, TrendingUp, ArrowRight, Star,
    FileText, Car, Search, Clock, Layers, Calendar,
    Mail, Settings, Bell, Tag, MessageSquare
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ui/theme-provider';
import { useSelector } from 'react-redux';

import axios from 'axios';
import SellerDashboard from './Sellerdashboard';

// --- Reusable UI Components ---

const LandingButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    let baseStyle = "px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-4 flex items-center justify-center";

    if (variant === 'primary') {
        // Primary CTA: Start Searching
        baseStyle += " bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-600 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-[1.02] focus:ring-blue-500/50";
    } else if (variant === 'secondary') {
        // Secondary CTA: For less critical navigation
        baseStyle += " bg-white/5 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200";
    } else if (variant === 'tertiary') {
        // For quick action links/ghost buttons
        baseStyle += " bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 text-base py-2 px-4 rounded-lg shadow-md";
    }

    return (
        <button
            onClick={onClick}
            className={`${baseStyle} ${className}`}
        >
            {children}
        </button>
    );
};

// --- Dashboard Stat Card ---
const StatCard = ({ icon: Icon, title, value, colorClass = 'text-blue-500', trendIcon: TrendIcon, onClick }) => (
    <div
        onClick={onClick}
        className={`bg-white/80 dark:bg-gray-900/40 p-5 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between ${onClick ? 'cursor-pointer hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]' : ''}`}
    >
        <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">{title}</h3>
            <div className={`p-2 rounded-full ${colorClass} bg-opacity-10`}>
                <Icon className={`w-5 h-5 ${colorClass}`} />
            </div>
        </div>
        <div className="mt-4 flex items-end justify-between">
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white">{value}</p>
            {TrendIcon && (
                <div className="flex items-center text-xs font-semibold text-green-500 dark:text-green-400">
                    <TrendIcon className="w-4 h-4 mr-1" />

                </div>
            )}
        </div>
    </div>
);

// --- Activity Feed Item ---
const ActivityItem = ({ icon: Icon, title, time, colorClass = 'text-blue-500' }) => (
    <div className="flex items-center space-x-4 py-3 border-b last:border-b-0 border-gray-100 dark:border-gray-800">
        <div className={`p-2 rounded-full ${colorClass} bg-opacity-10 flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
        <div className="flex-grow">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-gray-400 dark:text-gray-600 transition-transform hover:translate-x-1 cursor-pointer" />
    </div>
);

// Helper to map backend icon string to Component
const getIconComponent = (iconName) => {
    const iconMap = {
        "Car": Car,
        "MessageSquare": MessageSquare,
        "TrendingUp": TrendingUp,
        "Tag": Tag,
        "FileText": FileText
    };
    return iconMap[iconName] || Bell; // Default to Bell
};

// --- ABSTRACT WAVE ANIMATION COMPONENT ---
const AbstractWaves = () => (
    <>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
            {/* Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[100px] animate-pulse-slow delay-1000" />
        </div>
    </>
);

// --- MAIN DASHBOARD COMPONENT ---
const UserDashboard = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const currentUser = useSelector((state) => state.auth.user);

    const userName = currentUser?.name || "Guest User";
    const profilePictureUrl = currentUser?.profileImage || "https://placehold.co/100x100/3B82F6/FFFFFF?text=JL";

    // --- SELLER / ADMIN REDIRECT ---
    if (currentUser?.role === 'dealer' || currentUser?.role === 'admin') {
        return <SellerDashboard />;
    }

    // --- BUYER FOCUSED STATS: Market Engagement & Insight ---
    // --- BUYER FOCUSED STATS: Market Engagement & Insight ---

    // --- BUYER FOCUSED ACTIVITY ---
    const [stats, setStats] = useState([
        { icon: Shield, title: "Profile Status", value: "Verified", color: "text-green-500", trend: null, path: "/complete-profile" },
        { icon: MessageSquare, title: "Active Conversations", value: "0", color: "text-indigo-500", trend: null, path: "/chat" },
        { icon: Clock, title: "Pending Requests", value: "0", color: "text-teal-500", trend: TrendingUp, path: "/my-test-drives" },
        { icon: CheckCircle, title: "Test Drives Taken", value: "0", color: "text-yellow-500", trend: null, path: "/my-test-drives" },
    ]);
    const [recentActivity, setRecentActivity] = useState([]);
    const [engagements, setEngagements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isConnected, setIsConnected] = useState(false);
    const { socket } = useSelector((state) => state.auth);

    const fetchDashboardData = useCallback(async () => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/v1/user/dashboard-stats`,
                { withCredentials: true }
            );

            if (response.data?.success) {
                const { stats, activity, engagements } = response.data.data;

                const statsMap = {
                    "Profile Status": { icon: Shield, color: "text-blue-500", path: "/settings" },
                    "Active Conversations": { icon: MessageSquare, color: "text-indigo-500", path: "/chat" },
                    "Pending Requests": { icon: Clock, color: "text-teal-500", trend: TrendingUp, path: "/my-test-drives" },
                    "Test Drives Taken": { icon: CheckCircle, color: "text-yellow-500", path: "/my-test-drives" }
                };

                const transformedStats = stats.map(s => {
                    const config = statsMap[s.title] || { icon: Star, color: "text-gray-500" };
                    return {
                        ...s,
                        icon: config.icon,
                        color: s.color || config.color,
                        trend: config.trend || null,
                        path: config.path
                    };
                });

                setStats(transformedStats);

                // Transform activity
                const transformedActivity = activity.map(a => ({
                    ...a,
                    icon: getIconComponent(a.icon)
                }));
                setRecentActivity(transformedActivity);

                // Transform engagements
                if (engagements) {
                    const transformedEngagements = engagements.map(e => ({
                        ...e,
                        icon: getIconComponent(e.icon),
                        actionIcon: getIconComponent(e.actionIcon)
                    }));
                    setEngagements(transformedEngagements);
                }
            }
        } catch (error) {
            console.error("Failed to fetch dashboard stats", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {

        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            const senderName = newMessage.sender?.name || newMessage.sender?.username || "Someone";

            const newActivityItem = {
                icon: MessageSquare,
                title: `New message from ${senderName}`,
                time: "Just now",
                color: "text-blue-500"
            };

            setRecentActivity(prev => [newActivityItem, ...prev]);

            setStats(prevStats => prevStats.map(stat =>
                stat.title === "Active Conversations"
                    ? { ...stat, value: Number(stat.value) + 1 } // Simple increment
                    : stat
            ));
        };

        const handleStatusUpdate = (data) => {
            // Refresh stats when test drive status changes (e.g. accepted, rejected)
            fetchDashboardData();
            const newActivityItem = {
                icon: CheckCircle,
                title: `Test Drive Update: ${data.status}`,
                time: "Just now",
                color: "text-green-500"
            };
            setRecentActivity(prev => [newActivityItem, ...prev]);
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("testDriveStatusUpdate", handleStatusUpdate);


        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("testDriveStatusUpdate", handleStatusUpdate);

        };
    }, [socket, fetchDashboardData]);



    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    return (
        // Enclosing div ensures dark mode class is correctly applied
        <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'} transition-colors duration-500 overflow-x-hidden relative font-sans selection:bg-blue-500/30`}>

            <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6 lg:px-8">

                <AbstractWaves />

                {/* --- 1. Hero / Welcome Section --- */}
                <section className="relative text-left py-12 md:pt-24 md:pb-16 z-20">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div className='flex items-center mb-6 md:mb-0'>
                            <img
                                src={profilePictureUrl}
                                alt="Profile"
                                className="w-16 h-16 rounded-full ring-4 ring-blue-500/50 mr-4 shadow-xl object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/100x100/3B82F6/FFFFFF?text=JL" }} // Fallback
                            />
                            <div>
                                <h1 className="text-3xl md:text-5xl font-extrabold mb-1 leading-tight tracking-tight">
                                    Welcome,
                                    <span className="ml-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                        {userName}
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-600 dark:text-gray-400">
                                    Monitor your favorite listings and manage communications.
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions for Desktop */}
                        <div className="hidden sm:flex flex-row gap-4">
                            <LandingButton onClick={() => navigate('/cars')} variant="primary" className="text-base py-3 px-5">
                                <Search className="w-5 h-5 mr-2" /> Start New Search
                            </LandingButton>
                            <LandingButton onClick={() => navigate('/chat')} variant="tertiary" className="text-base py-3 px-5">
                                <Mail className="w-5 h-5 mr-2" /> Inbox
                            </LandingButton>
                        </div>

                    </div>
                </section>

                <section className="pb-16">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                icon={stat.icon}
                                title={stat.title}
                                value={stat.value}
                                colorClass={stat.color}
                                trendIcon={stat.trend}
                                onClick={() => stat.path && navigate(stat.path)}
                            />
                        ))}
                    </div>
                </section>

                {/* --- 3. Dashboard Modules (Watchlist & Activity) --- */}
                <section className="pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Active Engagements (2/3 width) */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 dark:bg-gray-900/40 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 backdrop-blur-xl h-full">
                            <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-100 dark:border-gray-800">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                                    <Layers className="w-6 h-6 mr-3 text-blue-500" /> Active Engagements
                                </h2>
                                <button onClick={() => navigate('/offers')} className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 transition-colors">
                                    Manage Offers <ArrowRight className="w-4 h-4 inline ml-1" />
                                </button>
                            </div>

                            {/* Active Engagements List */}
                            <div className="space-y-4">
                                {engagements.length > 0 ? (
                                    engagements.map((item, index) => {
                                        const ItemIcon = item.icon;
                                        const ActionIcon = item.actionIcon;
                                        return (
                                            <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/60 rounded-xl flex items-center justify-between transition-shadow duration-300 hover:shadow-md cursor-pointer">
                                                <div className="flex items-center">
                                                    <div className={`w-12 h-12 ${item.bg} rounded-lg flex items-center justify-center mr-4`}>
                                                        <ItemIcon className={`w-6 h-6 ${item.color}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">{item.title}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.subtitle}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className={`text-sm font-bold ${item.color}`}>{item.statusText}</span>
                                                    {ActionIcon && <ActionIcon className={`w-5 h-5 ${item.actionColor}`} />}
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800">
                                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Start Your Journey</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Here is how to get the most out of Verifly:</p>

                                            <div className="space-y-4 text-left">
                                                <div onClick={() => navigate('/cars')} className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-xl cursor-pointer hover:shadow-md transition-shadow">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                                                        <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">1. Browse Inventory</p>
                                                        <p className="text-xs text-gray-500">Find your dream car from our verified listings.</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-xl opacity-75">
                                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg mr-3">
                                                        <MessageSquare className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">2. Connect with Dealers</p>
                                                        <p className="text-xs text-gray-500">Ask questions and negotiate directly.</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start p-3 bg-white dark:bg-gray-800 rounded-xl opacity-75">
                                                    <div className="p-2 bg-teal-100 dark:bg-teal-900 rounded-lg mr-3">
                                                        <Calendar className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-gray-100">3. Book Test Drives</p>
                                                        <p className="text-xs text-gray-500">Schedule appointments to try before you buy.</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <button onClick={() => navigate('/cars')} className="mt-6 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors text-sm">
                                                Browse Cars Now
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Recent Activity (1/3 width) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 dark:bg-gray-900/40 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 backdrop-blur-xl h-full">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center mb-6 border-b pb-4 border-gray-100 dark:border-gray-800">
                                <Bell className="w-6 h-6 mr-3 text-teal-500" /> Buyer Alerts
                            </h2>

                            <div className="divide-y divide-gray-100 dark:divide-gray-800">
                                {recentActivity.map((item, index) => (
                                    <ActivityItem
                                        key={index}
                                        icon={item.icon}
                                        title={item.title}
                                        time={item.time}
                                        colorClass={item.color}
                                    />
                                ))}
                            </div>

                            <div className="mt-6">
                                <LandingButton onClick={() => navigate('/notifications')} variant="tertiary" className="w-full text-sm">
                                    View All Alerts
                                </LandingButton>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Quick Actions for Mobile/Tablet */}
                <section className="py-8 sm:hidden">
                    <div className="flex justify-between gap-4">
                        <LandingButton onClick={() => navigate('/cars')} variant="primary" className="text-base py-3 px-5 flex-1">
                            <Search className="w-5 h-5 mr-2" /> Start New Search
                        </LandingButton>
                        <LandingButton onClick={() => navigate('/settings')} variant="tertiary" className="text-base py-3 px-5 flex-1">
                            <Settings className="w-5 h-5 mr-2" /> Settings
                        </LandingButton>
                    </div>
                </section>

            </div>

            {/* --- Global Styles & Keyframes --- */}
            <style>{`
                /* Tailwind's bg-background and text-foreground setup (using simplified values here) */
                .bg-background { background-color: ${theme === 'dark' ? '#0a0a0a' : '#f9fafb'}; }
                .text-foreground { color: ${theme === 'dark' ? '#f3f4f6' : '#1f2937'}; }
                
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 0.2; }
                    50% { transform: scale(1.1); opacity: 0.4; }
                }
                .animate-pulse-slow { 
                    animation: pulse-slow 12s cubic-bezier(0.4, 0, 0.6, 1) infinite; 
                }

                @keyframes float-fast {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-float-fast {
                    animation: float-fast 4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

// Export the main component
export default UserDashboard;
