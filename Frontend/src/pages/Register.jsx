import React, { useState, useEffect } from 'react';
import { Mail, User, Phone, MapPin, Key, Zap, Chrome, Sun, Moon, CheckCircle, XCircle } from 'lucide-react';
import authService from "../config/authservice.js"
import { useDispatch } from 'react-redux';
import { login } from '../Store/authSlice.js';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../components/ui/theme-provider';

// --- Helper Components ---
const GoogleIcon = Chrome;

const Label = ({ htmlFor, children }) => (
    <label
        htmlFor={htmlFor}
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
            className={`w-full p-3 border border-input rounded-xl bg-background text-foreground shadow-sm transition-all duration-300 
                        focus:outline-none focus:ring-4 focus:ring-ring/20 
                        disabled:cursor-not-allowed disabled:opacity-50 
                        ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
        />
    </div>
);

const Button = ({ children, onClick, type = 'button', variant = 'default', className = '' }) => {
    let baseStyle = "w-full py-3 rounded-xl font-bold text-lg shadow-lg transition duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-4";

    if (variant === 'default') {
        baseStyle += " bg-primary text-primary-foreground hover:opacity-90 hover:scale-[1.005] focus:ring-ring/50";
    } else if (variant === 'secondary') {
        baseStyle += " bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:ring-ring/20";
    } else if (variant === 'social') {
        baseStyle = "flex items-center justify-center w-full py-3 rounded-xl font-semibold text-foreground bg-secondary/50 border border-input transition duration-300 transform hover:bg-secondary active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-ring/20";
    }

    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseStyle} ${className}`}
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


// --- Main Form Component ---
const Register = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { theme, setTheme } = useTheme(); // Global Theme Hook

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        name: '',
        password: '',
        phoneno: '',
        address: '',
        role: 'buyer'
    });
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        authService.register(formData).then((response) => {
            if (response) {
                dispatch(login({ user: response.data }));
                setToast({ visible: true, message: 'Registration successful! Welcome to Verifly.', type: 'success' });
                setTimeout(() => navigate('/'), 1500);
            }
        }).catch((error) => {
            setToast({ visible: true, message: error.message || 'Registration failed.', type: 'error' });
        }).finally(() => {
            setLoading(false);
        });
    };

    const handleGoogleSignup = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
    };

    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <div className="min-h-screen bg-background text-foreground transition-colors duration-500 flex items-center justify-center p-4 overflow-hidden">

            <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

            <div className="w-full max-w-2xl bg-card text-card-foreground rounded-2xl shadow-2xl p-6 border border-border transform transition-all duration-700 relative">

                {/* Theme Toggle Button */}
                <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="absolute top-4 right-4 p-2 rounded-full bg-secondary text-secondary-foreground hover:scale-105 transition-transform duration-300 shadow-sm"
                    aria-label="Toggle theme"
                >
                    {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <div className="mb-6 flex flex-col items-center relative">
                    <div className="flex flex-col items-center space-y-3">
                        {step === 2 && formData.profileImage ? (
                            <img
                                src={URL.createObjectURL(formData.profileImage)}
                                alt="Profile Preview"
                                className="w-32 h-32 rounded-full shadow-lg border-4 border-background object-cover"
                            />
                        ) : (
                            <img
                                src="2.png"
                                alt="Verifly Logo"
                                className="w-20 h-20 rounded-full shadow-md border bg-muted"
                            />
                        )}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold">
                                {step === 1 ? "Join Verifly" : "Complete Profile"}
                            </h2>
                            <p className="text-xs text-muted-foreground">
                                {step === 1 ? "Create your account today." : "Add a photo and username."}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {step === 1 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-right duration-500">
                            <div className="md:col-span-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Firstname Lastname" icon={User} className="py-2.5" />
                            </div>
                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="you@example.com" icon={Mail} className="py-2.5" />
                            </div>
                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="******" icon={Key} className="py-2.5" />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="phoneno">Phone Number</Label>
                                <Input id="phoneno" name="phoneno" type="tel" value={formData.phoneno} onChange={handleChange} required placeholder="9876543210" icon={Phone} className="py-2.5" />
                            </div>
                            <div className="md:col-span-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="Street, City, State" icon={MapPin} className="py-2.5" />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-right duration-500">
                            <div>
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" name="username" value={formData.username} onChange={handleChange} required placeholder="verifly_user" icon={User} className="py-2.5" />
                            </div>
                            <div>
                                <Label htmlFor="profileImage">Profile Picture</Label>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="profileImage" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-muted/50 hover:bg-muted transition-colors">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                                            <User className="w-8 h-8 mb-2" />
                                            <p className="mb-2 text-sm"><span className="font-semibold">Click to upload</span></p>
                                            <p className="text-xs">SVG, PNG, JPG (MAX. 2MB)</p>
                                        </div>
                                        <input
                                            id="profileImage"
                                            name="profileImage"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }));
                                                }
                                            }}
                                        />
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex justify-between gap-4 mt-6">
                        {step === 2 && (
                            <Button onClick={() => setStep(1)} variant="secondary" className="w-1/3">
                                Back
                            </Button>
                        )}
                        {step === 1 ? (
                            <Button onClick={() => setStep(2)} className="w-full">
                                Next Step
                            </Button>
                        ) : (
                            <Button type="submit" variant="default" className="w-full">
                                {loading ? 'Creating Account...' : 'Create Account'}
                            </Button>
                        )}
                    </div>
                </form>

                <div className="flex items-center my-4">
                    <hr className="flex-grow border-border" />
                    <span className="mx-3 text-muted-foreground text-xs">OR</span>
                    <hr className="flex-grow border-border" />
                </div>

                <div>
                    <Button onClick={handleGoogleSignup} variant="social" className="py-2.5 text-sm">
                        <GoogleIcon className="w-4 h-4 mr-2 text-red-500" />
                        Sign up with Google
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Register;