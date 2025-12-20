import React, { useEffect, useState } from 'react';
import authService from '../config/authservice';
import { toast } from 'sonner';
import { Check, X, Loader2, Mail, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '../components/ui/card';
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
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "../components/ui/tooltip";

const ChangeRoleRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await authService.getAllRoleRequests();
            setRequests(response.data);
        } catch (error) {
            console.error("Failed to fetch requests", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (requestId, newStatus) => {
        setProcessingId(requestId);
        try {
            await authService.updateRoleRequestStatus({ requestId, status: newStatus });
            toast.success(`Request ${newStatus} successfully`);
            fetchRequests(); // Refresh list
        } catch (error) {
            toast.error(error.message || "Failed to update status");
        } finally {
            setProcessingId(null);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            approved: "bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-400",
            rejected: "bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-400",
            pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-400",
        };
        const defaultStyle = "bg-gray-100 text-gray-800";

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status] || defaultStyle}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 px-4 sm:px-6 lg:px-8 pb-12 transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Role Management</h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">Review and manage user role upgrade requests.</p>
                    </div>
                    <Button onClick={fetchRequests} variant="outline" size="sm" className="gap-2">
                        <Loader2 className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </div>

                <Card className="shadow-md border-0 bg-white dark:bg-gray-900/60 dark:backdrop-blur-xl dark:border dark:border-gray-800 transition-all">
                    <CardHeader>
                        <CardTitle>Pending Applications</CardTitle>
                        <CardDescription>
                            Users requesting to become Dealers.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No role change requests found.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-md border">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 border-b dark:border-gray-800">
                                        <tr>
                                            <th className="px-4 py-3 font-medium">User</th>
                                            <th className="px-4 py-3 font-medium">Current Role</th>
                                            <th className="px-4 py-3 font-medium">Requested Role</th>
                                            <th className="px-4 py-3 font-medium">Reason</th>
                                            <th className="px-4 py-3 font-medium">Date</th>
                                            <th className="px-4 py-3 font-medium">Status</th>
                                            <th className="px-4 py-3 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {requests.map((req) => (
                                            <tr key={req._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors border-b last:border-0 dark:border-gray-800/50">
                                                <td className="px-4 py-3 font-medium">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-xs uppercase shrink-0">
                                                            {req.user?.username?.substring(0, 2) || 'U'}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span>{req.user?.username || 'Unknown'}</span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Mail className="h-3 w-3" /> {req.user?.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 capitalize">{req.user?.role || 'N/A'}</td>
                                                <td className="px-4 py-3 capitalize font-semibold text-blue-600 dark:text-blue-400">{req.requestedRole}</td>
                                                <td className="px-4 py-3 max-w-xs">
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span className="truncate block cursor-help">{req.reason || <span className="text-gray-400 italic">No reason provided</span>}</span>
                                                            </TooltipTrigger>
                                                            {req.reason && (
                                                                <TooltipContent className="max-w-sm bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900 p-3 rounded-lg shadow-xl border-0">
                                                                    <p>{req.reason}</p>
                                                                </TooltipContent>
                                                            )}
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                </td>
                                                <td className="px-4 py-3">{new Date(req.createdAt).toLocaleDateString()}</td>
                                                <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                                                <td className="px-4 py-3 text-right">
                                                    {req.status === 'pending' && (
                                                        <div className="flex justify-end gap-2">
                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 hover:text-green-600 hover:bg-green-50 dark:text-gray-400 dark:hover:bg-green-900/30 dark:hover:text-green-400"
                                                                        disabled={processingId === req._id}
                                                                    >
                                                                        <Check className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Approve Request?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will immediately upgrade <b>{req.user?.username}</b> to a <b>{req.requestedRole}</b>.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleStatusUpdate(req._id, 'approved')}
                                                                            className="bg-green-600 hover:bg-green-700"
                                                                        >
                                                                            Approve
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>

                                                            <AlertDialog>
                                                                <AlertDialogTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="h-8 w-8 hover:text-red-600 hover:bg-red-50 dark:text-gray-400 dark:hover:bg-red-900/30 dark:hover:text-red-400"
                                                                        disabled={processingId === req._id}
                                                                    >
                                                                        <X className="h-4 w-4" />
                                                                    </Button>
                                                                </AlertDialogTrigger>
                                                                <AlertDialogContent>
                                                                    <AlertDialogHeader>
                                                                        <AlertDialogTitle>Reject Request?</AlertDialogTitle>
                                                                        <AlertDialogDescription>
                                                                            This will decline <b>{req.user?.username}</b>'s application.
                                                                        </AlertDialogDescription>
                                                                    </AlertDialogHeader>
                                                                    <AlertDialogFooter>
                                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                        <AlertDialogAction
                                                                            onClick={() => handleStatusUpdate(req._id, 'rejected')}
                                                                            className="bg-red-600 hover:bg-red-700"
                                                                        >
                                                                            Reject
                                                                        </AlertDialogAction>
                                                                    </AlertDialogFooter>
                                                                </AlertDialogContent>
                                                            </AlertDialog>
                                                        </div>
                                                    )}
                                                </td
                                                ></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default ChangeRoleRequests;
