import React from 'react';
import { useRouteError, useNavigate } from 'react-router';
import { AlertCircle, Home, RefreshCcw } from 'lucide-react';

const GlobalError = () => {
    const error = useRouteError();
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-6">
                    <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
                
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Oops! Something went wrong</h1>
                <p className="text-gray-600 mb-6">
                    {error?.message || error?.statusText || "We've encountered an unexpected error."}
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex justify-center items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex justify-center items-center gap-2 px-6 py-2.5 bg-green-800 text-white rounded-lg hover:bg-green-900 transition-colors font-medium"
                    >
                        <Home className="w-4 h-4" />
                        Return Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GlobalError;
