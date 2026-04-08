import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiPost, apiGet } from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // Auto-logout helper
    const clearAuth = useCallback(() => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
        setUser(null);
        setIsAuthenticated(false);
    }, []);

    // Verify existing token on mount
    const verifyToken = useCallback(async () => {
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await apiGet('/auth/me');
            setUser(response.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.warn('Auth verification failed:', error.message);
            clearAuth();
        } finally {
            setLoading(false);
        }
    }, [clearAuth]);

    useEffect(() => {
        verifyToken();
    }, [verifyToken]);

    // LOGIN WITH TOKEN (for OAuth or Reset Password)
    const loginWithToken = useCallback((userData, token) => {
        localStorage.setItem('authToken', token);
        localStorage.setItem('authUser', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    }, []);

    // LOGIN
    const login = async (email, password) => {
        if (!email || !password) {
            throw new Error('Email and password are required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Please enter a valid email address');
        }

        const response = await apiPost('/auth/login', { email, password });

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);

        return { success: true, user: response.data.user };
    };

    // SIGNUP
    const signup = async (name, email, password) => {
        if (!name || !email || !password) {
            throw new Error('All fields are required');
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Please enter a valid email address');
        }
        
        // Strong password regex: 8 chars, 1 upper, 1 lower, 1 number, 1 special
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?~`])/;
        if (!passwordRegex.test(password)) {
            throw new Error('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character');
        }

        const response = await apiPost('/auth/register', { name, email, password });

        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('authUser', JSON.stringify(response.data.user));
        setUser(response.data.user);
        setIsAuthenticated(true);

        return { success: true, user: response.data.user };
    };

    // LOGOUT
    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout,
        loginWithToken,
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
