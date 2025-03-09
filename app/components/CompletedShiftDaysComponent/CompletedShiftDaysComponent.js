// CompletedShiftDaysComponent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompletedShiftDaysComponent = () => {
    const [completedDays, setCompletedDays] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchCompletedDays();
    }, []);

    const fetchCompletedDays = async () => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.get('/api/shifts/completed-days');
            setCompletedDays(response.data.completedDays);
        } catch (err) {
            console.error('Error fetching completed shift days:', err);
            setError('Failed to fetch completed days');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm relative">
            {/* Header with minimal styling */}
            <div className="flex items-center mb-4">
                <h3 className="text-base font-medium text-gray-800">Shift Stats</h3>
                <div className="h-px flex-grow bg-gray-200 ml-3"></div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-6">
                    <div className="w-6 h-6 border-t-2 border-gray-300 border-solid rounded-full animate-spin"></div>
                    <p className="text-gray-500 ml-3">Analyzing shift data...</p>
                </div>
            ) : error ? (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <p className="text-red-600 text-sm flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {error}
                    </p>
                </div>
            ) : (
                <div className="flex items-stretch">
                    <div className="flex-1 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Completed Shifts</span>
                        </div>
                        <div className="flex items-end">
                            <span className="text-3xl font-bold text-gray-800">{completedDays}</span>
                            <span className="text-sm text-gray-500 ml-2 mb-1">
                                {completedDays === 1 ? 'Day' : 'Days'}
                            </span>
                        </div>

                        {/* Simple minimal chart */}
                        <div className="mt-3 flex items-end h-8 space-x-1">
                            {[3, 5, 2, 6, 4, 7, 5].map((height, index) => (
                                <div
                                    key={index}
                                    className="w-3 bg-gray-300 rounded-sm"
                                    style={{ height: `${height * 10}%` }}
                                ></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompletedShiftDaysComponent;