"use client";
import UserNavigation from '../lib/navigation';
import ShiftHistoryComponent from '../../components/ShiftHistoryComponent/ShiftHistoryComponent.js';

export default function ShiftLogsPage() {
  return (
    <UserNavigation>
      <div className="animate-in fade-in duration-500 card bg-white">
         <ShiftHistoryComponent />
      </div>
    </UserNavigation>
  );
}
