import React, { useEffect, useState } from 'react';
import CarCard from '../components/CarCard';
import carservice from '../config/carservice';
import { Loader2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { allcardata } from '../Store/carSlice';

function Carlisting() {
    const dispatch = useDispatch();
    const carsFromStore = useSelector((state) => state.carsdata.allcardata);

    // We can still use local loading state for the fetch process
    // If we already have cars in store, avoid showing the full-screen loader
    const [loading, setLoading] = useState(!carsFromStore);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCars = async () => {
            try {
                const response = await carservice.getallcars();
                let dataToStore = [];

                // Robust response handling
                if (response && response.data) {
                    dataToStore = response.data;
                } else if (Array.isArray(response)) {
                    dataToStore = response;
                }

                // Dispatch to Redux Store
                dispatch(allcardata(dataToStore));
            } catch (err) {
                console.error("Failed to fetch cars:", err);
                setError("Failed to load listings. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchCars();
    }, [dispatch]);

    // Use data from store, fallback to empty array
    const cars = carsFromStore || [];

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <span className="ml-3 font-medium">Loading listings...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
                <h2 className="text-2xl font-bold mb-2">Oops!</h2>
                <p className="text-muted-foreground mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-3xl md:text-5xl font-black mb-4">
                        Premium Verified Cars
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl">
                        Browse our exclusive collection of AI-verified pre-owned luxury vehicles.
                    </p>
                </div>

                {cars.length === 0 ? (
                    <div className="text-center py-20 bg-card rounded-3xl border border-border">
                        <p className="text-xl font-medium text-muted-foreground">No listings available at the moment.</p>
                        <p className="text-sm text-muted-foreground mt-2">Check back soon for new arrivals.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {cars.map((car) => (
                            <CarCard key={car._id || car.id} car={car} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Carlisting;