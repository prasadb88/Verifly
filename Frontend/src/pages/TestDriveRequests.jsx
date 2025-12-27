import React, { useEffect, useState } from 'react';
import testdriveservice from '../config/testdriveservice';
import { Loader2, Calendar, Clock, CheckCircle, Check, X, Phone, User, Play, XCircle, Car, CheckCircle as CheckCircleIcon } from 'lucide-react';
import { toast } from 'sonner';
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
} from "../components/ui/alert-dialog";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../components/ui/dialog";
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardFooter } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Textarea } from '../components/ui/textarea';

const TestDriveRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const [rejectionReason, setRejectionReason] = useState("");
    const [rejectingId, setRejectingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await testdriveservice.getDealerRequests();
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests:", error);
            toast.error("Failed to load test drive requests.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async (id) => {
        setProcessingId(id);
        try {
            await testdriveservice.acceptRequest(id);
            toast.success("Test drive accepted!");
            fetchRequests();
        } catch (error) {
            toast.error(error.message || "Failed to accept request.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error("Please provide a reason for rejection.");
            return;
        }
        setProcessingId(rejectingId);
        try {
            await testdriveservice.rejectRequest(rejectingId, rejectionReason);
            toast.success("Request rejected.");
            setRejectingId(null);
            setRejectionReason("");
            fetchRequests();
        } catch (error) {
            toast.error(error.message || "Failed to reject request.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleStart = async (id) => {
        setProcessingId(id);
        try {
            await testdriveservice.startTestDrive(id);
            toast.success("Test drive started!");
            fetchRequests();
        } catch (error) {
            toast.error(error.message || "Failed to start test drive.");
        } finally {
            setProcessingId(null);
        }
    };

    const handleComplete = async (id) => {
        setProcessingId(id);
        try {
            await testdriveservice.completeTestDrive(id);
            toast.success("Test drive marked as completed!");
            fetchRequests();
        } catch (error) {
            toast.error(error.message || "Failed to complete test drive.");
        } finally {
            setProcessingId(null);
        }
    };

    // Filter requests
    const pendingRequests = requests.filter(r => r.status === 'pending');
    const scheduledRequests = requests.filter(r => r.status === 'accepted');
    const inProgressRequests = requests.filter(r => r.status === 'in-progress');
    const historyRequests = requests.filter(r => ['completed', 'rejected', 'cancelled'].includes(r.status));

    const RequestCard = ({ request, showActions = false }) => (
        <Card className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-900/60 dark:backdrop-blur-xl dark:border dark:border-gray-800 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="flex flex-col md:flex-row">
                <div className="w-full md:w-1/3 h-48 md:h-auto relative">
                    <img
                        src={request.car?.images?.[0] || '/placeholder-car.jpg'}
                        alt={request.car?.model}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 md:bg-transparent"></div>
                    <div className="absolute bottom-2 left-2 text-white md:hidden font-bold">
                        {request.car?.maker} {request.car?.model}
                    </div>
                </div>
                <div className="p-5 w-full md:w-2/3 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white hidden md:block">
                                    {request.car?.model} <span className="text-gray-500 text-sm font-normal">{request.car?.year}</span>
                                </h3>
                                <Badge variant="outline" className={`mt-1 capitalize ${request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                        request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                            'bg-gray-100 text-gray-800'
                                    }`}>
                                    {request.status}
                                </Badge>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold flex items-center justify-end text-gray-700 dark:text-gray-300">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {new Date(request.requesteddate).toLocaleDateString()}
                                </p>
                                <p className="text-sm flex items-center justify-end text-gray-500">
                                    <Clock className="w-4 h-4 mr-1" />
                                    {request.requestedtime}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Buyer Details</h4>
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
                                    {request.buyer?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-900 dark:text-white">{request.buyer?.fullname || request.buyer?.username}</p>
                                    <p className="text-sm text-gray-500">{request.buyer?.email}</p>
                                    {request.buyer?.phoneno && (
                                        <p className="text-sm text-gray-500 flex items-center mt-1">
                                            <Phone className="w-3 h-3 mr-1" /> {request.buyer.phoneno}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {showActions && (
                        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {request.status === 'pending' && (
                                <>
                                    <Button
                                        onClick={() => handleAccept(request._id)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                        disabled={processingId === request._id}
                                    >
                                        {processingId === request._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4 mr-2" />}
                                        Accept
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => setRejectingId(request._id)}
                                    >
                                        <X className="w-4 h-4 mr-2" /> Reject
                                    </Button>
                                </>
                            )}

                            {request.status === 'accepted' && (
                                <Button
                                    onClick={() => handleStart(request._id)}
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    disabled={processingId === request._id}
                                >
                                    {processingId === request._id ? <Loader2 className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4 mr-2" />}
                                    Start Test Drive
                                </Button>
                            )}

                            {request.status === 'in-progress' && (
                                <Button
                                    onClick={() => handleComplete(request._id)}
                                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
                                    disabled={processingId === request._id}
                                >
                                    {processingId === request._id ? <Loader2 className="animate-spin w-4 h-4" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                    Complete Test Drive
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Card>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Test Drive Requests</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Manage and track your test drive appointments.</p>
                </div>

                <Tabs defaultValue="pending" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-2 gap-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 mb-8">
                        <TabsTrigger value="pending" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">Pending ({pendingRequests.length})</TabsTrigger>
                        <TabsTrigger value="scheduled" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">Scheduled ({scheduledRequests.length})</TabsTrigger>
                        <TabsTrigger value="inprogress" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">In Progress ({inProgressRequests.length})</TabsTrigger>
                        <TabsTrigger value="history" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">History ({historyRequests.length})</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending" className="space-y-4">
                        {pendingRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500">No pending requests.</p>
                            </div>
                        ) : (
                            pendingRequests.map(req => <RequestCard key={req._id} request={req} showActions={true} />)
                        )}
                    </TabsContent>

                    <TabsContent value="scheduled" className="space-y-4">
                        {scheduledRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500">No scheduled test drives.</p>
                            </div>
                        ) : (
                            scheduledRequests.map(req => <RequestCard key={req._id} request={req} showActions={true} />)
                        )}
                    </TabsContent>

                    <TabsContent value="inprogress" className="space-y-4">
                        {inProgressRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500">No test drives in progress.</p>
                            </div>
                        ) : (
                            inProgressRequests.map(req => <RequestCard key={req._id} request={req} showActions={true} />)
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="space-y-4">
                        {historyRequests.length === 0 ? (
                            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
                                <p className="text-gray-500">No history available.</p>
                            </div>
                        ) : (
                            historyRequests.map(req => <RequestCard key={req._id} request={req} />)
                        )}
                    </TabsContent>
                </Tabs>
            </div>


            <Dialog open={!!rejectingId} onOpenChange={(open) => !open && setRejectingId(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Request</DialogTitle>
                        <DialogDescription>
                            Please provide a reason for rejecting this test drive request.
                        </DialogDescription>
                    </DialogHeader>
                    <Textarea
                        placeholder="e.g., Car is strictly unavailable at this time..."
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                    />
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRejectingId(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={processingId === rejectingId}>
                            {processingId === rejectingId ? <Loader2 className="animate-spin w-4 h-4" /> : "Confirm Rejection"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default TestDriveRequests;
