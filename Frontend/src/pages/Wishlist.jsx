import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Loader2, AlertTriangle, ArrowRight, Gauge, Fuel, Cog } from 'lucide-react';
import authservice from '../config/authservice';

const Wishlist = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const response = await authservice.getWishlist();
                setWishlist(response.data || []);
            } catch (err) {
                console.error("Error fetching wishlist:", err);
                setError(err.message || "Failed to load wishlist");
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
                <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Error Loading Wishlist</h2>
                <p className="text-muted-foreground">{error}</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-red-500 fill-current" />
                    My Wishlist
                </h1>

                {wishlist.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-3xl border border-border">
                        <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-semibold mb-2">Your wishlist is empty</h2>
                        <p className="text-muted-foreground mb-6">Start exploring cars and save your favorites here!</p>
                        <button
                            onClick={() => navigate('/cars')}
                            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary/90 transition-colors"
                        >
                            Browse Cars
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((car) => (
                            <div
                                key={car._id}
                                onClick={() => navigate(`/car/${car._id}`)}
                                className="bg-card rounded-2xl overflow-hidden border border-border shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer group"
                            >
                                <div className="relative aspect-video bg-secondary">
                                    <img
                                        src={car.images?.[0] || 'https://placehold.co/600x400/png?text=No+Image'}
                                        alt={car.model}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 bg-white/90 dark:bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                                        <Heart className="w-3 h-3 text-red-500 fill-current" />
                                        Saved
                                    </div>
                                </div>

                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-lg">{car.year} {car.maker} {car.model}</h3>
                                            <p className="text-primary font-black text-xl mt-1">{formatPrice(car.price)}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1">
                                            <Gauge className="w-3.5 h-3.5" /> {car.mileage}km
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Fuel className="w-3.5 h-3.5" /> {car.fueltype}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Cog className="w-3.5 h-3.5" /> {car.transmission}
                                        </div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-sm font-medium text-primary">
                                        <span>View Details</span>
                                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Wishlist;
