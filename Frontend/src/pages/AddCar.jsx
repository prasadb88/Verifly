import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import carservice from '../config/carservice';
import { toast } from 'sonner';
import { Loader2, Upload, ScanEye, CheckCircle, XCircle, ArrowRight, ArrowLeft, Camera, X, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import AddCarGuide from '../components/AddCarGuide';
import axios from 'axios';

const STEPS = {
    GUIDE: 'GUIDE',
    UPLOAD: 'UPLOAD',
    REVIEW: 'REVIEW'
};

const AddCar = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(STEPS.GUIDE);
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [images, setImages] = useState([]);
    const [detectionResults, setDetectionResults] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [validationError, setValidationError] = useState(null);
    const [fetchingRc, setFetchingRc] = useState(false);
    const [isRcFetched, setIsRcFetched] = useState(false);

    // Camera State
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [formData, setFormData] = useState({
        maker: '',
        model: '',
        year: '',
        color: '',
        price: '',
        brand: '',
        mileage: '',
        transmission: 'Manual',
        fueltype: 'Petrol',
        registrationnumber: '',
        owner: '1st',
        damage: 'None',
        insurance: 'Valid',
        insurancevalidity: '',
        insurancecompany: '',
        insurancepremium: '',
        insurancestatus: 'Active',
        chassisnumber: '',
        enginenumber: '',
        registrationdate: '',
        registrationplace: '',
        sellingPrice: '',
        description: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(prev => [...prev, ...files]);
        setValidationError(null); // Clear errors on change
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setValidationError(null); // Clear errors on change
    };

    // Camera Functions
    const startCamera = async () => {
        setIsCameraOpen(true);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' } // Prefer back camera on mobile
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera Error:", err);
            toast.error("Could not access camera. Please check permissions.");
            setIsCameraOpen(false);
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraOpen(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            // Set canvas dimensions to match video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Draw current frame
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convert to Blob/File
            canvas.toBlob((blob) => {
                const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });
                setImages(prev => [...prev, file]);
                toast.success("Photo captured!");
            }, 'image/jpeg', 0.8);
        }
    };

    // Cleanup camera on unmount
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const runAIAnalysis = async () => {
        /*         if (images.length < 7) {
                    toast.error("Please upload at least 7 images as per the guide.");
                    return;
                } */

        setAnalyzing(true);
        try {
            const uploadData = new FormData();
            images.forEach((image) => {
                uploadData.append('files', image);
            });

            // --- PARALLEL EXECUTION START ---
            // We run both the local YOLO model (for damage detection) and the backend Gemini AI (for car details) 
            // in parallel to reduce total waiting time for the user.

            // 1. Python YOLO Damage Detection Request
            const yoloPromise = axios.post(`${import.meta.env.VITE_DAMAGE_DETECTION_URL}/detect`, uploadData)
                .catch(err => {
                    console.error("YOLO Error:", err);
                    // Return a safe fallback structure so Promise.all doesn't fail entirely if YOLO is down
                    return { data: { error: "Damage detection failed" } };
                });

            // 2. AI Analysis Request (Gemini) via Backend
            const aiPromise = carservice.analyzeCarImages(uploadData)
                .catch(err => {
                    console.error("AI Error:", err);
                    // Return the specific backend error if available, otherwise generic
                    if (err.success === false && (err.issues || err.error)) {
                        return err;
                    }
                    return { success: false, error: "AI analysis failed" };
                });

            // Wait for both results to complete
            const [yoloRes, aiRes] = await Promise.all([yoloPromise, aiPromise]);
            // --- PARALLEL EXECUTION END ---

            // Process YOLO Results
            let damageReport = "None detected";
            if (yoloRes.data && yoloRes.data.results) {
                setDetectionResults(yoloRes.data.results);
                // Extract unique damage classes with high confidence
                const damages = yoloRes.data.results
                    .flatMap(r => r.detections)
                    .map(d => `${d.class_name} (${Math.round(d.confidence * 100)}%)`);

                if (damages.length > 0) {
                    damageReport = [...new Set(damages)].join(", "); // Unique damages
                }
            }

            // Process AI Results & Update Form
            let aiData = {};

            // Check for Validation Failure (e.g., "Not a car" or missing angles)
            /* if (aiRes && aiRes.error && aiRes.issues) {
                const issuesList = Array.isArray(aiRes.issues) ? aiRes.issues : [aiRes.error];
                setValidationError({
                    title: "Image Validation Failed",
                    issues: issuesList
                });
                return; // STOP HERE - Do not autofill if validation fails
            } */

            if (aiRes && aiRes.success && aiRes.data) {
                aiData = aiRes.data;
                toast.success("AI Analysis Complete!");
            } else if (aiRes && !aiRes.success) {
                // Fallback generic error
                setValidationError({
                    title: "Analysis Failed",
                    issues: [aiRes.error || "Unknown Error"]
                });
                return;
            }

            // Auto-fill the form with AI extracted data
            setFormData(prev => ({
                ...prev,
                damage: damageReport,
                // Merge AI Data, keeping manual edits if they were somehow already present (though unlikely at this stage)
                maker: aiData.make || prev.maker,
                model: aiData.model || prev.model,
                year: aiData.year ? String(aiData.year) : prev.year,
                color: aiData.color || prev.color,
                price: aiData.price ? String(aiData.price) : prev.price, // Estimated Market Price
                brand: aiData.bodyType || prev.brand,
                mileage: aiData.mileage ? String(aiData.mileage) : prev.mileage,
                transmission: aiData.transmission || prev.transmission,
                fueltype: aiData.fuelType || prev.fueltype,
                description: aiData.description || prev.description
            }));

            if (aiData) {
                setAnalysisData(aiData);
            }

            // Move to Review Step
            setCurrentStep(STEPS.REVIEW);
        } catch (error) {
            console.error("Analysis failed:", error);
            toast.error("Analysis process encountered an error.");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleFetchRcDetails = async () => {
        const regNo = formData.registrationnumber;
        if (!regNo) {
            toast.error("Please enter a Registration Number first");
            return;
        }

        // Basic Client-side Validation (Example match: MH12AB1234 or MH 12 AB 1234)
        const indianRegRegex = /^[A-Z]{2}\s?[0-9]{1,2}\s?[A-Z]{0,3}\s?[0-9]{4}$/;
        if (!indianRegRegex.test(regNo.toUpperCase())) {
            toast.error("Invalid Format. Use format like MH12AB1234");
            return;
        }

        setFetchingRc(true);
        try {
            const response = await carservice.getRcDetails(regNo);
            if (response.success && response.data) {
                const data = response.data;
                toast.success("RC Details Fetched Successfully!");

                setFormData(prev => ({
                    ...prev,
                    chassisnumber: data.chassisnumber || prev.chassisnumber,
                    enginenumber: data.enginenumber || prev.enginenumber,
                    registrationdate: data.registrationdate || prev.registrationdate,
                    registrationplace: data.registrationplace || prev.registrationplace,
                    owner: data.owner || prev.owner,
                    // Insurance Details
                    insurancecompany: data.insurancecompany || prev.insurancecompany,
                    insurancevalidity: data.insurancevalidity || prev.insurancevalidity,
                    insurancepremium: data.insurancepremium || prev.insurancepremium,
                    insurancestatus: data.insurancestatus || prev.insurancestatus
                }));
                setIsRcFetched(true);
            }
        } catch (error) {
            console.error("Failed to fetch RC details:", error);
            toast.error(error.message || "Failed to fetch RC details");
        } finally {
            setFetchingRc(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            // Append all textual fields
            Object.keys(formData).forEach(key => {
                data.append(key, formData[key] || '');
            });
            // Append images
            images.forEach((image) => {
                data.append('images', image);
            });

            // Append detected damage images (if any)
            if (detectionResults) {
                detectionResults.forEach((result, idx) => {
                    // Only upload images where damage was detected
                    if (result.detections && result.detections.length > 0) {
                        const base64Data = result.annotated_image || result.base64_image || result.image;
                        if (base64Data) {
                            // Convert Base64 to Blob
                            try {
                                const byteString = atob(base64Data.split(',')[1] || base64Data); // Handle data URI or raw base64
                                const ab = new ArrayBuffer(byteString.length);
                                const ia = new Uint8Array(ab);
                                for (let i = 0; i < byteString.length; i++) {
                                    ia[i] = byteString.charCodeAt(i);
                                }
                                const blob = new Blob([ab], { type: 'image/jpeg' });
                                data.append('damageImages', blob, `damage_report_${idx}.jpg`);
                            } catch (e) {
                                console.error("Error converting damage image to blob:", e);
                            }
                        }
                    }
                });
            }

            // Override price with sellingPrice (User's Ask)
            if (formData.sellingPrice) {
                data.set('price', formData.sellingPrice);
            }

            await carservice.addcar(data);
            toast.success("Car listed successfully!");
            navigate('/inventory');
        } catch (error) {
            console.error("Error adding car:", error);
            toast.error(error.message || "Failed to add car. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Step 1: Guide
    if (currentStep === STEPS.GUIDE) {
        return <AddCarGuide onStart={() => setCurrentStep(STEPS.UPLOAD)} />;
    }

    // Step 2: Upload (With Camera)
    if (currentStep === STEPS.UPLOAD) {
        const progress = Math.min((images.length / 7) * 100, 100);

        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 flex items-center justify-center">
                <Card className="max-w-5xl w-full border-0 shadow-2xl bg-white dark:bg-gray-800 rounded-2xl overflow-hidden">
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 w-full">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${images.length >= 7 ? 'bg-green-500' : 'bg-blue-600'}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <CardHeader className="text-center pt-10 pb-2">
                        <CardTitle className="text-3xl font-bold">Upload Vehicle Photos</CardTitle>
                        <CardDescription className="text-lg">
                            We need at least 7 photos for the AI analysis. <br className="hidden sm:block" />
                            Please ensure you include the <strong>odometer</strong> and <strong>all 4 sides</strong>.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 p-8 max-w-4xl mx-auto w-full">

                        {/* Camera Interface overlay */}
                        {isCameraOpen ? (
                            <div className="relative bg-black rounded-2xl overflow-hidden shadow-2xl h-[500px] flex flex-col items-center justify-center">
                                <video ref={videoRef} autoPlay playsInline className="h-full w-full object-cover" />
                                <canvas ref={canvasRef} className="hidden" />

                                <div className="absolute bottom-6 flex gap-6 items-center z-10">
                                    <Button onClick={stopCamera} variant="secondary" size="icon" className="rounded-full w-14 h-14 bg-white/20 backdrop-blur-md hover:bg-white/40 border border-white/30 text-white">
                                        <X className="w-6 h-6" />
                                    </Button>
                                    <Button onClick={capturePhoto} className="bg-white hover:scale-105 active:scale-95 transition-all rounded-full w-20 h-20 p-1 border-4 border-gray-300">
                                        <div className="w-full h-full bg-white rounded-full border-2 border-black" />
                                    </Button>
                                    <div className="w-14" /> {/* Spacer */}
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* File Upload Area */}
                                <label className="relative group cursor-pointer">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                    <div className="h-64 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center p-6 transition-all group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/10">
                                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Upload Files</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                            Drag & drop or click to select from your device
                                        </p>
                                    </div>
                                </label>

                                {/* Camera Button Area */}
                                <div
                                    onClick={startCamera}
                                    className="group cursor-pointer h-64 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex flex-col items-center justify-center p-6 transition-all hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/10"
                                >
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Camera className="w-8 h-8 text-green-600 dark:text-green-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Take Photo</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                        Use your camera to capture fresh images
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Image Preview List */}
                        {images.length > 0 && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-base font-semibold">Selected Images ({images.length})</Label>
                                    <span className={`text-sm font-medium ${images.length >= 7 ? 'text-green-600' : 'text-orange-500'}`}>
                                        {images.length >= 7 ? 'Requirement Met' : `${7 - images.length} more needed`}
                                    </span>
                                </div>

                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
                                    {images.map((file, idx) => (
                                        <div key={idx} className="relative aspect-square group rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={`preview-${idx}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <button
                                                    onClick={() => removeImage(idx)}
                                                    className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full transform hover:scale-110 transition-all"
                                                >
                                                    <XCircle className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Validation Error Alert */}
                        {validationError && (
                            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex flex-col gap-2 animate-in fade-in slide-in-from-top-4 shadow-sm">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full mt-0.5">
                                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-red-900 dark:text-red-200">Validation Failed</h4>
                                        <ul className="mt-1 list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-1">
                                            {validationError.issues.map((issue, i) => (
                                                <li key={i}>{issue}</li>
                                            ))}
                                        </ul>
                                        <p className="mt-2 text-xs font-medium text-red-600 dark:text-red-400">
                                            Please correct these issues and try again.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                    </CardContent>

                    <CardFooter className="pt-2 pb-10 px-8 flex justify-between border-t border-gray-100 dark:border-gray-800 pt-6">
                        <Button variant="ghost" onClick={() => setCurrentStep(STEPS.GUIDE)} className="text-gray-500 hover:text-gray-900">
                            Back
                        </Button>
                        <Button
                            size="lg"
                            onClick={runAIAnalysis}
                            disabled={images.length < 7 || analyzing}
                            className={`min-w-[200px] h-12 text-lg transition-all ${images.length >= 7
                                ? 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                        >
                            {analyzing ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Analyzing with AI...
                                </>
                            ) : (
                                <>
                                    Start Analysis
                                    <ArrowRight className="ml-2 w-5 h-5" />
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        );
    }

    // Step 3: Review & Edit
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <Card className="max-w-5xl mx-auto bg-white dark:bg-gray-800 shadow-xl border-0 rounded-2xl">
                <CardHeader className="border-b dark:border-gray-700 pb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white">Review Listing</CardTitle>
                            <CardDescription className="text-lg text-gray-500 dark:text-gray-400 mt-1">
                                AI has extracted the details. Verify and set your price.
                            </CardDescription>
                        </div>
                        <Button variant="outline" onClick={() => setCurrentStep(STEPS.UPLOAD)} className="border-gray-300 text-gray-700">
                            <ArrowLeft className="mr-2 w-4 h-4" /> Re-upload Photos
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleSubmit} className="space-y-10">

                        {/* SECTION 1: PRICE & KEY INFO (Highlighted) */}
                        <div className="bg-green-50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-800/20">
                            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center text-sm font-bold">1</span>
                                Pricing & Key Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label htmlFor="sellingPrice" className="text-green-700 dark:text-green-400 font-bold text-lg">Your Selling Price (₹)</Label>
                                    <div className="relative">
                                        <Input
                                            id="sellingPrice"
                                            name="sellingPrice"
                                            value={formData.sellingPrice}
                                            onChange={handleChange}
                                            placeholder="e.g. 5,00,000"
                                            className="h-14 text-xl font-bold border-2 border-green-400 focus:border-green-600 focus:ring-green-200 pl-4 bg-white dark:bg-gray-900 dark:border-green-600 dark:text-green-400"
                                        />
                                    </div>
                                    <p className="text-xs text-green-600 dark:text-green-500 font-medium">
                                        This is the amount buyers will see.
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-gray-600 dark:text-gray-400">AI Estimated Market Value</Label>
                                    <div className="h-14 flex items-center px-4 bg-gray-100 dark:bg-gray-700/50 rounded-md border border-gray-200 dark:border-gray-700 text-gray-500 font-medium cursor-not-allowed">
                                        {formData.price || "N/A"}
                                    </div>
                                    <p className="text-xs text-gray-500">Based on current market trends for this model.</p>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2: VEHICLE SPECS (ReadOnly) */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-sm font-bold">2</span>
                                Vehicle Specifications (Verified)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                <div className="space-y-2 opacity-75">
                                    <Label>Maker</Label>
                                    <Input value={formData.maker} readOnly className="bg-gray-200 dark:bg-gray-700 border-transparent font-medium" />
                                </div>
                                <div className="space-y-2 opacity-75">
                                    <Label>Model</Label>
                                    <Input value={formData.model} readOnly className="bg-gray-200 dark:bg-gray-700 border-transparent font-medium" />
                                </div>
                                <div className="space-y-2 opacity-75">
                                    <Label>Year</Label>
                                    <Input value={formData.year} readOnly className="bg-gray-200 dark:bg-gray-700 border-transparent font-medium" />
                                </div>
                                <div className="space-y-2 opacity-75">
                                    <Label>Body Type</Label>
                                    <Input value={formData.brand} readOnly className="bg-gray-200 dark:bg-gray-700 border-transparent font-medium" />
                                </div>
                                <div className="space-y-2 opacity-75">
                                    <Label>Fuel Type</Label>
                                    <Input value={formData.fueltype} readOnly className="bg-gray-200 dark:bg-gray-700 border-transparent font-medium" />
                                </div>
                                <div className="space-y-2 opacity-75">
                                    <Label>Registration No.</Label>
                                    <Input value={formData.registrationnumber || "MH12XX9999"} readOnly className="bg-gray-200 dark:bg-gray-700 border-transparent font-medium" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3: CONDITION & EXTRAS (Editable) */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 text-sm font-bold">3</span>
                                Condition & Details (Editable)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="space-y-2">
                                    <Label htmlFor="color" className="text-blue-600 dark:text-blue-400 font-semibold">Color</Label>
                                    <Input id="color" name="color" value={formData.color} onChange={handleChange} required className="border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:bg-gray-700/50 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="mileage" className="text-blue-600 dark:text-blue-400 font-semibold">Mileage (km/l)</Label>
                                    <Input id="mileage" name="mileage" value={formData.mileage} onChange={handleChange} required className="border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:bg-gray-700/50 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="transmission" className="text-blue-600 dark:text-blue-400 font-semibold">Transmission</Label>
                                    <Input id="transmission" name="transmission" value={formData.transmission} onChange={handleChange} className="border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:bg-gray-700/50 h-11" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="owner" className="text-gray-700 dark:text-gray-300">Ownership</Label>
                                    <Input id="owner" name="owner" value={formData.owner} onChange={handleChange} className={`h-11 dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                </div>

                                <div className="col-span-full space-y-2">
                                    <Label htmlFor="description" className="text-blue-600 dark:text-blue-400 font-semibold">Description</Label>
                                    <Textarea id="description" name="description" value={formData.description} onChange={handleChange} className="border-blue-200 dark:border-blue-800 focus:border-blue-500 dark:bg-gray-700/50 min-h-[120px] text-base" placeholder="Describe the car's condition, features, and history..." />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: REGISTRATION & DOCUMENTS (New) */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 text-sm font-bold">4</span>
                                Registration & Documents
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="space-y-2">
                                    <Label htmlFor="registrationnumber">Registration Number</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="registrationnumber"
                                            name="registrationnumber"
                                            value={formData.registrationnumber}
                                            onChange={(e) => handleChange({ target: { name: e.target.name, value: e.target.value.toUpperCase() } })}
                                            placeholder="MH12AB1234"
                                            className="uppercase dark:bg-gray-700/50"
                                        />
                                        <Button
                                            type="button"
                                            onClick={handleFetchRcDetails}
                                            disabled={fetchingRc || !formData.registrationnumber}
                                            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white"
                                        >
                                            {fetchingRc ? <Loader2 className="w-4 h-4 animate-spin" /> : "Fetch RC"}
                                        </Button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registrationdate">Registration Date</Label>
                                    <Input type="date" id="registrationdate" name="registrationdate" value={formData.registrationdate} onChange={handleChange} className={`dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="registrationplace">Registration Place (RTO)</Label>
                                    <Input id="registrationplace" name="registrationplace" value={formData.registrationplace} onChange={handleChange} placeholder="Pune RTO" className={`dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="chassisnumber">Chassis Number</Label>
                                    <Input id="chassisnumber" name="chassisnumber" value={formData.chassisnumber} onChange={handleChange} className={`uppercase dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="enginenumber">Engine Number</Label>
                                    <Input id="enginenumber" name="enginenumber" value={formData.enginenumber} onChange={handleChange} className={`uppercase dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 5: INSURANCE DETAILS (New) */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-teal-100 dark:bg-teal-900 flex items-center justify-center text-teal-600 text-sm font-bold">5</span>
                                Insurance Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                <div className="space-y-2">
                                    <Label htmlFor="insurancestatus">Insurance Status</Label>
                                    <Select name="insurancestatus" value={formData.insurancestatus} onValueChange={(val) => handleSelectChange('insurancestatus', val)} disabled={isRcFetched}>
                                        <SelectTrigger className={isRcFetched ? 'cursor-not-allowed opacity-75' : ''}>
                                            <SelectValue placeholder="Select Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Active">Active</SelectItem>
                                            <SelectItem value="Inactive">Inactive</SelectItem>
                                            <SelectItem value="Expired">Expired</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {formData.insurancestatus === 'Active' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="insurancecompany">Insurance Company</Label>
                                            <Input id="insurancecompany" name="insurancecompany" value={formData.insurancecompany} onChange={handleChange} placeholder="e.g. HDFC Ergo" className={`dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="insurancevalidity">Validity Through</Label>
                                            <Input type="date" id="insurancevalidity" name="insurancevalidity" value={formData.insurancevalidity} onChange={handleChange} className={`dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="insurancepremium">Premium Amount (₹)</Label>
                                            <Input id="insurancepremium" name="insurancepremium" value={formData.insurancepremium} onChange={handleChange} placeholder="e.g. 12000" className={`dark:bg-gray-700/50 ${isRcFetched ? 'cursor-not-allowed opacity-75' : ''}`} readOnly={isRcFetched} />
                                        </div>
                                    </>
                                )}

                            </div>
                        </div>

                        {/* SECTION 6: AI DAMAGE INSPECTION (New Full Width) */}
                        {detectionResults && (
                            <div className="animate-in fade-in slide-in-from-bottom-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center text-red-600 dark:text-red-400 text-sm font-bold">6</span>
                                    AI Damage Inspection Report
                                </h3>
                                <div className="bg-orange-50 dark:bg-orange-900/10 p-6 rounded-xl border border-orange-100 dark:border-orange-800/20 shadow-sm">
                                    <h4 className="font-bold text-lg flex items-center gap-2 mb-4 text-orange-800 dark:text-orange-300">
                                        <ScanEye className="w-5 h-5" />
                                        Visual Damage Analysis
                                    </h4>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {detectionResults.map((result, idx) => {
                                            const imgData = result.image || result.annotated_image || result.base64_image;
                                            const hasDetections = result.detections && result.detections.length > 0;

                                            if (!imgData) return null;

                                            return (
                                                <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                                                    <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                                                        <img
                                                            src={imgData.startsWith('data:image') ? imgData : `data:image/jpeg;base64,${imgData}`}
                                                            alt={`Analysis ${idx}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        {hasDetections && (
                                                            <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md shadow-lg flex items-center gap-1">
                                                                <AlertTriangle className="w-3 h-3" /> Detected
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-4">
                                                        {hasDetections ? (
                                                            <div className="space-y-2">
                                                                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Identified Issues</div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {result.detections.map((d, i) => (
                                                                        <span key={i} className="text-xs px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded border border-red-200 dark:border-red-800 font-medium">
                                                                            {d.class_name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium py-1">
                                                                <CheckCircle className="w-4 h-4" />
                                                                <span className="text-sm">No Damage Detected</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/inventory')} className="h-12 px-6">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading} size="lg" className="h-12 px-8 bg-gray-900 hover:bg-black dark:bg-white dark:text-black hover:shadow-lg transition-all text-lg font-semibold">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    "Publish Listing"
                                )}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddCar;
