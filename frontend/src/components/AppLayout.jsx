import React from 'react';
import AppNavbar from './AppNavbar';

export default function AppLayout({ children }) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <AppNavbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                {children}
            </main>
        </div>
    );
}
