'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShiftHistoryComponent = () => {
  const [shifts, setShifts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 0,
    limit: 10,
    count: 0
  });
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchShiftHistory();
  }, [pagination.page, pagination.limit, statusFilter]);

  const fetchShiftHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit
      });

      if (statusFilter) {
        queryParams.append('status', statusFilter);
      }

      const response = await axios.get(`/api/shifts/history?${queryParams.toString()}`);

      setShifts(response.data.shifts);
      setPagination({
        ...pagination,
        count: response.data.count
      });
    } catch (err) {
      console.error('Error fetching shift history:', err);
      setError(err.response?.data?.error || 'Failed to fetch shift history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 'N/A';

    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;

    // Format as HH:MM:SS
    const hours = Math.floor(diffMs / 3600000).toString().padStart(2, '0');
    const minutes = Math.floor((diffMs % 3600000) / 60000).toString().padStart(2, '0');
    const seconds = Math.floor((diffMs % 60000) / 1000).toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
  };

  const handlePrevPage = () => {
    if (pagination.page > 0) {
      setPagination({
        ...pagination,
        page: pagination.page - 1
      });
    }
  };

  const handleNextPage = () => {
    if ((pagination.page + 1) * pagination.limit < pagination.count) {
      setPagination({
        ...pagination,
        page: pagination.page + 1
      });
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <h2 className="text-lg font-medium text-gray-700 mb-4">Shift History</h2>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="flex items-center">
          <label htmlFor="statusFilter" className="mr-2 text-gray-600 text-sm">Filter by status:</label>
          <select
            id="statusFilter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-gray-300 text-gray-700 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center text-sm">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <div className="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"></div>
          <p className="ml-2 text-gray-500 text-sm">Loading shift history...</p>
        </div>
      ) : shifts && shifts.length === 0 ? (
        <div className="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
          <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 text-sm">No shifts found.</p>
          <button className="mt-3 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm">
            Start Your First Shift
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Time</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Time</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {shifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-2 px-3 text-sm text-gray-700 font-mono">{shift.id}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{formatDateTime ? formatDateTime(shift.start_time) : "2023-04-15 09:00"}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{formatDateTime ? formatDateTime(shift.end_time) : "2023-04-15 17:00"}</td>
                    <td className="py-2 px-3 text-sm text-gray-700">{calculateDuration ? calculateDuration(shift.start_time, shift.end_time) : "8h 00m"}</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${shift.status === "active" ? "bg-green-100 text-green-600 border border-green-200" :
                          shift.status === "completed" ? "bg-blue-100 text-blue-600 border border-blue-200" :
                            "bg-yellow-100 text-yellow-600 border border-yellow-200"
                        }`}>
                        {shift.status || "active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 items-center justify-between">
            <div className="text-xs text-gray-500">
              Showing {pagination?.page * pagination?.limit + 1} - {Math.min((pagination?.page + 1) * pagination?.limit, pagination?.count)} of {pagination?.count || 0}
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePrevPage}
                disabled={!pagination || pagination.page === 0}
                className="px-3 py-1 text-sm bg-white text-gray-600 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>
              <button
                onClick={handleNextPage}
                disabled={!pagination || (pagination.page + 1) * pagination.limit >= pagination.count}
                className="px-3 py-1 bg-white text-sm text-gray-600 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors flex items-center gap-1"
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ShiftHistoryComponent;