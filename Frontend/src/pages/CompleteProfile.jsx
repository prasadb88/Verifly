import React, { useState, useEffect } from 'react';
import { User, Phone, MapPin, Zap, CheckCircle, XCircle } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../../config/authservice';
import { login } from '../Store/authSlice';

// --- Shared Components ---
const Label = ({ htmlFor, children }) => (
    <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 transition-colors duration-300">
        {children}
    </label>
);

const Input = ({ id, name, value, onChange, placeholder, type = 'text', icon: Icon, required = false, className = '' }) => (
    <div className="relative">
        {Icon && <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors duration-300" />}
        <input
            id={id}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            placeholder={placeholder}
            className={`w-full p-3 border border-gray-300 rounded-xl bg-white text-gray-900 shadow-sm transition-all duration-300 
                        dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 
                        focus:outline-none focus:ring-4 focus:ring-blue-500/50 
                        dark:focus:ring-green-500/50 disabled:cursor-not-allowed disabled:opacity-50 
                        ${Icon ? 'pl-10' : 'pl-4'} ${className}`}
        />
    </div>
);

const Button = ({ children, onClick, type = 'button', variant = 'default', className = '', disabled = false }) => {
    let baseStyle = "w-full py-3 rounded-xl font-bold text-lg shadow-lg transition duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed";
    if (variant === 'default') {
        baseStyle += " bg-blue-600 dark:bg-green-500 text-white hover:bg-blue-700 dark:hover:bg-green-600 hover:scale-[1.005] focus:ring-blue-500/50 dark:focus:ring-green-500/50";
    }
    return (
        <button type={type} onClick={onClick} className={`${baseStyle} ${className}`} disabled={disabled}>
            {children}
        </button>
    );
};

const Toast = ({ visible, message, type, onClose }) => {
    if (!visible) return null;
    const isSuccess = type === 'success';
    const bgColor = isSuccess ? 'bg-green-500 dark:bg-green-600' : 'bg-red-500 dark:bg-red-600';
    const Icon = isSuccess ? CheckCircle : XCircle;
    return (
        <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-xl text-white transition-opacity duration-300 transform translate-x-0 ${bgColor}`} role="alert">
            <div className="flex items-center">
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-semibold text-sm">{message}</span>
                <button onClick={onClose} className="ml-4 p-1 rounded-full hover:bg-white/20 transition"><Zap className="w-4 h-4" /></button>
            </div>
        </div>
    );
};

const CompleteProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // Initial loading for fetching user data
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

    // Track which fields are already present to hide them
    const [existingData, setExistingData] = useState({
        username: false,
        phoneno: false,
        address: false
    });

    const [formData, setFormData] = useState({
        username: '',
        phoneno: '',
        address: '',
        profileImage: null,
        currentProfileImage: null // To store the URL of existing image (e.g. from Google)
    });

    // Theme logic
    const theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    const wrapperStyle = theme === 'light' ? { background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 50%, #E8EAF6 100%)' } : { background: '#111827' };

    useEffect(() => {
        // Fetch user data on mount
        const fetchUserData = async () => {
            try {
                const userData = await authService.getuser();
                if (userData && userData.data) {
                    const user = userData.data;
                    setFormData(prev => ({
                        ...prev,
                        username: user.username || '',
                        phoneno: user.phoneno && user.phoneno.toString() || '',
                        address: user.address || '',
                        currentProfileImage: user.profileImage || null
                    }));

                    setExistingData({
                        username: !!user.username,
                        phoneno: !!user.phoneno, // Ensure boolean conversion
                        address: !!user.address
                    });
                }
            } catch (error) {
                console.error("Failed to fetch user data", error);
                setToast({ visible: true, message: "Failed to load profile data.", type: "error" });
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();

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
        setSubmitting(true);

        const data = new FormData();
        // Append fields only if we are submitting them. 
        // For hidden fields (existingData), we can rely on them remaining unchanged in backend or we can send them just in case.
        // It's safer to send everything in formData as it reflects the User's desired state.

        data.append('username', formData.username);
        data.append('phoneno', formData.phoneno);
        data.append('address', formData.address);

        if (formData.profileImage) {
            data.append('profileImage', formData.profileImage);
        }

        authService.completeprofile(data).then((response) => {
            if (response) {
                authService.getuser().then(userData => {
                    dispatch(login({ user: userData.data }));
                    setToast({ visible: true, message: 'Profile completed!', type: 'success' });
                    setTimeout(() => navigate('/'), 1500);
                });
            }
        }).catch((error) => {
            console.error(error);
            setToast({ visible: true, message: error.message || 'Failed to complete profile.', type: 'error' });
        }).finally(() => setSubmitting(false));
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center dark:bg-gray-900 dark:text-white">Loading...</div>;
    }

    return (
        <div className="min-h-screen transition-colors duration-500 flex items-center justify-center p-4 overflow-hidden" style={wrapperStyle}>
            <Toast visible={toast.visible} message={toast.message} type={toast.type} onClose={() => setToast(prev => ({ ...prev, visible: false }))} />

            <div className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-gray-700/50">
                <div className="mb-6 flex flex-col items-center space-y-3">
                    {formData.profileImage ? (
                        <img src={URL.createObjectURL(formData.profileImage)} alt="Preview" className="w-32 h-32 rounded-full shadow-lg border-4 border-white dark:border-blue-400 object-cover" />
                    ) : formData.currentProfileImage ? (
                        <img src={formData.currentProfileImage} alt="Current Profile" className="w-32 h-32 rounded-full shadow-lg border-4 border-white dark:border-blue-400 object-cover" />
                    ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-400">
                            <User className="w-12 h-12" />
                        </div>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Please provide the missing details.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!existingData.username && (
                        <div>
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" name="username" value={formData.username} onChange={handleChange} required placeholder="Choose a username" icon={User} className="py-2.5" />
                        </div>
                    )}

                    {!existingData.phoneno && (
                        <div>
                            <Label htmlFor="phoneno">Phone Number</Label>
                            <Input id="phoneno" name="phoneno" type="tel" value={formData.phoneno} onChange={handleChange} required placeholder="Your phone number" icon={Phone} className="py-2.5" />
                        </div>
                    )}

                    {!existingData.address && (
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input id="address" name="address" value={formData.address} onChange={handleChange} required placeholder="Your address" icon={MapPin} className="py-2.5" />
                        </div>
                    )}

                    <div>
                        <Label htmlFor="profileImage">Profile Picture</Label>
                        <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <p className="text-sm text-gray-500">
                                    {formData.currentProfileImage ? "Change Profile Picture" : "Click to upload image"}
                                </p>
                            </div>
                            <input type="file" id="profileImage" className="hidden" accept="image/*" onChange={(e) => e.target.files && setFormData(prev => ({ ...prev, profileImage: e.target.files[0] }))} />
                        </label>
                    </div>

                    <Button type="submit" disabled={submitting} className="mt-4">
                        {submitting ? 'Saving...' : 'Complete Profile'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default CompleteProfile;
