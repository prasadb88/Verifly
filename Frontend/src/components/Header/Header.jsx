import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { ModeToggle } from '../ui/mode-toggle';
import { Menu, X, User, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../Store/authSlice';
import authService from '../../config/authservice';

function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Access Authentication State
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const userRole = user?.role || 'buyer'; // Default to buyer if undefined

    // 1. Guest Navigation
    const guestItems = [
        { name: 'HOME', href: '/' },
        { name: 'CARS', href: '/cars' },
        { name: 'FEATURES', href: '/features' },
        { name: 'ABOUT US', href: '/about-us' },
        { name: 'CONTACT', href: '/contact' }
    ];

    // 2. Buyer Navigation
    const buyerItems = [
        { name: 'HOME', href: '/' },
        { name: 'CARS', href: '/cars' },
        { name: 'MY TEST DRIVES', href: '/my-test-drives' },
        { name: 'CHANGE ROLE', href: '/request-role' }, // Placeholder
        { name: 'PROFILE', href: '/profile' }
    ];

    // 3. Dealer Navigation
    const dealerItems = [
        { name: 'DASHBOARD', href: '/' },
        { name: 'REQUESTS', href: '/requests' },
        { name: 'INVENTORY', href: '/inventory' },
        { name: 'PROFILE', href: '/profile' },
        { name: 'GLOBAL INVENTORY', href: '/cars' },
    ];

    // 4. Admin Navigation
    const adminItems = [
        { name: 'DASHBOARD', href: '/' },
        { name: 'REQUESTS', href: '/requests' },
        { name: 'GLOBAL INVENTORY', href: '/cars' },
        { name: 'PROFILE', href: '/profile' },
        { name: 'ROLE APPROVALS', href: '/admin/change-role-requests' }
    ];

    // Determine which items to show
    let navItems = guestItems;
    if (isAuthenticated) {
        if (userRole === 'admin') {
            navItems = adminItems;
        } else if (userRole === 'dealer') {
            navItems = dealerItems;
        } else {
            navItems = buyerItems;
        }
    }

    const handleLogout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error("Logout failed", error);
        }
        dispatch(logout());
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const handleNavClick = (href) => {
        navigate(href);
        setIsMobileMenuOpen(false);
    };

    const getRoleBadgeStyle = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 border-transparent';
            case 'dealer':
                return 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/20 border-transparent';
            default:
                return 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    return (
        <nav className="sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-all duration-500 bg-white/80 border-gray-200 dark:bg-black/60 dark:border-white/10">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

                {/* Brand */}
                <div onClick={() => navigate('/')} className="cursor-pointer group">
                    <span className="text-2xl font-black tracking-tight transition-colors duration-300 text-slate-900 group-hover:text-blue-600 dark:text-white">
                        VERIFLY
                    </span>
                </div>

                {/* DESKTOP NAV */}
                <div className="hidden md:flex items-center space-x-8">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleNavClick(item.href)}
                            className="text-sm font-bold tracking-wide text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-white transition-colors uppercase"
                        >
                            {item.name}
                        </button>
                    ))}
                </div>

                {/* DESKTOP ACTIONS */}
                <div className="hidden md:flex items-center gap-4">
                    <ModeToggle />

                    {!isAuthenticated ? (
                        <>
                            <Button onClick={() => navigate('/login')} variant="ghost" size="sm" className="font-bold hover:bg-gray-100 dark:hover:bg-white/10">
                                SIGN IN
                            </Button>
                            <Button onClick={() => navigate('/register')} variant="default" size="sm" className="font-bold px-6 shadow-md hover:shadow-xl transition-all">
                                SIGN UP
                            </Button>
                        </>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className={`hidden lg:flex items-center px-3 py-1 rounded-full border ${getRoleBadgeStyle(userRole)}`}>
                                <span className="text-[10px] font-extrabold uppercase tracking-widest">
                                    {userRole}
                                </span>
                            </div>
                            <Button onClick={handleLogout} variant="destructive" size="sm" className="font-bold px-4 flex items-center gap-2">
                                <LogOut className="w-4 h-4" /> LOGOUT
                            </Button>
                        </div>
                    )}
                </div>

                {/* MOBILE TOGGLE */}
                <div className="flex md:hidden items-center gap-4">
                    <ModeToggle /> {/* Visible on mobile header now too for ease */}
                    <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-gray-600 dark:text-gray-300">
                        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* MOBILE MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-20 left-0 w-full border-b bg-white dark:bg-black p-6 flex flex-col space-y-4 shadow-xl animate-in slide-in-from-top-2">
                    {navItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => handleNavClick(item.href)}
                            className="text-left text-lg font-bold text-gray-800 dark:text-gray-200 hover:text-blue-600"
                        >
                            {item.name}
                        </button>
                    ))}

                    <div className="pt-4 border-t border-gray-100 dark:border-white/10 flex flex-col gap-3">
                        {!isAuthenticated ? (
                            <>
                                <Button onClick={() => { navigate('/login'); setIsMobileMenuOpen(false); }} variant="outline" className="w-full font-bold">
                                    SIGN IN
                                </Button>
                                <Button onClick={() => { navigate('/register'); setIsMobileMenuOpen(false); }} variant="default" className="w-full font-bold">
                                    SIGN UP
                                </Button>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-2 py-2 bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-100 dark:border-white/10">
                                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Role</span>
                                    <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded border ${getRoleBadgeStyle(userRole)}`}>
                                        {userRole}
                                    </span>
                                </div>
                                <Button onClick={handleLogout} variant="destructive" className="w-full font-bold flex items-center justify-center gap-2">
                                    <LogOut className="w-4 h-4" /> LOGOUT
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Header;