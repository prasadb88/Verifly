import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowLeft, Car, ShieldOff } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';

// --- Reusable Button Component ---
const ErrorButton = ({ children, onClick, variant = 'primary', className = '' }) => {
    let baseStyle = "px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-4 flex items-center justify-center";

    if (variant === 'primary') {
        // Primary: bg-primary text-primary-foreground
        baseStyle += " bg-primary text-primary-foreground hover:opacity-90 shadow-xl hover:shadow-2xl hover:scale-[1.02] focus:ring-ring/50";
    } else if (variant === 'secondary') {
        // Secondary: Outline style using global border/input colors
        baseStyle += " bg-secondary/10 backdrop-blur-sm border-2 border-input hover:bg-secondary/20 text-foreground";
    }

    return (
        <button onClick={onClick} className={`${baseStyle} ${className}`}>
            {children}
        </button>
    );
};

const ErrorPage = () => {
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme();

    // Determine dark mode for conditional rendering if strictly needed, 
    // but usually CSS handles it. Used here for the gradient if specific colors are needed.
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center transition-colors duration-500 overflow-hidden relative font-sans p-6">

            {/* --- Abstract Background Visuals --- */}
            {/* Using theme-aware opacity and colors */}
            <div className="absolute top-0 left-0 w-full h-full opacity-10 dark:opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500 via-transparent to-transparent animate-pulse-slow pointer-events-none" />

            <div className="relative z-10 text-center max-w-2xl bg-card/50 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-2xl border border-destructive/30">

                {/* --- Giant Error Code --- */}
                <h1 className="text-8xl md:text-[14rem] font-black leading-none mb-4 tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-900 dark:from-red-500 dark:to-red-900">
                    404
                </h1>

                {/* --- Message and Icon --- */}
                <div className="flex justify-center items-center mb-6">
                    <ShieldOff className="w-8 h-8 mr-3 text-destructive" />
                    <h2 className="text-3xl font-bold text-foreground">
                        Page Not Found
                    </h2>
                </div>

                <p className="text-lg text-muted-foreground mb-10">
                    Uh oh! The requested car listing or verification page seems to be missing. It might have been retired by the AI or driven off the lot.
                </p>

                {/* --- Navigation Buttons --- */}
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <ErrorButton onClick={() => navigate('/')} variant="primary">
                        <ArrowLeft className="w-5 h-5 mr-2" /> Back to Homepage
                    </ErrorButton>
                    <ErrorButton onClick={() => navigate('/')} variant="secondary">
                        <Car className="w-5 h-5 mr-2" /> Browse Listings
                    </ErrorButton>
                </div>

                {/* --- Decorative Footer --- */}
                <div className="mt-8 pt-6 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        If you believe this is an error, please contact support.
                    </p>
                </div>
            </div>

            <style>{`
                .animate-pulse-slow {
                    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </div>
    );
};

export default ErrorPage;