import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle, Shield, ShieldAlert, Car, MapPin, Fuel, ChevronLeft, ChevronRight, Gauge } from 'lucide-react';
import { useTheme } from '../components/ui/theme-provider';

const CarCard = ({ car }) => {
    const { theme } = useTheme();
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    // Data Helpers
    const images = car.images || [];
    const mainImage = images.length > 0 ? images[currentImageIndex] : '/placeholder-car.png';

    const nextImage = (e) => {
        e.stopPropagation();
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }
    };

    const prevImage = (e) => {
        e.stopPropagation();
        if (images.length > 1) {
            setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        }
    };

    return (
        <div
            className="group relative flex flex-col bg-card text-card-foreground rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300 cursor-pointer h-full"
            onClick={() => navigate(`/car/${car._id || car.id}`)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* --- Image Section (Top) --- */}
            {/* Changed from md:w-80 to w-full and fixed aspect ratio/height */}
            <div className="relative w-full h-56 flex-shrink-0 bg-muted overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${mainImage})` }}
                />

                {/* Gradient Overlay for Text Contrast */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

                {/* Verified Badge */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="flex items-center gap-1.5 bg-background/95 backdrop-blur-md text-foreground text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm border border-border/50">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 fill-green-500/10" />
                        VERIFIED
                    </span>
                </div>

                {/* Image Controls (Show on Hover) */}
                {images.length > 1 && (
                    <div className={`absolute inset-0 flex items-center justify-between px-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                        <button onClick={prevImage} className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-transform hover:scale-110">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button onClick={nextImage} className="p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-sm transition-transform hover:scale-110">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Pagination Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 shadow-sm ${idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* --- Content Section (Bottom) --- */}
            <div className="flex-1 p-5 flex flex-col justify-between">

                {/* Header */}
                <div className="flex justify-between items-start gap-4 mb-4">
                    <div>
                        <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                            {car.condition || "Pre-Owned"}
                        </div>
                        <h3 className="text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors duration-200 line-clamp-1">
                            {car.maker && car.model ? `${car.maker} ${car.model}` : "Unknown Vehicle"}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[120px]">{car.registrationplace || "Location N/A"}</span>
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-xl font-extrabold text-foreground tracking-tight">
                            ₹{(Number(car.price) || 0).toLocaleString('en-IN')}
                        </div>
                        {/* <div className="text-xs font-medium text-muted-foreground">
                            Exclude. Tax
                        </div> */}
                    </div>
                </div>

                {/* Specs Grid - Compact & Clean */}
                <div className="grid grid-cols-2 gap-3 py-4 border-t border-border/50">
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/30">
                        <Gauge className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Mileage</span>
                            <span className="text-sm font-semibold text-foreground truncate">{car.mileage || "N/A"} <span className="text-xs font-normal text-muted-foreground">mi</span></span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/30">
                        <Fuel className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Fuel</span>
                            <span className="text-sm font-semibold text-foreground truncate">{car.fueltype || "N/A"}</span>
                        </div>
                    </div>
                    {/* Only showing 2 key specs for vertical compactness, or 4 if space permits. Let's keep 4 but ensure they handle width well */}
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/30">
                        <TrendingUp className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Trans.</span>
                            <span className="text-sm font-semibold text-foreground truncate">{car.transmission || "Auto"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 rounded-lg bg-secondary/30">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] font-medium text-muted-foreground uppercase">Year</span>
                            <span className="text-sm font-semibold text-foreground truncate">{car.year || "N/A"}</span>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between mt-auto pt-2">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${car.damageStatus === "None" || !car.damage || car.damage === "None"
                        ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900"
                        }`}>
                        {car.damageStatus === "None" || !car.damage || car.damage === "None" ? (
                            <Shield className="w-3.5 h-3.5" />
                        ) : (
                            <ShieldAlert className="w-3.5 h-3.5" />
                        )}
                        <span>{car.damageStatus === "None" || !car.damage || car.damage === "None" ? "Damage Free" : "Reported Damage"}</span>
                    </div>

                    <div className="text-sm font-bold text-primary flex items-center gap-1 opacity-100 md:opacity-0 md:-translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        View <ChevronRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarCard;
