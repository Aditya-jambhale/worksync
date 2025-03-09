"use client";
import React from "react";

export default function TaskListComponent({ tasks }) {
  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="w-full">
      <h2 className="text-lg font-bold mb-4 text-gray-900">Your Task Inbox</h2>

      {tasks && tasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks
            .slice()
            .sort((a, b) => new Date(b.createdat) - new Date(a.createdat))
            .map((task, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow transition-all duration-200"
              >
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">
                    {formatDate ? formatDate(task.createdat) : "Today, 2:30 PM"}
                  </span>
                  {/* <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    task.status === "Completed"
                      ? "bg-green-100 text-green-700 border border-green-200"
                      : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                  }`}
                >
                  {task.status || "Pending"}
                </span> */}
                </div>
                <p className="text-gray-700 mt-3 text-sm">{task.taskdescription || "Complete the weekly report and submit it to the team lead"}</p>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl">🎉</span>
          </div>
          <p className="text-xl font-medium text-gray-800">
            No tasks today, enjoy your day!
          </p>
          <p className="mt-2 text-gray-500">
            Time to focus on your personal development or help others.
          </p>
          <button className="mt-6 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm">
            Create New Task
          </button>
        </div>
      )}
    </div>
  );
}
