"use client";
import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';
import UserNavigation from '../lib/navigation';
import TaskListComponent from '../../components/TaskListComponent/TaskListComponent.js';

export default function MyTasksPage() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = Cookies.get('user_session_token');
        const tasksResponse = await fetch('/api/users/readtask/', { 
          credentials: 'include',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tasksResponse.ok) {
          const data = await tasksResponse.json();
          setTasks(data.tasks || []);
        } else if (tasksResponse.status === 401) {
          toast.error('Session expired. Please log in again.');
        } else {
          toast.error('Failed to load tasks');
        }
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
        toast.error('Connectivity issue. Failed to load tasks.');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  return (
    <UserNavigation>
      <div className="animate-in fade-in duration-500 card bg-white">
         <TaskListComponent tasks={tasks} />
      </div>
    </UserNavigation>
  );
}
