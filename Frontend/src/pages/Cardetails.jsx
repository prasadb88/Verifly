import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Calendar, Gauge, Fuel, Cog, ShieldCheck, MapPin,
    User, MessageCircle, AlertTriangle, CheckCircle,
    ChevronLeft, Share2, Heart, ArrowRight, X, Clock, Car, FileText, Trash2, Edit, Copy, Mail, Facebook, Linkedin, Twitter
} from 'lucide-react';
import { toast } from 'sonner';
import carservice from '../config/carservice';
import testdriveservice from '../config/testdriveservice';
import { Loader2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import authservice from '../config/authservice';
import { setUser } from '../Store/authSlice';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const CarDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeImage, setActiveImage] = useState(0);

    // Test Drive Modal State
    const [showModal, setShowModal] = useState(false);
    const [tdDate, setTdDate] = useState('');
    const [tdTime, setTdTime] = useState('');
    const [tdLoading, setTdLoading] = useState(false);
    const [tdStatus, setTdStatus] = useState({ msg: '', type: '' });

    // Share Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const shareLink = `${window.location.origin}/shared/car/${id}`;

    const handleShareClick = () => {
        setIsShareModalOpen(true);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        toast.success("Link copied to clipboard!");
        setIsShareModalOpen(false);
    };

    const shareViaWhatsApp = () => {
        const text = `Check out this verified car on Verifly: ${shareLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        setIsShareModalOpen(false);
    };

    const shareViaEmail = () => {
        const subject = `Check out this ${car.year} ${car.maker} ${car.model}`;
        const body = `I found this amazing car on Verifly and thought you might be interested:\n\n${shareLink}`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        setIsShareModalOpen(false);
    };

    // Update Car Modal State
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [updateFormData, setUpdateFormData] = useState({
        price: '',
        color: '',
        mileage: '',
        description: ''
    });
    const [updateLoading, setUpdateLoading] = useState(false);

    const currentUser = useSelector(state => state.auth.user);
    const dispatch = useDispatch();

    const [isLiked, setIsLiked] = useState(false);

    // Check if car is in wishlist on load
    useEffect(() => {
        if (currentUser && currentUser.wishlist && car) {
            setIsLiked(currentUser.wishlist.includes(car._id));
        }
    }, [currentUser, car]);

    useEffect(() => {
        const fetchCarDetails = async () => {
            try {
                const data = await carservice.getcar(id);
                setCar(data.data || data);
            } catch (err) {
                console.error("Error fetching car details:", err);
                const errMsg = err.response?.data?.message || err.message || "Failed to load car details.";
                setError(`${errMsg} (Status: ${err.response?.status})`);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCarDetails();
        }
    }, [id]);

    const nextImage = () => {
        if (car?.images?.length > 1) {
            setActiveImage((prev) => (prev + 1) % car.images.length);
        }
    };

    const prevImage = () => {
        if (car?.images?.length > 1) {
            setActiveImage((prev) => (prev - 1 + car.images.length) % car.images.length);
        }
    };

    const handleTestDriveSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setTdLoading(true);
        setTdStatus({ msg: '', type: '' });

        try {
            await testdriveservice.requestTestDrive({
                carId: car._id,
                requestedDate: tdDate,
                requestedtime: tdTime
            });
            setTdStatus({ msg: 'Request sent successfully! Dealer will contact you.', type: 'success' });
            setTimeout(() => {
                setShowModal(false);
                setTdStatus({ msg: '', type: '' });
                setTdDate('');
                setTdTime('');
            }, 2000);
        } catch (err) {
            setTdStatus({ msg: err.message || 'Failed to send request.', type: 'error' });
        } finally {
            setTdLoading(false);
        }
    };

    const handleChat = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        navigate('/chat', { state: { dealerId: car.delear._id, dealerName: car.delear.username } });
    };

    const isOwnerOrAdmin = currentUser && car?.delear && (currentUser._id === car.delear._id || currentUser.role === 'admin');

    const handleDelete = async () => {
        // Use toast or local loading if prefered, but simple alert/redirect is fine for now
        try {
            setLoading(true); // Re-use loading state or create a deleting state
            await carservice.deletecar(car._id);
            // navigate back to inventory or dashboard
            navigate('/cars');
        } catch (err) {
            console.error("Failed to delete car", err);
            setLoading(false);
            // Show error (could add a toast here if sonner/toast was available, but alert is backup)
            alert("Failed to delete car. Please try again.");
        }
    };

    const handleUpdateClick = () => {
        setUpdateFormData({
            price: car.price || '',
            color: car.color || '',
            mileage: car.mileage || '',
            description: car.description || ''
        });
        setIsUpdateModalOpen(true);
    };

    const handleUpdateSubmit = async (e) => {
        e.preventDefault();
        setUpdateLoading(true);
        try {
            const data = new FormData();
            Object.keys(updateFormData).forEach(key => {
                data.append(key, updateFormData[key]);
            });

            await carservice.updateCar({
                id: car._id,
                formData: data
            });

            // Refresh details
            const res = await carservice.getcar(id);
            setCar(res.data || res);

            setIsUpdateModalOpen(false);
            // Optional: Success Toast
        } catch (err) {
            console.error("Failed to update car", err);
            alert("Failed to update car details.");
        } finally {
            setUpdateLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-primary" />
                    <p className="text-muted-foreground font-medium animate-pulse">Loading Premium Details...</p>
                </div>
            </div>
        );
    }

    if (error || !car) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="text-3xl font-bold mb-2 text-foreground">Vehicle Not Found</h2>
                <p className="text-muted-foreground mb-6 text-lg text-center max-w-md">
                    {typeof error === 'string' ? error : "The car you are looking for does not exist or has been removed."}
                    {id && <span className="block text-xs mt-2 opacity-50">ID: {id}</span>}
                </p>
                <button
                    onClick={() => navigate('/cars')}
                    className="px-8 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/25"
                >
                    Back to Inventory
                </button>
            </div>
        );
    }

    // Helper to format currency
    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    const specs = [
        { icon: Calendar, label: 'Year', value: car.year },
        { icon: Gauge, label: 'Mileage', value: `${car.mileage} km` },
        { icon: Fuel, label: 'Fuel Type', value: car.fueltype },
        { icon: Cog, label: 'Transmission', value: car.transmission },
        { icon: User, label: 'Ownership', value: `${car.owner} Owner` },
        { icon: ShieldCheck, label: 'Insurance', value: car.insurancestatus },
    ];





    const handleLike = async () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        try {
            const response = await authservice.toggleWishlist(car._id);
            // Verify structure: response.data.wishlist or response.wishlist depending on service return
            // Service returns "response.data" which is the ApiResponse object { statusCode, data, message }
            const updatedWishlist = response.data.wishlist;

            // Update local state
            setIsLiked(!isLiked);

            // Update Redux state
            dispatch(setUser({ ...currentUser, wishlist: updatedWishlist }));

        } catch (error) {
            console.error("Failed to toggle wishlist", error);
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground pb-20 relative">
            {/* Header / Nav */}
            <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-secondary rounded-full transition-colors flex items-center gap-2 text-muted-foreground hover:text-foreground"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span className="font-medium hidden md:inline">Back</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleShareClick}
                            className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                        >
                            <Share2 className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLike}
                            className={`p-2 hover:bg-secondary rounded-full transition-colors ${isLiked ? 'text-red-500 fill-current' : 'text-muted-foreground hover:text-destructive'}`}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                {/* Left Column: Images */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Main Image Slider */}
                    <div className="relative aspect-video w-full rounded-3xl overflow-hidden bg-secondary border border-border group shadow-2xl">
                        {car.images && car.images.length > 0 ? (
                            <img
                                src={car.images[activeImage]}
                                alt={`${car.maker} ${car.model}`}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                No Image Available
                            </div>
                        )}

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                        {/* Verified Badge - GREEN */}
                        <div className="absolute top-4 right-4 bg-emerald-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 backdrop-blur-sm">
                            <CheckCircle className="w-3.5 h-3.5 fill-current" />
                            Verified
                        </div>

                        {/* Slider Controls */}
                        {car.images && car.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/30 backdrop-blur-md text-white hover:bg-black/50 transition-all opacity-0 group-hover:opacity-100 hover:scale-110"
                                >
                                    <ArrowRight className="w-6 h-6" />
                                </button>

                                {/* Image Counter */}
                                <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
                                    {activeImage + 1} / {car.images.length}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {car.images && car.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
                            {car.images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveImage(idx)}
                                    className={`relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${activeImage === idx ? 'border-primary ring-4 ring-primary/10 scale-105 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100 grayscale hover:grayscale-0'
                                        }`}
                                >
                                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Description Section - IMPROVED CSS */}
                    <div className="bg-gradient-to-br from-card to-secondary/10 rounded-3xl p-8 border border-border/50 shadow-sm relative overflow-hidden">
                        {/* Decorative Background Icon */}
                        <Car className="absolute -bottom-10 -right-10 w-64 h-64 text-primary/5 rotate-12 pointer-events-none" />

                        <h3 className="text-2xl font-bold flex items-center gap-2 mb-6">
                            <span className="bg-primary/10 p-2 rounded-lg text-primary"><FileText className="w-5 h-5" /></span>
                            Vehicle Overview
                        </h3>
                        <p className="text-muted-foreground leading-relaxed text-lg relative z-10">
                            This <span className="text-foreground font-semibold">{car.year} {car.brand} {car.model}</span> is a premium verified vehicle.
                            It features a <span className="text-foreground font-semibold">{car.transmission}</span> transmission and runs on <span className="text-foreground font-semibold">{car.fueltype}</span>.
                            Meticulously inspected to ensure top-notch quality and performance.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 relative z-10">
                            <div className="space-y-4 bg-background/50 p-5 rounded-2xl border border-border/50">
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-primary" /> Technical & Registration
                                </h4>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Reg. Number</span> <span className="font-mono font-medium text-foreground bg-secondary px-2 py-0.5 rounded">{car.registrationnumber}</span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Location</span> <span className="font-medium text-foreground">{car.registrationplace || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Date</span> <span className="font-medium text-foreground">{car.registrationdate || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Chassis No.</span> <span className="font-mono font-medium text-foreground text-xs">{car.chassisnumber || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span>Engine No.</span> <span className="font-mono font-medium text-foreground text-xs">{car.enginenumber || 'N/A'}</span>
                                    </li>
                                </ul>
                            </div>
                            <div className="space-y-4 bg-background/50 p-5 rounded-2xl border border-border/50">
                                <h4 className="font-bold text-foreground flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-emerald-500" /> Condition & Insurance
                                </h4>
                                <ul className="space-y-3 text-sm text-muted-foreground">
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Damage Report</span>
                                        {/* <span className={`font-bold px-2 py-0.5 rounded text-xs ${car.damage === 'None' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>
                                            {car.damage || 'None'}
                                        </span> */}
                                    </li>
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Insurance Co.</span> <span className="font-medium text-foreground">{car.insurancecompany || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Validity</span> <span className="font-medium text-foreground">{car.insurancevalidity || 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between items-center border-b border-border/50 pb-2">
                                        <span>Premium</span> <span className="font-medium text-foreground">{car.insurancepremium ? formatPrice(car.insurancepremium) : 'N/A'}</span>
                                    </li>
                                    <li className="flex justify-between items-center">
                                        <span>Status</span> <span className="font-medium text-foreground">{car.insurancestatus || 'Active'}</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Info & Actions */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Main Info Card */}
                    <div className="bg-card rounded-3xl p-6 md:p-8 border border-border shadow-xl space-y-8 sticky top-24">
                        <div>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[11px] font-bold uppercase tracking-wide border border-blue-500/20">
                                    {car.condition || "Used Car"}
                                </span>
                                <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-[11px] font-bold uppercase tracking-wide border border-border">
                                    {car.color}
                                </span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight tracking-tight">{car.maker} {car.model}</h1>
                            <div className="text-4xl font-black text-primary tracking-tight mt-4">
                                {formatPrice(car.price)}
                            </div>
                            <p className="text-xs text-muted-foreground font-medium mt-1">Excludes licensing & registration fees</p>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-3 gap-3">
                            {specs.map((spec, idx) => (
                                <div key={idx} className="bg-secondary/30 p-3 rounded-2xl flex flex-col items-center justify-center text-center gap-2 hover:bg-secondary/60 transition-all hover:-translate-y-1 duration-300 border border-transparent hover:border-border">
                                    <spec.icon className="w-5 h-5 text-primary" />
                                    <div className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{spec.label}</div>
                                    <div className="font-bold text-sm truncate w-full">{spec.value}</div>
                                </div>
                            ))}
                        </div>

                        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-6"></div>

                        {/* Dealer Info */}
                        <div className="flex items-center gap-4 bg-secondary/20 p-4 rounded-2xl border border-secondary">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg">
                                {car.delear?.username?.[0]?.toUpperCase() || 'D'}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg leading-none mb-1">{car.delear?.username || 'Verified Dealer'}</h4>
                                <div className="flex items-center text-muted-foreground text-xs font-medium">
                                    <MapPin className="w-3 h-3 mr-1" />
                                    {car.delear?.address || 'Location Available on Request'}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons - IMPROVED CSS */}
                        <div className="grid gap-4 pt-2">
                            <button
                                onClick={() => setShowModal(true)}
                                className="w-full py-4 bg-gradient-to-r from-primary to-blue-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary/30 hover:shadow-2xl hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                                <span className="relative z-10">Book Test Drive</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                            </button>
                            <button
                                onClick={handleChat}
                                className="w-full py-4 bg-white dark:bg-zinc-900 border-2 border-slate-200 dark:border-zinc-800 text-foreground rounded-2xl font-bold text-lg hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 group"
                            >
                                <MessageCircle className="w-6 h-6 text-emerald-500 group-hover:scale-110 transition-transform" />
                                <span>Chat With Dealer</span>
                            </button>
                        </div>

                        {/* Owner / Admin Controls */}
                        {isOwnerOrAdmin && (
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border mt-2">
                                <button
                                    onClick={handleUpdateClick}
                                    className="px-4 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-secondary/80 transition-all border border-border"
                                >
                                    <Edit className="w-5 h-5" />
                                    <span>Update Car</span>
                                </button>

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="px-4 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 border-2 border-transparent hover:border-red-200 dark:hover:border-red-900 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                            <span>Delete Car</span>
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete the car listing for <strong>{car.maker} {car.model}</strong> and remove all associated data.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                                Delete Permanent
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        )}

                        <p className="text-[10px] text-center text-muted-foreground/60 mt-4 uppercase tracking-widest font-semibold flex flex-col items-center justify-center gap-1">
                            <span className="flex items-center gap-2"><ShieldCheck className="w-3 h-3" /> 100% Verified Inspection Report</span>
                            {car.createdAt && <span>Listed on: {new Date(car.createdAt).toLocaleDateString()}</span>}
                        </p>
                    </div>

                </div>
            </div>

            {/* Damage Inspection Gallery (Full Width at Bottom) */}
            {car.damageImages && car.damageImages.length > 0 && (
                <div className="max-w-7xl mx-auto px-4 pb-12 animate-in slide-in-from-bottom-10 fade-in duration-700">
                    <div className="bg-destructive/5 rounded-3xl p-6 md:p-8 border border-destructive/20 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500"></div>

                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 relative z-10">
                            <div>
                                <h3 className="text-2xl font-bold flex items-center gap-2 text-destructive">
                                    <AlertTriangle className="w-6 h-6" />
                                    AI Damage Inspection Report
                                </h3>
                                <p className="text-muted-foreground mt-1">
                                    The following issues were automatically detected by our AI system.
                                </p>
                            </div>
                            {car.damage && (
                                <div className="px-4 py-2 bg-white dark:bg-black/40 rounded-xl border border-destructive/30 text-destructive font-semibold shadow-sm text-sm">
                                    Detected: {car.damage}
                                </div>
                            )}
                        </div>

                        {/* Slider Container */}
                        <div className="flex gap-4 overflow-x-auto pb-4 pt-2 snap-x scrollbar-thin scrollbar-thumb-destructive/20 scrollbar-track-transparent">
                            {car.damageImages.map((img, idx) => (
                                <div
                                    key={idx}
                                    className="flex-shrink-0 w-72 snap-center group relative rounded-2xl overflow-hidden border border-destructive/20 shadow-lg bg-white dark:bg-black"
                                >
                                    <div className="aspect-[4/3] overflow-hidden">
                                        <img
                                            src={img}
                                            alt={`Damage detected ${idx + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="p-3 bg-card border-t border-border">
                                        <div className="text-xs font-bold text-destructive flex items-center gap-1 uppercase tracking-wide">
                                            <AlertTriangle className="w-3 h-3" />
                                            Damage Area #{idx + 1}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Test Drive Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold">Book Test Drive</h3>
                            <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleTestDriveSubmit} className="p-6 space-y-4">
                            {tdStatus.msg && (
                                <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${tdStatus.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}>
                                    {tdStatus.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {tdStatus.msg}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Preferred Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="date"
                                        required
                                        value={tdDate}
                                        onChange={(e) => setTdDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1.5">Preferred Time</label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="time"
                                        required
                                        value={tdTime}
                                        onChange={(e) => setTdTime(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={tdLoading}
                                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {tdLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Booking'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Update Car Modal */}
            {isUpdateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-border flex justify-between items-center">
                            <h3 className="text-xl font-bold">Update Car Details</h3>
                            <button onClick={() => setIsUpdateModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Price (₹)</label>
                                    <input
                                        type="number"
                                        required
                                        value={updateFormData.price}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, price: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Color</label>
                                        <input
                                            type="text"
                                            required
                                            value={updateFormData.color}
                                            onChange={(e) => setUpdateFormData({ ...updateFormData, color: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Mileage (km)</label>
                                        <input
                                            type="number"
                                            required
                                            value={updateFormData.mileage}
                                            onChange={(e) => setUpdateFormData({ ...updateFormData, mileage: e.target.value })}
                                            className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Description</label>
                                    <textarea
                                        value={updateFormData.description}
                                        onChange={(e) => setUpdateFormData({ ...updateFormData, description: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-secondary/50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all h-24 resize-none"
                                        placeholder="Enter car description..."
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsUpdateModalOpen(false)}
                                    className="flex-1 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold hover:bg-secondary/80 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={updateLoading}
                                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {updateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Share Modal */}
            {isShareModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-border flex justify-between items-center bg-secondary/30">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Share2 className="w-5 h-5 text-primary" /> Share Vehicle
                            </h3>
                            <button onClick={() => setIsShareModalOpen(false)} className="w-8 h-8 rounded-full bg-background hover:bg-secondary flex items-center justify-center transition-colors">
                                <X className="w-4 h-4 text-muted-foreground" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Copy Link Section - Prominent */}
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">Page Link</label>
                                <div className="flex bg-secondary/50 p-1.5 rounded-xl border border-border group focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                                    <div className="flex-1 px-3 py-2 text-sm text-foreground/80 truncate font-mono select-all">
                                        {shareLink}
                                    </div>
                                    <button
                                        onClick={copyToClipboard}
                                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20"
                                    >
                                        <Copy className="w-4 h-4" /> Copy
                                    </button>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-border"></span>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-card px-2 text-muted-foreground">Or share via</span>
                                </div>
                            </div>

                            {/* Social Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={shareViaWhatsApp}
                                    className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 transition-all font-semibold hover:scale-[1.02]"
                                >
                                    <MessageCircle className="w-5 h-5" /> WhatsApp
                                </button>
                                <button
                                    onClick={shareViaEmail}
                                    className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border border-blue-500/20 transition-all font-semibold hover:scale-[1.02]"
                                >
                                    <Mail className="w-5 h-5" /> Email
                                </button>
                                <button
                                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, '_blank')}
                                    className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20 border border-[#1877F2]/20 transition-all font-semibold hover:scale-[1.02]"
                                >
                                    <Facebook className="w-5 h-5" /> Facebook
                                </button>
                                <button
                                    onClick={() => window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=Check out this amazing car!`, '_blank')}
                                    className="flex items-center justify-center gap-3 p-3.5 rounded-xl bg-black/5 dark:bg-white/10 text-foreground hover:bg-black/10 dark:hover:bg-white/20 border border-border transition-all font-semibold hover:scale-[1.02]"
                                >
                                    <Twitter className="w-5 h-5" /> X (Twitter)
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CarDetails;