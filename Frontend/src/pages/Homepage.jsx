import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Zap, Shield, TrendingUp, ArrowRight, UserPlus, LogIn, Star, Users, Camera, FileText, Car, Sun, Moon, Search, Award } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';


const LandingButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    let baseStyle = "px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-4 flex items-center justify-center";

    if (variant === 'primary') {
        // Primary CTA: Bright blue/teal gradient
        baseStyle += " bg-gradient-to-r from-blue-600 to-indigo-500 text-white hover:from-blue-700 hover:to-indigo-600 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:scale-[1.02] focus:ring-blue-500/50";
    } else if (variant === 'secondary') {
        // Secondary CTA: Outline style
        baseStyle += " bg-white/5 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700 hover:bg-white/10 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200";
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

// --- Reusable Feature Card (Dynamic Theme Styling) ---
const FeatureCard = ({ icon: Icon, title, description, colorClass = 'text-blue-500' }) => (
    <div className="bg-white/80 dark:bg-gray-900/40 p-6 md:p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-800 transition-all duration-500 hover:shadow-xl hover:scale-[1.02] flex flex-col h-full backdrop-blur-xl">
        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl bg-gray-50 dark:bg-gray-800 mb-6 ${colorClass}`}>
            <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
);

// --- Trust Pill Component ---
const TrustPill = ({ icon: Icon, text }) => (
    <div className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-full border border-gray-200 dark:border-gray-700 shadow-sm">
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{text}</span>
    </div>
);

// --- ABSTRACT WAVE ANIMATION COMPONENT ---
const AbstractWaves = () => (
    <>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0 ">
            {/* Gradient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 dark:bg-blue-600/10 blur-[100px] animate-pulse-slow" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-400/20 dark:bg-purple-600/10 blur-[100px] animate-pulse-slow delay-1000" />
        </div>
    </>
);

// --- Animated Car PNG Component ---
const CarPngRevised = ({ className, animationClass, darkUrl, lightUrl, isDark }) => (
    <div
        className={`absolute bg-contain bg-no-repeat pointer-events-none z-0 ${className} ${animationClass} transition-all duration-500`}
        style={{ backgroundImage: `url('${isDark ? darkUrl : lightUrl}')` }}
    />
);


// --- Landing Page Content ---
const LandingPageContent = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();

    // Compute isDark safely
    const isDark = theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const mainBgClass = "bg-background";
    const mainTextColorClass = "text-foreground";


    // Placeholder URLs 
    const pngUrls = {
        darkCar1: "/3.png",
        lightCar1: "/3.png",
        darkCar2: "/3.png",
        lightCar2: "/3.png",
    };

    return (
        <div className={`min-h-screen ${mainBgClass} ${mainTextColorClass} transition-colors duration-500 overflow-x-hidden relative font-sans selection:bg-blue-500/30`}>

            <div className="max-w-7xl mx-auto relative z-10">

                <AbstractWaves />

                {/* --- 1. Hero Section --- */}
                {/* Reduced padding for mobile (py-12), large for desktop (md:py-32) */}
                <section className="relative text-left py-12 px-6 md:py-32 md:px-6 z-20">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">

                        {/* LEFT: CONTENT */}
                        <div className='flex flex-col items-start'>
                            {/* New Headline Text */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 leading-[1.1] tracking-tight animate-in slide-in-from-bottom-5 duration-700">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                    Buying
                                </span> <br />
                                Redefined.
                            </h1>

                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg leading-relaxed">
                                Experience the future of automotive commerce. We use AI to verify every detail, ensuring you buy with absolute confidence.
                            </p>

                            {/* REPLACED SEARCH BAR WITH TRUST INDICATORS */}
                            <div className="flex flex-wrap gap-3 mb-10 animate-in fade-in slide-in-from-bottom-4 delay-200 duration-700">
                                <TrustPill icon={Shield} text="100% Secure" />
                                <TrustPill icon={Zap} text="AI Verified" />
                                <TrustPill icon={Users} text="Trusted Network" />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                <LandingButton onClick={() => navigate('/register')} variant="primary" className="w-full sm:w-auto">
                                    Start Free Trial
                                </LandingButton>
                                <LandingButton onClick={() => navigate('/login')} variant="secondary" className="w-full sm:w-auto">
                                    Explore Features
                                </LandingButton>
                            </div>
                        </div>

                        {/* RIGHT: VISUALS (Hidden on extremely small screens if needed, but kept for vibe) */}
                        <div className="relative mt-10 md:mt-0 h-[300px] md:h-[500px] w-full flex items-center justify-center">
                            {/* Abstract decorative elements */}
                            <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse-slow" />

                            {/* Dynamic Car Images */}
                            <CarPngRevised
                                className="w-[280px] h-[160px] md:w-[450px] md:h-[250px] top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
                                animationClass="animate-float-slow"
                                darkUrl={pngUrls.darkCar1}
                                lightUrl={pngUrls.lightCar1}
                                isDark={isDark}
                            />

                            {/* Floating Badge */}
                            <div className="absolute top-10 right-0 md:right-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 animate-float-fast z-20 hidden sm:block">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                                        <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Verification Status</p>
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">Passed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* --- 2. Feature Showcase --- */}
                <section id="features" className="py-20 px-6 relative z-20">
                    <div className="text-center mb-16 max-w-3xl mx-auto">
                        <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-sm uppercase mb-2 block">Why Verifly?</span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4">
                            Trust Built on Data.
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Our proprietary technology scans, verifies, and secures every listing so you never have to worry about hidden surprises.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                        <FeatureCard
                            icon={Camera}
                            title="YOLO Damage Detection"
                            description="Advanced computer vision automatically scans vehicle photos to detect, categorize, and report damage instantly."
                            colorClass="text-teal-500"
                        />
                        <FeatureCard
                            icon={FileText}
                            title="Instant RC Verification"
                            description="Real-time integration with secure government APIs to validate ownership, history, and compliance."
                            colorClass="text-purple-500"
                        />
                        <FeatureCard
                            icon={Shield}
                            title="Bank-Grade Security"
                            description="End-to-end encryption and multi-factor authentication protect your data and transactions at every step."
                            colorClass="text-pink-500"
                        />
                    </div>
                </section>

                {/* --- 3. How It Works (Informational Section) --- */}
                <section className="py-24 px-6 mb-20">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 dark:text-blue-400 font-bold tracking-wider text-sm uppercase mb-2 block">The Process</span>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-6">
                            From Listing to Sold in 3 Steps.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop Only) */}
                        <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-200 via-indigo-200 to-blue-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 -z-10" />

                        {/* Step 1 */}
                        <div className="relative group">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full border-4 border-blue-100 dark:border-gray-700 flex items-center justify-center mb-6 shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:border-blue-500 dark:group-hover:border-teal-400">
                                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-blue-600 dark:bg-teal-500 text-white flex items-center justify-center font-bold text-sm border-4 border-white dark:border-gray-900">1</span>
                                <Camera className="w-10 h-10 text-blue-600 dark:text-teal-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Capture Details</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm text-center px-4">
                                Simply upload photos of your car. Our guided flow ensures you capture every angle needed for a complete profile.
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative group">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full border-4 border-purple-100 dark:border-gray-700 flex items-center justify-center mb-6 shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:border-purple-500 dark:group-hover:border-purple-400">
                                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center font-bold text-sm border-4 border-white dark:border-gray-900">2</span>
                                <Zap className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-pulse" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">AI Verification</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm text-center px-4">
                                Our YOLOv8 engine instantly analyzes body damage, while APIs cross-check RC documents against government records.
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative group">
                            <div className="w-24 h-24 mx-auto bg-white dark:bg-gray-800 rounded-full border-4 border-green-100 dark:border-gray-700 flex items-center justify-center mb-6 shadow-xl relative z-10 transition-transform duration-500 group-hover:scale-110 group-hover:border-green-500 dark:group-hover:border-green-400">
                                <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center font-bold text-sm border-4 border-white dark:border-gray-900">3</span>
                                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 text-center">Get Certified</h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm text-center px-4">
                                Receive a Verified Trust Badge. Listings with our badge sell 3x faster because buyers know they can trust the data.
                            </p>
                        </div>
                    </div>

                    <div className="mt-16 text-center">
                        <LandingButton onClick={() => navigate('/register')} variant="primary" className="mx-auto shadow-2xl shadow-blue-500/20">
                            Start Your Selling Journey <ArrowRight className="w-5 h-5 ml-2" />
                        </LandingButton>
                    </div>
                </section>

            </div>

            <style>{`
                .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
};

export default LandingPageContent;