// CurrentShiftComponent.js
'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CurrentShiftComponent = () => {
    const [activeShift, setActiveShift] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [elapsedTime, setElapsedTime] = useState('00:00:00');

    useEffect(() => {
        fetchCurrentShift();
    }, []);

    // Update elapsed time every second if there's an active shift
    useEffect(() => {
        if (!activeShift) return;

        const intervalId = setInterval(() => {
            const startTime = new Date(activeShift.start_time);
            const currentTime = new Date();
            const diffMs = currentTime - startTime;

            // Format as HH:MM:SS
            const hours = Math.floor(diffMs / 3600000).toString().padStart(2, '0');
            const minutes = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, '0');
            const seconds = Math.floor((diffMs % 60000) / 1000).toString().padStart(2, '0');

            setElapsedTime(`${hours}:${minutes}:${seconds}`);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [activeShift]);

    const fetchCurrentShift = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/shifts/current');
            setActiveShift(response.data.activeShift);
        } catch (err) {
            console.error('Error fetching current shift:', err);
            setError(err.response?.data?.error || 'Failed to fetch current shift');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    if (isLoading) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-md">
                <p>Loading current shift information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-white rounded-lg shadow-md">
                <p className="text-red-500">Error: {error}</p>
            </div>
        );
    }

    return (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                    <h3 className="text-base font-medium text-gray-700">Shift Stats</h3>
                    <div className="h-px flex-grow bg-gradient-to-r from-blue-200 to-transparent ml-3"></div>
                </div>

                {activeShift && (
                    <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-1"></div>
                        <span className="text-xs font-medium text-green-600">LIVE</span>
                    </div>
                )}
            </div>

            {activeShift ? (
                <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Status</p>
                            <div className="flex items-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                                <span className="text-green-600 font-medium">Active</span>
                            </div>
                        </div>

                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Started</p>
                            <p className="text-gray-700 font-medium">{formatDateTime ? formatDateTime(activeShift.start_time) : "10:30 AM"}</p>
                        </div>

                        <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="text-xs text-gray-500 mb-1">Shift ID</p>
                            <div className="flex items-center justify-between">
                                <p className="text-gray-700 font-mono text-sm">{activeShift.id || "SH-7842-45A"}</p>
                                <button className="text-blue-500 hover:text-blue-600 transition-colors text-xs">
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="relative p-3 bg-white rounded-lg border border-blue-200">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-500 rounded-t-lg"></div>
                        <p className="text-sm text-gray-500 mb-1 mt-1">Elapsed Time</p>
                        <div className="flex items-center justify-center">
                            <p className="text-2xl font-mono text-gray-800">{elapsedTime || "03:27:42"}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p className="text-gray-500 text-sm">No active shift at this time.</p>
                </div>
            )}
        </div>
    );
};

export default CurrentShiftComponent;