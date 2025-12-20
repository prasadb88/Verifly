import React, { useState, useEffect } from 'react';
import authService from '../config/authservice';
import { toast } from 'sonner';
import { Loader2, Send, Clock, UserCheck, XCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../components/ui/card';

const RequestRoleChange = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [requests, setRequests] = useState([]);
    const [fetchingRequests, setFetchingRequests] = useState(true);
    const [formData, setFormData] = useState({
        requestedRole: '',
        reason: ''
    });

    useEffect(() => {
        fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        try {
            const response = await authService.getMyRequests();
            setRequests(response.data);
        } catch (error) {
            console.error("Error fetching requests:", error);
        } finally {
            setFetchingRequests(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!formData.requestedRole) {
            toast.error("Please select a role");
            return;
        }
        if (!formData.reason || formData.reason.length < 10) {
            toast.error("Reason must be at least 10 characters");
            return;
        }

        setIsLoading(true);
        try {
            await authService.requestRoleChange(formData);
            toast.success("Request submitted successfully!");
            setFormData({ requestedRole: '', reason: '' }); // Reset form
            fetchMyRequests();
        } catch (error) {
            toast.error(error.message || "Failed to submit request.");
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'approved': return 'text-green-500 bg-green-100 dark:bg-green-500/20 dark:text-green-400';
            case 'rejected': return 'text-red-500 bg-red-100 dark:bg-red-500/20 dark:text-red-400';
            default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-500/20 dark:text-yellow-400';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'approved': return <UserCheck className="h-5 w-5" />;
            case 'rejected': return <XCircle className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };

    const hasPendingRequest = requests.some(req => req.status === 'pending');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12 transition-colors duration-300">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header Section */}
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        Become a Partner
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Join our network of verified dealers and expand your reach.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Request Form */}
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/60 dark:backdrop-blur-xl dark:border dark:border-gray-800 transition-all">
                        <CardHeader>
                            <CardTitle>Submit Application</CardTitle>
                            <CardDescription>Request to upgrade your account role.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {hasPendingRequest ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center space-y-4">
                                    <div className="p-4 bg-yellow-100 dark:bg-yellow-500/20 rounded-full">
                                        <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-lg">Application Under Review</h3>
                                        <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                            You already have a pending request. Please wait for the admin to review it.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={onSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label htmlFor="requestedRole" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Role Type
                                        </label>
                                        <select
                                            id="requestedRole"
                                            name="requestedRole"
                                            value={formData.requestedRole}
                                            onChange={handleInputChange}
                                            className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background/50 dark:bg-gray-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            <option value="" disabled>Select a role</option>
                                            <option value="dealer">Dealer</option>
                                        </select>
                                        <p className="text-xs text-muted-foreground">
                                            Dealer accounts can list cars and manage inventory.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label htmlFor="reason" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            Why do you want to change role?
                                        </label>
                                        <textarea
                                            id="reason"
                                            name="reason"
                                            value={formData.reason}
                                            onChange={handleInputChange}
                                            placeholder="Tell us about your dealership or business..."
                                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background/50 dark:bg-gray-950/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none h-32"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
                                        ) : (
                                            <><Send className="mr-2 h-4 w-4" /> Submit Application</>
                                        )}
                                    </Button>
                                </form>
                            )}
                        </CardContent>
                    </Card>

                    {/* Request History */}
                    <Card className="shadow-lg border-0 bg-white/80 dark:bg-gray-900/60 dark:backdrop-blur-xl dark:border dark:border-gray-800 h-fit transition-all">
                        <CardHeader>
                            <CardTitle>Application History</CardTitle>
                            <CardDescription>Track the status of your previous requests.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {fetchingRequests ? (
                                <div className="flex justify-center p-4">
                                    <Loader2 className="animate-spin h-6 w-6 text-blue-500" />
                                </div>
                            ) : requests.length === 0 ? (
                                <p className="text-center text-gray-500 py-8">No applications yet.</p>
                            ) : (
                                <div className="space-y-4">
                                    {requests.map((req) => (
                                        <div
                                            key={req._id}
                                            className="flex items-start justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50 transition-colors"
                                        >
                                            <div className="space-y-1">
                                                <p className="font-medium capitalize text-gray-900 dark:text-gray-100">
                                                    Request to become <span className="font-bold text-blue-600">{req.requestedRole}</span>
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(req.createdAt).toLocaleDateString()}
                                                </p>
                                                {req.reason && (
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 italic">
                                                        "{req.reason}"
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(req.status)}`}>
                                                {getStatusIcon(req.status)}
                                                <span className="capitalize">{req.status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                </div>
            </div>
        </div>
    );
};

export default RequestRoleChange;
