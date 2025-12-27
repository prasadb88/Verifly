import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { User, Mail, Phone, MapPin, Loader, XCircle, CheckCircle, Camera } from 'lucide-react';
import authservice from '../config/authservice';
import { setUser } from '../Store/authSlice';

// --- Reusable Input Component --- [NO CHANGE TO COMPONENTS]
const ProfileInput = ({ id, name, value, onChange, placeholder, type = 'text', icon: Icon, disabled = false }) => {
    return (
        <div className="relative group">
            {Icon && <Icon className="w-5 h-5 text-muted-foreground absolute left-3 top-1/2 transform -translate-y-1/2 group-focus-within:text-primary transition-colors" />}
            <input
                id={id}
                name={name}
                type={type}
                value={value || ''}
                onChange={onChange}
                disabled={disabled}
                placeholder={placeholder}
                className={`w-full py-3 border rounded-xl shadow-sm transition-all duration-300 
                            pl-10 pr-4 
                            bg-secondary/20 border-border text-foreground
                            focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                            disabled:opacity-60 disabled:cursor-not-allowed`}
            />
        </div>
    );
};

// --- Reusable Button Component --- [NO CHANGE TO COMPONENTS]
const ProfileButton = ({ children, onClick, disabled = false, loading = false, Icon: IconComponent, className = '', variant = 'primary' }) => {
    const baseStyles = "w-full py-3 rounded-xl font-bold text-base transition-all duration-300 transform active:scale-[0.98] focus:outline-none focus:ring-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center";

    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "bg-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground border border-transparent hover:border-border"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || loading}
            className={`${baseStyles} ${variants[variant]} ${className}`}
        >
            {loading ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
                IconComponent && <IconComponent className="w-5 h-5 mr-2" />
            )}
            {children}
        </button>
    );
};


const Profile = () => {
    const dispatch = useDispatch();
    const currentUser = useSelector((state) => state.auth.user);

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState({ message: '', type: '' });

    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phoneno: '',
        address: '',
        avatar: 'https://github.com/shadcn.png',
    });

    // Load user data 
    useEffect(() => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                phoneno: currentUser.phoneno || '',
                address: currentUser.address || '',
                avatar: currentUser.profileImage || 'https://github.com/shadcn.png',
            });
        }
    }, [currentUser]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const fileInputRef = React.useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                profileImageFile: file,
                avatar: URL.createObjectURL(file) // Preview
            }));
        }
    };

    const handleUpdate = async () => {
        if (!isEditing) {
            setIsEditing(true);
            return;
        }

        setLoading(true);
        setStatus({ message: '', type: '' });

        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('username', formData.username);
            data.append('email', formData.email);
            data.append('address', formData.address);
            data.append('phoneno', formData.phoneno);

            if (formData.profileImageFile) {
                data.append('profileImage', formData.profileImageFile);
            }

            const response = await authservice.updateprofile(data);

            if (response && response.data) {
                dispatch(setUser(response.data));
            } else {
                const userResp = await authservice.getuser();
                if (userResp && userResp.data) dispatch(setUser(userResp.data));
            }

            setLoading(false);
            setIsEditing(false);
            setStatus({ message: 'Profile updated successfully!', type: 'success' });
            setTimeout(() => setStatus({ message: '', type: '' }), 3000);

        } catch (error) {
            setLoading(false);
            const errMsg = error?.message || "Failed to update profile";
            setStatus({ message: errMsg, type: 'error' });
        }
    };

    const handleCancel = () => {
        if (currentUser) {
            setFormData({
                name: currentUser.name || '',
                username: currentUser.username || '',
                email: currentUser.email || '',
                phoneno: currentUser.phoneno || '',
                address: currentUser.address || '',
                avatar: currentUser.profileImage || 'https://github.com/shadcn.png',
                profileImageFile: null
            });
        }
        setIsEditing(false);
        setStatus({ message: '', type: '' });
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8 transition-colors duration-500">

            {/* --- Status Toast --- */}
            {status.message && (
                <div className={`fixed top-24 z-50 px-6 py-3 rounded-full shadow-2xl backdrop-blur-md border animate-in slide-in-from-top-5
                                ${status.type === 'success'
                        ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400'
                        : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                    <div className="flex items-center gap-2">
                        {status.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        <span className="font-semibold text-sm">{status.message}</span>
                    </div>
                </div>
            )}

            {/* --- Main Card --- */}
            <div className="w-full max-w-4xl bg-card text-card-foreground rounded-3xl shadow-xl border border-border/50 overflow-hidden relative">

                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/20 via-primary/5 to-transparent opacity-50" />

                <div className="relative p-8 md:p-10">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 pb-6 border-b border-border">
                        <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8 w-full">

                            {/* Avatar */}
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-br from-primary to-secondary rounded-full blur opacity-50 group-hover:opacity-75 transition duration-500"></div>
                                <img
                                    src={formData.avatar}
                                    alt="Profile"
                                    className="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-background shadow-2xl"
                                />
                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleImageChange}
                                            className="hidden"
                                            accept="image/*"
                                        />
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <Camera className="w-4 h-4" />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* User Info */}
                            <div className="text-center md:text-left flex-1">
                                <h2 className="text-3xl md:text-4xl font-black tracking-tight">{formData.name || 'User'}</h2>
                                <p className="text-muted-foreground font-medium text-lg">@{formData.username || 'username'}</p>
                                <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isEditing
                                        ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                                        : 'bg-green-500/10 text-green-600 border-green-500/20'
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${isEditing ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                                        {isEditing ? 'Editing Mode' : 'Active Account'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Desktop Cancel */}
                        <div className="hidden md:block">
                            {isEditing && (
                                <ProfileButton onClick={handleCancel} variant="ghost" className="!w-auto px-6">
                                    Cancel
                                </ProfileButton>
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">Personal Details</label>
                                <div className="space-y-4">
                                    <ProfileInput
                                        id="name" name="name" icon={User} placeholder="Full Name"
                                        value={formData.name} onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                    {/* Username field enabled */}
                                    <ProfileInput
                                        id="username" name="username" icon={User} placeholder="Username"
                                        value={formData.username} onChange={handleChange}
                                        disabled={!isEditing}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">Contact Information</label>
                                <div className="space-y-4">
                                    <ProfileInput
                                        id="email" name="email" icon={Mail} placeholder="Email Address"
                                        value={formData.email} onChange={handleChange}
                                        disabled={!isEditing} type="email"
                                    />
                                    <ProfileInput
                                        id="phone" name="phoneno" icon={Phone} placeholder="Phone Number"
                                        value={formData.phoneno} onChange={handleChange}
                                        disabled={!isEditing} type="tel"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Address: Full Width */}
                        <div className="md:col-span-2 space-y-6">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block ml-1">Location</label>
                                <ProfileInput
                                    id="location" name="address" icon={MapPin} placeholder="Address / Location"
                                    value={formData.address} onChange={handleChange}
                                    disabled={!isEditing}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="mt-10 flex flex-col-reverse md:flex-row items-center gap-4 border-t border-border pt-8">
                        {isEditing && (
                            <ProfileButton onClick={handleCancel} variant="ghost" className="md:hidden">
                                Cancel
                            </ProfileButton>
                        )}

                        <ProfileButton
                            onClick={handleUpdate}
                            loading={loading}
                            IconComponent={isEditing ? Save : Edit}
                            disabled={loading}
                            className="md:w-auto md:min-w-[200px] md:ml-auto"
                        >
                            {isEditing ? (loading ? 'Saving Changes...' : 'Save Profile Changes') : 'Edit Profile'}
                        </ProfileButton>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Profile;