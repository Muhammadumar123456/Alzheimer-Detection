import React from 'react';
import { AlertTriangle, Home, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.href = '/home';
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-6">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full">
                        {/* Error Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="p-4 bg-red-100 rounded-full">
                                <AlertTriangle className="w-16 h-16 text-red-600" />
                            </div>
                        </div>

                        {/* Error Title */}
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4 text-center">
                            Oops! Something went wrong
                        </h1>

                        {/* Error Message */}
                        <p className="text-gray-600 text-center mb-8 leading-relaxed">
                            We apologize for the inconvenience. An unexpected error occurred while running the application.
                            Please try refreshing the page or returning to the home page.
                        </p>

                        {/* Error Details (Development Mode) */}
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mb-8 p-6 bg-gray-50 rounded-lg border-l-4 border-red-500 overflow-auto">
                                <h3 className="font-semibold text-gray-800 mb-2">Error Details:</h3>
                                <pre className="text-sm text-red-700 whitespace-pre-wrap break-words">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <details className="mt-4">
                                        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                            Component Stack Trace
                                        </summary>
                                        <pre className="mt-2 text-xs text-gray-600 whitespace-pre-wrap break-words">
                                            {this.state.errorInfo.componentStack}
                                        </pre>
                                    </details>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={this.handleReset}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-colors"
                                aria-label="Return to home page"
                            >
                                <Home className="w-5 h-5" />
                                Go to Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl shadow transition-colors"
                                aria-label="Refresh page"
                            >
                                <RefreshCcw className="w-5 h-5" />
                                Refresh Page
                            </button>
                        </div>

                        {/* Footer Note */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500 text-center">
                                If this problem persists, please contact support or consult your FYP supervisor.
                            </p>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
