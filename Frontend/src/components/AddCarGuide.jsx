import React from 'react';
import { Car, Gauge, AlertCircle, Layers, ImagePlus, ScanLine } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '../components/ui/card';

const AddCarGuide = ({ onStart }) => {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <Card className="max-w-4xl w-full border-0 shadow-2xl bg-white dark:bg-gray-800 overflow-hidden relative">
                {/* Decorative background element */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

                <CardHeader className="text-center pt-10 pb-6">
                    <div className="mx-auto w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                        <ScanLine className="w-10 h-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300">
                        AI-Powered Car Listing
                    </CardTitle>
                    <CardDescription className="text-lg mt-3 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
                        Our advanced AI analyzes your photos to auto-fill specs, detect damage, and verify authenticity. Follow these strict rules to ensure success.
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-10 px-6 md:px-12">

                    {/* The 4 Pillars of Validation */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                                <Layers className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Validation Rule #1</h3>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">Upload 7+ Images</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    You MUST include Front, Back, Left Side, and Right Side views. The AI checks for all angles.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center flex-shrink-0">
                                <Gauge className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Validation Rule #2</h3>
                                <p className="text-sm font-medium text-purple-600 dark:text-purple-400 mb-1">Odometer is Mandatory</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Include a clear, close-up shot of the dashboard showing the reading. Analysis will fail without it.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-green-200 dark:hover:border-green-800 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0">
                                <Car className="w-6 h-6 text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Validation Rule #3</h3>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">Consistency Check</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    All photos must be of the <strong>exact same car</strong>. Do not mix interior/exterior of different vehicles.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-orange-200 dark:hover:border-orange-800 transition-colors">
                            <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0">
                                <ImagePlus className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white">Validation Rule #4</h3>
                                <p className="text-sm font-medium text-orange-600 dark:text-orange-400 mb-1">Real Photos Only</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    No screenshots, digital renders, or stock images. Original camera photos only.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-xl border border-amber-200 dark:border-amber-800/50 flex gap-4 items-start">
                        <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-semibold text-amber-800 dark:text-amber-400">Important Note</h4>
                            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                                Technical specs (Make, Model, Year, Body Type) are <strong>auto-detected and locked</strong> to ensure accuracy. You can only edit the Color, Mileage, and your Selling Price.
                            </p>
                        </div>
                    </div>

                </CardContent>

                <CardFooter className="pb-10 pt-4 flex justify-center">
                    <Button
                        size="lg"
                        onClick={onStart}
                        className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 text-white min-w-[240px] text-lg h-14 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
                    >
                        I Understand, Let's Start
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AddCarGuide;
