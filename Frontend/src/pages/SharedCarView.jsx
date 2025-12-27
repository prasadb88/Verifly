import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Direct axios or carservice, let's use carservice if possible, but axios is safer for isolated view
import { Car, Fuel, Cog, Gauge, ArrowRight, Loader2, AlertTriangle, Download, MapPin, CheckCircle } from 'lucide-react';
import carservice from '../config/carservice'; // Re-use service

const SharedCarView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [car, setCar] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCar = async () => {
            try {
                // Using existing public endpoint
                const response = await carservice.getcar(id);
                setCar(response.data || response);
            } catch (err) {
                console.error("Failed to load shared car", err);
                setError("Car not found or link expired.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchCar();
    }, [id]);

    const handleViewOnApp = () => {
        // Redirect to main details page
        navigate(`/car/${id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-900">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
            </div>
        );
    }

    if (error || !car) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <AlertTriangle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Oops!</h3>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button onClick={() => navigate('/')} className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold">
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    // Format Price
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(car.price);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 font-sans text-foreground">
            <div className="bg-card rounded-[2rem] shadow-2xl overflow-hidden max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 border border-border">

                {/* Visual Side */}
                <div className="relative h-64 md:h-auto bg-muted overflow-hidden group">
                    <img
                        src={car.images?.[0]}
                        alt={`${car.maker} ${car.model}`}
                        className="w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                    <div className="absolute top-6 left-6">
                        <span className="bg-background/20 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 shadow-lg">
                            Verified Listing
                        </span>
                    </div>

                    <div className="absolute bottom-6 left-6 right-6 text-white">
                        <div className="text-sm font-medium text-gray-300 mb-1">{car.year} Model</div>
                        <h2 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mb-2">{car.maker} {car.model}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-300">
                            <MapPin className="w-4 h-4 text-primary" />
                            {car.registrationplace || 'Location N/A'}
                        </div>
                    </div>
                </div>

                {/* Details Side */}
                <div className="p-8 md:p-10 flex flex-col justify-between bg-card relative">

                    {/* Header Info */}
                    <div>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-wide">Total Price</p>
                                <h3 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">
                                    {formattedPrice}
                                </h3>
                            </div>
                            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-foreground font-bold text-xl shadow-inner">
                                {car.delear?.username?.[0]?.toUpperCase() || 'D'}
                            </div>
                        </div>

                        {/* Specs Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-secondary/50 p-4 rounded-2xl border border-border flex items-center gap-3">
                                <div className="p-2 bg-card rounded-xl shadow-sm"><Gauge className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Mileage</p>
                                    <p className="font-bold text-foreground">{car.mileage} km</p>
                                </div>
                            </div>
                            <div className="bg-secondary/50 p-4 rounded-2xl border border-border flex items-center gap-3">
                                <div className="p-2 bg-card rounded-xl shadow-sm"><Fuel className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Fuel Type</p>
                                    <p className="font-bold text-foreground">{car.fueltype}</p>
                                </div>
                            </div>
                            <div className="bg-secondary/50 p-4 rounded-2xl border border-border flex items-center gap-3">
                                <div className="p-2 bg-card rounded-xl shadow-sm"><Cog className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Transmission</p>
                                    <p className="font-bold text-foreground">{car.transmission}</p>
                                </div>
                            </div>
                            <div className="bg-secondary/50 p-4 rounded-2xl border border-border flex items-center gap-3">
                                <div className="p-2 bg-card rounded-xl shadow-sm"><CheckCircle className="w-5 h-5 text-primary" /></div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-bold uppercase">Owner</p>
                                    <p className="font-bold text-foreground">{car.owner} Owner</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description or extra info */}
                    <div className="mb-8">
                        <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
                            {car.description || `This ${car.year} ${car.maker} ${car.model} is available now. Trusted seller, verified documentation, and excellent condition. Don't miss out on this deal!`}
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="space-y-4">
                        <button
                            onClick={handleViewOnApp}
                            className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-lg shadow-xl shadow-primary/20 hover:shadow-2xl hover:bg-primary/90 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 group"
                        >
                            <span>Open in Verifly App</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <p className="text-xs text-center text-muted-foreground font-medium">
                            Safe • Secure • Verified
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SharedCarView;
