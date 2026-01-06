import React, { createContext, useContext, useState, useEffect } from 'react';

// ============================================================================
// AUTH CONTEXT: Global authentication state management
// ============================================================================
// This context provides authentication state and functions throughout the app.
// It handles login, signup, logout, and persists auth state in localStorage.
// 
// IMPORTANT: This is a FRONTEND-ONLY implementation for demo purposes.
// When backend is ready, replace the mock functions with actual API calls.
// ============================================================================

const AuthContext = createContext(null);

// Custom hook to access auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// AuthProvider component - wraps the entire app
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // ============================================================================
    // INITIALIZATION: Check for existing auth on component mount
    // ============================================================================
    useEffect(() => {
        // Check localStorage for existing authentication
        const storedUser = localStorage.getItem('authUser');
        const storedToken = localStorage.getItem('authToken');

        if (storedUser && storedToken) {
            try {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Failed to parse stored user data:', error);
                // Clear invalid data
                localStorage.removeItem('authUser');
                localStorage.removeItem('authToken');
            }
        }
        setLoading(false);
    }, []);

    // ============================================================================
    // LOGIN FUNCTION
    // ============================================================================
    // Frontend-only implementation - accepts any credentials for demo
    // TODO: Replace with actual backend API call when backend is ready
    // ============================================================================
    const login = async (email, password) => {
        try {
            // Basic validation
            if (!email || !password) {
                throw new Error('Email and password are required');
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // ==================================================================
            // MOCK AUTHENTICATION: Accept any credentials
            // ==================================================================
            // For demo purposes, we accept any email/password combination
            // In production, this would be replaced with:
            // const response = await fetch('/api/auth/login', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ email, password })
            // });
            // const data = await response.json();
            // ==================================================================

            // Generate mock user data and token
            const mockUser = {
                id: Date.now().toString(),
                email: email,
                name: email.split('@')[0], // Extract name from email
                createdAt: new Date().toISOString()
            };

            const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            // Store in localStorage for persistence
            localStorage.setItem('authUser', JSON.stringify(mockUser));
            localStorage.setItem('authToken', mockToken);

            // Update state
            setUser(mockUser);
            setIsAuthenticated(true);

            return { success: true, user: mockUser };
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    // ============================================================================
    // SIGNUP FUNCTION
    // ============================================================================
    // Frontend-only implementation - creates mock user account
    // TODO: Replace with actual backend API call when backend is ready
    // ============================================================================
    const signup = async (name, email, password) => {
        try {
            // Validation
            if (!name || !email || !password) {
                throw new Error('All fields are required');
            }

            // Email format validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new Error('Please enter a valid email address');
            }

            // Password strength validation
            if (password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            }

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 500));

            // ==================================================================
            // MOCK USER CREATION
            // ==================================================================
            // In production, this would be replaced with:
            // const response = await fetch('/api/auth/signup', {
            //   method: 'POST',
            //   headers: { 'Content-Type': 'application/json' },
            //   body: JSON.stringify({ name, email, password })
            // });
            // const data = await response.json();
            // ==================================================================

            // Create mock user
            const mockUser = {
                id: Date.now().toString(),
                name: name,
                email: email,
                createdAt: new Date().toISOString()
            };

            const mockToken = `mock_jwt_${Date.now()}_${Math.random().toString(36).substring(7)}`;

            // Store in localStorage
            localStorage.setItem('authUser', JSON.stringify(mockUser));
            localStorage.setItem('authToken', mockToken);

            // Update state
            setUser(mockUser);
            setIsAuthenticated(true);

            return { success: true, user: mockUser };
        } catch (error) {
            console.error('Signup error:', error);
            throw error;
        }
    };

    // ============================================================================
    // LOGOUT FUNCTION
    // ============================================================================
    // Clears authentication state and localStorage
    // ============================================================================
    const logout = () => {
        // Clear localStorage
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');

        // Clear state
        setUser(null);
        setIsAuthenticated(false);
    };

    // ============================================================================
    // CONTEXT VALUE: All auth state and functions available to consumers
    // ============================================================================
    const value = {
        user,
        isAuthenticated,
        loading,
        login,
        signup,
        logout
    };

    // Show loading state while checking initial auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
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
