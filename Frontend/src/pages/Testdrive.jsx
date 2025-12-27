import React, { useEffect, useState } from 'react';
import testdriveservice from '../config/testdriveservice';
import { Loader2, Calendar, Clock, Ban, AlertTriangle, Car, History, User, MessageCircle } from 'lucide-react';
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
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

const Testdrive = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await testdriveservice.getMyRequests();
            setRequests(response.data);
        } catch (error) {
            toast.error("Failed to load your test drives.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        setActionLoading(id);
        try {
            await testdriveservice.cancelTestDrive(id);
            toast.success("Test drive request cancelled.");
            fetchRequests();
        } catch (error) {
            toast.error(error.message || "Failed to cancel request.");
        } finally {
            setActionLoading(null);
        }
    };

    const activeRequests = requests.filter(r => ['pending', 'accepted', 'approved', 'in-progress'].includes(r.status));
    const completedRequests = requests.filter(r => r.status === 'completed');
    const rejectedRequests = requests.filter(r => r.status === 'rejected');
    const cancelledRequests = requests.filter(r => r.status === 'cancelled');

    const RequestList = ({ items, emptyMessage }) => {
        if (items.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center py-16 bg-white/50 dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center animate-in fade-in zoom-in-95 duration-300">
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                        <History className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 max-w-sm font-medium">
                        {emptyMessage}
                    </p>
                </div>
            )
        }
        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {items.map((request) => (
                    <Card key={request._id} className="overflow-hidden border-0 shadow-lg bg-white/80 dark:bg-gray-900/60 dark:backdrop-blur-xl dark:border dark:border-gray-800 transition-all hover:shadow-xl hover:-translate-y-1">
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
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Dealer Details</h4>
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
                                                {request.dealer?.username?.[0]?.toUpperCase() || <User className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{request.dealer?.fullname || request.dealer?.username}</p>
                                                <p className="text-sm text-gray-500">{request.dealer?.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {request.rejectionReason && (
                                        <div className="mt-4 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30 text-xs animate-in zoom-in-95">
                                            <p className="font-semibold text-red-700 dark:text-red-400 flex items-center gap-1">
                                                <AlertTriangle className="w-3 h-3" /> Dealer Message:
                                            </p>
                                            <p className="text-red-600 dark:text-red-300 mt-1 italic">"{request.rejectionReason}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                    {request.status === 'pending' && (
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button variant="outline" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50" disabled={actionLoading === request._id}>
                                                    {actionLoading === request._id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Ban className="w-4 h-4 mr-2" />}
                                                    Cancel Request
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This will cancel your test drive request for the <b>{request.car?.model}</b>.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Keep Request</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleCancel(request._id)} className="bg-red-600 hover:bg-red-700 text-white">
                                                        Yes, Cancel
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    )}
                                    {['accepted', 'approved'].includes(request.status) && (
                                        <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.location.href = `/chat`}>
                                            <MessageCircle className="w-4 h-4 mr-2" />
                                            Chat with Dealer
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        )
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <p className="mt-4 text-gray-500 animate-pulse">Loading your test drives...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12 transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block">
                            My Test Drives
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Track and manage your upcoming vehicle test drives.
                        </p>
                    </div>
                    {requests.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Requests: <span className="text-blue-600 dark:text-blue-400 font-bold ml-1">{requests.length}</span>
                        </div>
                    )}
                </div>

                {requests.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-900/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 text-center animate-in fade-in zoom-in-95">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                            <Car className="h-10 w-10 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">No Request Found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
                            You haven't booked any test drives yet. Browse our inventory to find your dream car!
                        </p>
                        <Button className="mt-6 bg-blue-600 hover:bg-blue-700 font-semibold" onClick={() => window.location.href = '/cars'}>
                            Browse Cars
                        </Button>
                    </div>
                ) : (
                    <Tabs defaultValue="active" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-2 gap-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-200/50 dark:border-gray-700/50 mb-8">
                            <TabsTrigger value="active" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">Active</TabsTrigger>
                            <TabsTrigger value="completed" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">Completed</TabsTrigger>
                            <TabsTrigger value="rejected" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">Rejected</TabsTrigger>
                            <TabsTrigger value="cancelled" className="rounded-xl py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300 ease-in-out">Cancelled</TabsTrigger>
                        </TabsList>
                        <TabsContent value="active" className="mt-0">
                            <RequestList items={activeRequests} emptyMessage="No active test drive requests." />
                        </TabsContent>
                        <TabsContent value="completed" className="mt-0">
                            <RequestList items={completedRequests} emptyMessage="No completed test drives yet." />
                        </TabsContent>
                        <TabsContent value="rejected" className="mt-0">
                            <RequestList items={rejectedRequests} emptyMessage="No rejected requests." />
                        </TabsContent>
                        <TabsContent value="cancelled" className="mt-0">
                            <RequestList items={cancelledRequests} emptyMessage="No cancelled requests." />
                        </TabsContent>
                    </Tabs>
                )}
            </div>
        </div>
    );
};

export default Testdrive;