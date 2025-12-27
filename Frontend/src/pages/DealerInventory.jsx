import React, { useEffect, useState } from 'react';
import CarCard from '../components/CarCard';
import carservice from '../config/carservice';
import { Loader2, Plus, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function DealerInventory() {
    const navigate = useNavigate();
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyCars = async () => {
            try {
                const response = await carservice.getmycars();

                let dataToSet = [];
                // Robust response handling similar to Carlisting
                if (response && response.data) {
                    dataToSet = response.data;
                } else if (Array.isArray(response)) {
                    dataToSet = response;
                } else if (response && response.success === false) {
                    // Handle explicit API failure
                    throw new Error(response.message || "Failed to fetch cars");
                }

                setCars(dataToSet);
            } catch (err) {
                console.error("Failed to fetch dealer cars:", err);
                setError("Failed to load your inventory. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchMyCars();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
                <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
                <span className="ml-3 font-medium">Loading your inventory...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-6 text-center">
                <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Oops!</h2>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-10 px-4 md:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black mb-2 text-gray-900 dark:text-white">
                            My Inventory
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">
                            Manage your car listings and track their status.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/addcar')}
                        className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" /> Add New Car
                    </button>
                </div>

                {cars.length === 0 ? (
                    <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm">
                        <div className="inline-block p-4 rounded-full bg-blue-50 dark:bg-blue-900/20 mb-4">
                            <Car className="w-12 h-12 text-blue-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Active Listings</h3>
                        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-8">
                            You haven't listed any cars yet. Start adding your fleet to reach potential buyers.
                        </p>
                        <button
                            onClick={() => navigate('/addcar')}
                            className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            List Your First Car
                        </button>
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

export default DealerInventory;
