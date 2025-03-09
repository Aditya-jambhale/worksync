// StartEndShiftComponent.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Coffee } from 'lucide-react/dist/cjs/lucide-react';

const StartEndShiftComponent = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [activeShift, setActiveShift] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [showEndShiftModal, setShowEndShiftModal] = useState(false);
    const [workNotes, setWorkNotes] = useState('');

    // Fetch active shift on component mount
    useEffect(() => {
        fetchCurrentShift();
    }, []);

    const fetchCurrentShift = async () => {
        try {
            const response = await axios.get('/api/shifts/current');
            setActiveShift(response.data.activeShift);
        } catch (err) {
            console.error('Error fetching current shift:', err);
            setError(err.response?.data?.error || 'Failed to fetch current shift');
        }
    };

    const startShift = async () => {
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post('/api/shifts/start');
            setActiveShift(response.data.shift);
            setSuccessMessage('Shift started successfully!');
        } catch (err) {
            console.error('Error starting shift:', err);
            setError(err.response?.data?.error || 'Failed to start shift');
        } finally {
            setIsLoading(false);
        }
    };

    const openEndShiftModal = () => {
        setShowEndShiftModal(true);
        setError(null);
    };

    const closeEndShiftModal = () => {
        setShowEndShiftModal(false);
        setWorkNotes('');
    };

    const endShift = async () => {
        // Validate work notes
        if (!workNotes.trim()) {
            setError('Please provide notes about the work you did during this shift');
            return;
        }

        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await axios.post('/api/shifts/end', {
                notes: workNotes
            });

            setActiveShift(null);
            setSuccessMessage('Shift ended successfully!');
            setShowEndShiftModal(false);
            setWorkNotes('');
        } catch (err) {
            console.error('Error ending shift:', err);
            setError(err.response?.data?.error || 'Failed to end shift');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDateTime = (dateString) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="bg-white text-gray-800 p-4 rounded-lg shadow-sm border border-gray-200">
            {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg flex items-center text-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {successMessage}
                </div>
            )}

            {activeShift ? (
                <div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg mb-4">
                        <div className="flex items-center mb-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                            <p className="font-medium text-blue-600">Active Shift</p>
                        </div>
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-sm text-gray-500">Started</p>
                                <p className="text-md font-medium">{formatDateTime ? formatDateTime(activeShift.start_time) : "10:30 AM"}</p>
                            </div>
                            <div className="bg-blue-100 p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={openEndShiftModal}
                        disabled={isLoading}
                        className="mt-2 bg-white text-gray-700 border border-gray-300 py-2 px-4 w-full rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium hover:bg-gray-50"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                        </svg>
                        {isLoading ? 'Ending...' : 'End Shift'}
                    </button>
                </div>
            ) : (
                <button
                    onClick={startShift}
                    disabled={isLoading}
                    className="bg-blue-500 text-white w-full py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 font-medium hover:bg-blue-600"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    {isLoading ? 'Starting...' : 'Start Shift'}
                </button>
            )}

            {/* End Shift Modal */}
            {showEndShiftModal && (
                <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-4 w-full max-w-md mx-4 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-medium text-gray-800">End Shift</h3>
                            <button
                                onClick={closeEndShiftModal}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        <p className="mb-4 text-gray-500 text-sm">Please provide details about the work you did during this shift.</p>

                        <div className="mb-3">
                            <label htmlFor="workNotes" className="block mb-1 text-sm font-medium text-gray-700">Work Notes</label>
                            <textarea
                                id="workNotes"
                                value={workNotes}
                                onChange={(e) => setWorkNotes(e.target.value)}
                                placeholder="Describe tasks completed, achievements, challenges faced, etc."
                                className="w-full h-24 p-2 border rounded-lg bg-white border-gray-300 text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-400 text-sm"
                                required
                            ></textarea>

                            {error && error.includes('notes') && (
                                <p className="mt-1 text-xs text-red-500">{error}</p>
                            )}
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={endShift}
                                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-1 font-medium text-sm flex-1"
                                disabled={isLoading}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                {isLoading ? 'Processing...' : 'End Shift'}
                            </button>
                            <button
                                onClick={closeEndShiftModal}
                                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 text-sm"
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StartEndShiftComponent;