import React, { useState, useEffect } from 'react';
import { Mail, User, Key, Zap, Chrome, Sun, Moon, CheckCircle, XCircle } from 'lucide-react';
import authService from "../config/authservice.js";
import { useDispatch, useSelector } from 'react-redux';
import { login as authLogin } from '../Store/authSlice.js';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ui/theme-provider';

// --- Helper Components ---
const GoogleIcon = Chrome;

const Label = ({ htmlFor, children }) => (
    <label
        htmlFor={htmlFor}
        // text-foreground handles both light (black) and dark (white)
        className="block text-sm font-medium text-foreground mb-1 transition-colors duration-300"
    >
        {children}
    </label>
);

const Input = ({ id, name, value, onChange, placeholder, type = 'text', icon: Icon, required = false, className = '' }) => (
    <div className="relative">
        {Icon && <Icon className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300" />}
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            // Standardizing variables: bg-input, border-input, text-foreground
            className={`w-full p-3 border border-input rounded-xl bg-background text-foreground shadow-sm transition-all duration-300 
                        focus:outline-none focus:ring-4 focus:ring-ring/20 
                        disabled:cursor-not-allowed disabled:opacity-50 
                        ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
        />
    </div>
);

const Button = ({ children, onClick, type = 'button', variant = 'default', className = '', disabled = false }) => {
    let baseStyle = "w-full py-3 rounded-xl font-bold text-lg shadow-lg transition duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";

    if (variant === 'default') {
        // Primary: bg-primary text-primary-foreground
        baseStyle += " bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.005] focus:ring-ring/50";
    } else if (variant === 'social') {
        // Outline/Secondary style
        baseStyle = "flex items-center justify-center w-full py-3 rounded-xl font-semibold text-foreground bg-secondary/50 border border-input transition duration-300 transform hover:bg-secondary active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-ring/20";
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

const Toast = ({ visible, message, type, onClose }) => {
    if (!visible) return null;
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-600' : 'bg-destructive';
    const Icon = isSuccess ? CheckCircle : XCircle;

    return (
        <div
            className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-xl text-white transition-opacity duration-300 transform translate-x-0 ${bgColor}`}
            role="alert"
        >
            <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-semibold text-sm">{message}</span>
                <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20 transition">
                    <Zap className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};


// --- Main Login Component ---
const Login = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme(); // Global Theme Hook

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ identifier: '', password: '' });
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });


    useEffect(() => {
        if (toast.visible) {
            const timer = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4000);
            return () => clearTimeout(timer);
        }
    }, [toast.visible]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const loginData = { password: formData.password };
        if (formData.identifier.includes('@')) {
            loginData.email = formData.identifier;
        } else {
            loginData.username = formData.identifier;
        }

        try {
            const response = await authService.login(loginData);
            if (response && response.data) {
                dispatch(authLogin({ userData: response.data }));
                setToast({ visible: true, message: 'Login successful! Redirecting...', type: 'success' });
                setTimeout(() => navigate('/'), 1500);
            } else {
                throw new Error("Invalid credentials.");
            }
        } catch (error) {
            setToast({ visible: true, message: error.message || 'Login failed.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    // Calculate generic check for icon display only (if needed for rendering different assets)
    // But for CSS, we use classes.
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex items-center justify-center p-4 overflow-hidden">

            <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

            <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl shadow-2xl p-6 md:p-8 border border-border transform transition-all duration-700 relative">

                {/* Theme Toggle Button */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-secondary-foreground hover:scale-105 transition-transform duration-300 shadow-sm"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                {/* Header */}
                <div className="mb-8 flex flex-col items-center">
                    <img
                        src="1.png"
                        alt="Verifly Logo"
                        className="w-16 h-16 rounded-full shadow-md mb-3 border bg-muted"
                    />
                    <h2 className="text-3xl font-extrabold tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Sign in to your account
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="identifier">Username or Email</Label>
                        <Input
                            id="identifier"
                            name="identifier"
                            value={formData.identifier}
                            onChange={handleChange}
                            required
                            placeholder="username or you@example.com"
                            icon={User}
                            className="py-2.5"
                        />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            placeholder="******"
                            icon={Key}
                            className="py-2.5"
                        />
                        <div className="text-right mt-2">
                            <button type="button" className="text-xs text-primary hover:underline transition-colors duration-300">
                                Forgot Password?
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="mt-6" disabled={loading}>
                        {loading ? 'Logging In...' : 'Sign In'}
                    </Button>
                </form>

                <div className="flex items-center my-6">
                    <hr className="flex-grow border-border" />
                    <span className="mx-3 text-muted-foreground text-xs">OR</span>
                    <hr className="flex-grow border-border" />
                </div>

                <div>
                    <Button onClick={handleGoogleLogin} variant="social" className="py-2.5 text-sm">
                        <GoogleIcon className="w-4 h-4 mr-2" />
                        Sign in with Google
                    </Button>
                </div>

                <p className="text-center text-sm text-muted-foreground mt-6">
                    Don't have an account?
                    <button onClick={() => navigate('/register')} className="font-semibold text-primary hover:underline ml-1">
                        Sign Up
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;