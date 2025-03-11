"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import StartEndShiftComponent from './components/StartEndShiftComponent/StartEndShiftComponent.js';
import CurrentShiftComponent from './components/CurrentShiftComponent/CurrentShiftComponent.js';
import ShiftHistoryComponent from './components/ShiftHistoryComponent/ShiftHistoryComponent.js';
import CompletedShiftDaysComponent from './components/CompletedShiftDaysComponent/CompletedShiftDaysComponent';
import { LogOut } from 'lucide-react';
import TaskListComponent from './components/TaskListComponent/TaskListComponent.js';
import Footer from './components/Footer/Footer.js';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [workNotes, setWorkNotes] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Fetch user details and tasks on component mount
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // Get user details from session using the cookie token
        const userResponse = await fetch('/api/users/me', {
          headers: {
            'Authorization': `Bearer ${Cookies.get('user_session_token')}`
          }
        });

        if (!userResponse.ok) {
          throw new Error('Failed to fetch user details');
        }

        const userData = await userResponse.json();
        setUser(userData.user);

        // Fetch tasks for the user
        const response = await fetch('/api/users/readtask/', {
          method: 'GET',
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        setTasks(data.tasks);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, []);

  const handleLogout = () => {
    setShowLogoutPopup(true);
  };

  const confirmLogout = async () => {
    try {
      const res = await fetch('/api/users/signout', { method: 'POST' });
      if (res.ok) {
        router.push('/user');
      } else {
        console.error('Failed to sign out');
      }
    } catch (err) {
      console.error('Error during logout:', err);
    }
  };

  const closePopup = () => {
    setShowLogoutPopup(false);
    setWorkNotes('');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white backdrop-blur-md bg-opacity-50">
        <p className="text-lg  font-bold">
          Loading your workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
        <p className="text-lg text-red-600">Error: {error}</p>
        <button
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={() => router.push('/user')}
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <header className="p-4 px-4 flex justify-between items-center w-full">
        <div className="container mx-auto flex gap-2 items-center">

          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <h1 className="text-lg font-medium text-black">
                Hello {user?.name || 'User'}! 👋
              </h1>
              <p className="text-gray-600 text-sm">Welcome to your workspace!</p>
            </div>

          </div>
        </div>
        <button
          className="text-gray-600 hover:text-red-600"
          onClick={handleLogout}
        >
          <LogOut size={20} />
        </button>
      </header>

      {/* Navigation Tabs */}
      <div className="w-full mt-4">
        <div className="flex justify-between items-center gap-2 px-4">
          <button
            className={`py-1.5 px-1 w-full ${activeTab === 'dashboard' ? 'border rounded-full bg-[#212529] text-white ' : 'text-gray-600 bg-gray-100 rounded-full'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>

          <button
            className={`py-1.5 px-1 w-full ${activeTab === 'tasks' ? 'border rounded-full bg-[#212529] text-white ' : 'text-gray-600 bg-gray-100 rounded-full'}`}
            onClick={() => setActiveTab('tasks')}
          >
            Tasks
          </button>
          {/* <button
            className={`py-3  px-2 ${activeTsab === 'shifts' ? 'border-b-2 border-blue-500 text-blue-600 font-medium' : 'text-gray-600'}`}
            onClick={() => setActiveTab('shifts')}
          >
            Shifts
          </button> */}
          <button
            className={`py-1.5 px-1 w-full ${activeTab === 'history' ? 'border rounded-full bg-[#212529] text-white ' : 'text-gray-600 bg-gray-100 rounded-full'}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>

        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto p-4">
        {activeTab === 'dashboard' && (
          <>
            {/* Search Bar
            <div className="mb-6">
              <div className="relative rounded-md text-black border border-gray-300 flex items-center">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search Space" 
                  className="block w-full pl-10 pr-3 py-3 border-none rounded-md focus:outline-none focus:ring-0"
                />
              </div>
            </div> */}

            <div className="flex flex-col gap-4">
              <div className="w-full">
                <StartEndShiftComponent />
              </div>
              <div className="w-full">
                <CurrentShiftComponent />
              </div>


            </div>
            <CompletedShiftDaysComponent />



            {/* Task List */}

          </>
        )}



        {activeTab === 'shifts' && (
          <div className="bg-white ">
            <div className="flex flex-col gap-4">
              <div className="w-full">
                <CurrentShiftComponent />
              </div>
              <div className="w-full">
                <StartEndShiftComponent />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="bg-white">
            <TaskListComponent tasks={tasks} />
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white">
            <ShiftHistoryComponent />
          </div>
        )}
      </main>

      {/* Logout Popup */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-sm mx-4 ">


            <div className="text-center mb-5">

              <h3 className="text-lg font-medium text-white">Are you sure you want to logout?</h3>
            </div>

            <div className="flex space-x-3">
              <button
                className="flex-1 py-2 border border-gray-300 rounded-md text-white font-medium hover:bg-gray-50"
                onClick={closePopup}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-2 bg-blue-600  text-white rounded-md font-medium"
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}