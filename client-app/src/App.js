import React, { useState, useEffect, useCallback } from "react";

// Utility function to format time
const formatTime = (seconds) => {
  if (seconds < 0) seconds = 0; // Ensure non-negative
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [];
  if (h > 0) parts.push(h < 10 ? "0" + h : h);
  parts.push(m < 10 ? "0" + m : m);
  parts.push(s < 10 ? "0" + s : s);

  return parts.join(":");
};

// Local Storage Helper Functions
const LOCAL_STORAGE_TASKS_KEY = "taskTracker_tasks";
const LOCAL_STORAGE_HISTORY_KEY = "taskTracker_history";

const loadTasksFromLocalStorage = () => {
  try {
    const tasksJson = localStorage.getItem(LOCAL_STORAGE_TASKS_KEY);
    return tasksJson ? JSON.parse(tasksJson) : [];
  } catch (error) {
    console.error("Error loading tasks from local storage:", error);
    return [];
  }
};

const saveTasksToLocalStorage = (tasks) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_TASKS_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Error saving tasks to local storage:", error);
  }
};

const loadHistoryFromLocalStorage = () => {
  try {
    const historyJson = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    // Parse timestamps back to Date objects if needed, or keep as numbers
    const history = historyJson ? JSON.parse(historyJson) : [];
    // Ensure timestamps are numbers for sorting consistency
    return history.map((entry) => ({
      ...entry,
      timestamp:
        typeof entry.timestamp === "number"
          ? entry.timestamp
          : new Date(entry.timestamp).getTime(),
    }));
  } catch (error) {
    console.error("Error loading history from local storage:", error);
    return [];
  }
};

const saveHistoryToLocalStorage = (history) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Error saving history to local storage:", error);
  }
};

// TaskForm Component
const TaskForm = ({ onAddTask, message }) => {
  const [taskName, setTaskName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (taskName.trim()) {
      onAddTask(taskName.trim());
      setTaskName("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 p-5 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl shadow-lg"
    >
      <input
        type="text"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        placeholder="Enter new task name..."
        className="flex-grow p-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-3 focus:ring-blue-300 transition duration-200 text-gray-800 placeholder-gray-400"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
      >
        Add Task
      </button>
    </form>
  );
};

// TaskTracker Component
const TaskTracker = ({
  allTasks,
  onTaskSelect,
  selectedTask,
  onStartStop,
  isTracking,
  timeElapsed,
  message,
}) => {
  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl mb-8 border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Current Activity
      </h2>

      {/* Task Selection */}
      <div className="mb-6">
        <label
          htmlFor="task-select"
          className="block text-gray-700 text-lg font-semibold mb-2"
        >
          Choose a Task:
        </label>
        <div className="relative">
          <select
            id="task-select"
            value={selectedTask ? selectedTask.id : ""}
            onChange={(e) => onTaskSelect(e.target.value)}
            className="block w-full p-3 pr-10 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-800 appearance-none focus:outline-none focus:ring-3 focus:ring-blue-400 cursor-pointer transition duration-200"
          >
            <option value="" disabled>
              -- Select or add a task --
            </option>
            {allTasks.map((task) => (
              <option key={task.id} value={task.id}>
                {task.name}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg
              className="fill-current h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
            >
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>
      </div>

      {selectedTask && (
        <div className="text-center mb-8">
          <p className="text-xl text-gray-700 mb-3">
            Tracking:{" "}
            <span className="font-bold text-blue-600">{selectedTask.name}</span>
          </p>
          <p className="text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
            {formatTime(timeElapsed)}
          </p>
          <button
            onClick={onStartStop}
            className={`w-full py-4 rounded-xl text-white font-extrabold text-2xl shadow-xl transition duration-300 ease-in-out transform hover:scale-105 active:scale-95
                            ${
                              isTracking
                                ? "bg-red-600 hover:bg-red-700"
                                : "bg-green-600 hover:bg-green-700"
                            }`}
          >
            {isTracking ? "Stop Tracking" : "Start Tracking"}
          </button>
        </div>
      )}
      {!selectedTask && (
        <p className="text-center text-gray-500 text-lg py-10">
          Select a task above or add a new one to begin tracking.
        </p>
      )}
    </div>
  );
};

// HistoryView Component
const HistoryView = ({ history }) => {
  const groupedHistory = history.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedHistory).sort(
    (a, b) => new Date(b) - new Date(a)
  );

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Activity History
      </h2>
      {sortedDates.length === 0 && (
        <p className="text-gray-500 text-center text-lg py-10">
          No activity recorded yet. Start tracking to see your history!
        </p>
      )}
      <div className="space-y-6">
        {sortedDates.map((date) => (
          <div key={date} className="bg-gray-50 p-6 rounded-lg shadow-inner">
            <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 border-gray-200">
              {date}
            </h3>
            <ul className="space-y-3">
              {groupedHistory[date].map((entry, index) => (
                <li
                  key={entry.id || index}
                  className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-100"
                >
                  <span className="text-gray-800 font-medium text-lg">
                    {entry.taskName}
                  </span>
                  <span className="text-blue-600 font-bold text-lg">
                    {formatTime(entry.duration)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// AnalyticsView Component
const AnalyticsView = ({ history, allTasks }) => {
  // Calculate total time tracked
  const totalTimeTracked = history.reduce(
    (sum, entry) => sum + entry.duration,
    0
  );

  // Calculate time spent per task
  const taskBreakdown = history.reduce((acc, entry) => {
    acc[entry.taskName] = (acc[entry.taskName] || 0) + entry.duration;
    return acc;
  }, {});

  // Calculate daily totals for average daily time
  const dailyTotals = history.reduce((acc, entry) => {
    const date = new Date(entry.timestamp).toISOString().split("T")[0]; // YYYY-MM-DD
    acc[date] = (acc[date] || 0) + entry.duration;
    return acc;
  }, {});

  const numberOfDaysTracked = Object.keys(dailyTotals).length;
  const averageDailyTime =
    numberOfDaysTracked > 0 ? totalTimeTracked / numberOfDaysTracked : 0;

  // Sort tasks by most time spent
  const sortedTaskBreakdown = Object.entries(taskBreakdown).sort(
    ([, a], [, b]) => b - a
  );

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Your Productivity Dashboard
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-500 text-center text-lg py-10">
          No data to analyze yet. Start tracking your activities!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Total Time Tracked */}
          <div className="bg-blue-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-blue-700 mb-2">
              Total Time Tracked
            </p>
            <p className="text-4xl font-extrabold text-blue-800">
              {formatTime(totalTimeTracked)}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              (Across all tasks and sessions)
            </p>
          </div>

          {/* Average Daily Time */}
          <div className="bg-green-50 p-6 rounded-lg shadow-md flex flex-col items-center justify-center text-center">
            <p className="text-sm font-semibold text-green-700 mb-2">
              Average Daily Tracking
            </p>
            <p className="text-4xl font-extrabold text-green-800">
              {formatTime(averageDailyTime)}
            </p>
            <p className="text-xs text-green-600 mt-1">
              (Over {numberOfDaysTracked} active days)
            </p>
          </div>
        </div>
      )}

      {/* Task Breakdown */}
      {sortedTaskBreakdown.length > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner mb-8">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 border-gray-200">
            Time Spent Per Task
          </h3>
          <ul className="space-y-3">
            {sortedTaskBreakdown.map(([taskName, duration]) => (
              <li
                key={taskName}
                className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-100"
              >
                <span className="text-gray-800 font-medium text-lg">
                  {taskName}
                </span>
                <span className="text-purple-600 font-bold text-lg">
                  {formatTime(duration)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Daily Breakdown (similar to CalendarView but within Analytics) */}
      {numberOfDaysTracked > 0 && (
        <div className="bg-gray-50 p-6 rounded-lg shadow-inner">
          <h3 className="text-xl font-bold text-gray-700 mb-4 border-b pb-2 border-gray-200">
            Daily Activity Overview
          </h3>
          <ul className="space-y-3">
            {Object.keys(dailyTotals)
              .sort((a, b) => new Date(b) - new Date(a))
              .map((date) => (
                <li
                  key={date}
                  className="flex justify-between items-center bg-white p-4 rounded-md shadow-sm border border-gray-100"
                >
                  <span className="text-gray-800 font-medium text-lg">
                    {new Date(date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="text-orange-600 font-bold text-lg">
                    {formatTime(dailyTotals[date])}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// SettingsView Component for Import/Export
const SettingsView = ({ onImportData, onExportData, message }) => {
  const fileInputRef = React.useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target.result);
          onImportData(importedData);
        } catch (error) {
          console.error("Error parsing imported file:", error);
          alert("Invalid JSON file. Please ensure it's a valid export file."); // Using alert for simplicity here, would be a custom modal in production
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="p-8 bg-white rounded-xl shadow-2xl border border-gray-100">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        Settings & Data Management
      </h2>

      <div className="space-y-6">
        {/* Export Data */}
        <div className="bg-blue-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-blue-700 mb-3">
            Export Your Data
          </h3>
          <p className="text-gray-700 mb-4">
            Download all your tasks and activity history as a JSON file. This is
            useful for backups or moving data between devices.
          </p>
          <button
            onClick={onExportData}
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold shadow-md hover:bg-blue-700 focus:outline-none focus:ring-3 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
          >
            Export Data to JSON
          </button>
        </div>

        {/* Import Data */}
        <div className="bg-green-50 p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-bold text-green-700 mb-3">
            Import Your Data
          </h3>
          <p className="text-gray-700 mb-4">
            Upload a previously exported JSON file to restore your tasks and
            history. This will overwrite existing data.
          </p>
          <input
            type="file"
            accept=".json"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden" // Hide the default file input
          />
          <button
            onClick={() => fileInputRef.current.click()}
            className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 focus:outline-none focus:ring-3 focus:ring-green-500 focus:ring-offset-2 transition duration-200 transform hover:scale-105"
          >
            Import Data from JSON
          </button>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState("tracker"); // 'tracker', 'history', 'analytics', 'settings'
  const [allTasks, setAllTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [intervalId, setIntervalId] = useState(null);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");

  // Load data from local storage on initial mount
  useEffect(() => {
    setAllTasks(loadTasksFromLocalStorage());
    setHistory(loadHistoryFromLocalStorage());
  }, []);

  // Save tasks to local storage whenever allTasks changes
  useEffect(() => {
    saveTasksToLocalStorage(allTasks);
  }, [allTasks]);

  // Save history to local storage whenever history changes
  useEffect(() => {
    saveHistoryToLocalStorage(history);
  }, [history]);

  // Timer logic
  useEffect(() => {
    if (isTracking && startTime !== null) {
      const id = setInterval(() => {
        setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      setIntervalId(id);
    } else {
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isTracking, startTime]);

  const handleAddTask = useCallback(
    (taskName) => {
      // Check if task already exists
      const taskExists = allTasks.some(
        (task) => task.name.toLowerCase() === taskName.toLowerCase()
      );
      if (taskExists) {
        setMessage(`Task "${taskName}" already exists!`);
        setTimeout(() => setMessage(""), 3000);
        return;
      }

      const newTask = {
        id: crypto.randomUUID(), // Generate unique ID for offline
        name: taskName,
        createdAt: Date.now(), // Timestamp for creation
      };
      setAllTasks((prevTasks) => [...prevTasks, newTask]);
      setMessage(`Task "${taskName}" added successfully!`);
      setTimeout(() => setMessage(""), 3000);
    },
    [allTasks]
  );

  const handleTaskSelect = useCallback(
    (taskId) => {
      if (isTracking) {
        setMessage("Please stop the current task before selecting a new one.");
        setTimeout(() => setMessage(""), 3000);
        return;
      }
      const task = allTasks.find((t) => t.id === taskId);
      setSelectedTask(task);
      setTimeElapsed(0); // Reset timer for new task
    },
    [isTracking, allTasks]
  );

  const handleStartStop = useCallback(() => {
    if (!selectedTask) {
      setMessage("Please select a task first.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    if (isTracking) {
      // Stop tracking
      setIsTracking(false);
      if (intervalId) {
        clearInterval(intervalId);
        setIntervalId(null);
      }

      // Record the entry to history
      if (timeElapsed > 0) {
        const newHistoryEntry = {
          id: crypto.randomUUID(), // Unique ID for history entry
          taskId: selectedTask.id,
          taskName: selectedTask.name,
          duration: timeElapsed,
          timestamp: Date.now(), // Record current timestamp
        };
        setHistory((prevHistory) => {
          const updatedHistory = [...prevHistory, newHistoryEntry];
          // Sort in memory by timestamp descending for display
          updatedHistory.sort((a, b) => b.timestamp - a.timestamp);
          return updatedHistory;
        });
        setMessage(
          `Recorded ${selectedTask.name} for ${formatTime(timeElapsed)}.`
        );
        setTimeout(() => setMessage(""), 3000);
      }
      setTimeElapsed(0); // Reset for next start
      setStartTime(null);
    } else {
      // Start tracking
      setStartTime(Date.now());
      setIsTracking(true);
      setMessage(`Started tracking: ${selectedTask.name}`);
      setTimeout(() => setMessage(""), 3000);
    }
  }, [isTracking, selectedTask, timeElapsed, intervalId]);

  const handleExportData = useCallback(() => {
    const dataToExport = {
      tasks: allTasks,
      history: history,
    };
    const jsonString = JSON.stringify(dataToExport, null, 2); // Pretty print JSON

    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `activity_tracker_data_${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setMessage("Data exported successfully!");
    setTimeout(() => setMessage(""), 3000);
  }, [allTasks, history]);

  const handleImportData = useCallback((importedData) => {
    if (
      importedData &&
      Array.isArray(importedData.tasks) &&
      Array.isArray(importedData.history)
    ) {
      // Basic validation
      setAllTasks(importedData.tasks);
      // Ensure history timestamps are numbers for consistency after import
      const cleanedHistory = importedData.history.map((entry) => ({
        ...entry,
        timestamp:
          typeof entry.timestamp === "number"
            ? entry.timestamp
            : new Date(entry.timestamp).getTime(),
      }));
      setHistory(cleanedHistory.sort((a, b) => b.timestamp - a.timestamp)); // Sort after import
      setMessage("Data imported successfully! Existing data was overwritten.");
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(
        "Error: Invalid import file structure. Please ensure it contains 'tasks' and 'history' arrays."
      );
      setTimeout(() => setMessage(""), 5000);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 font-inter antialiased flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
        {/* Header and Nav */}
        <header className="bg-gradient-to-r from-blue-700 to-purple-700 p-8 text-white shadow-lg rounded-t-3xl">
          <h1 className="text-5xl font-extrabold text-center mb-4 tracking-tight">
            My Activity Tracker
          </h1>
          <p className="text-center text-blue-100 text-lg opacity-90 mb-6">
            Track your work, play, and everything in between.
          </p>
          <nav className="mt-6 flex flex-wrap justify-center gap-3 sm:gap-6">
            <button
              onClick={() => setCurrentPage("tracker")}
              className={`px-6 py-3 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md
                                ${
                                  currentPage === "tracker"
                                    ? "bg-white text-blue-800"
                                    : "bg-blue-600 text-white hover:bg-blue-500"
                                }`}
            >
              Tracker
            </button>
            <button
              onClick={() => setCurrentPage("history")}
              className={`px-6 py-3 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md
                                ${
                                  currentPage === "history"
                                    ? "bg-white text-blue-800"
                                    : "bg-blue-600 text-white hover:bg-blue-500"
                                }`}
            >
              History
            </button>
            <button
              onClick={() => setCurrentPage("analytics")}
              className={`px-6 py-3 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md
                                ${
                                  currentPage === "analytics"
                                    ? "bg-white text-blue-800"
                                    : "bg-blue-600 text-white hover:bg-blue-500"
                                }`}
            >
              Analytics
            </button>
            <button
              onClick={() => setCurrentPage("settings")}
              className={`px-6 py-3 rounded-full font-semibold text-lg transition duration-300 ease-in-out transform hover:scale-105 shadow-md
                                ${
                                  currentPage === "settings"
                                    ? "bg-white text-blue-800"
                                    : "bg-blue-600 text-white hover:bg-blue-500"
                                }`}
            >
              Settings
            </button>
          </nav>
        </header>

        {/* Main Content Area */}
        <main className="p-8">
          {message && (
            <div
              className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg relative mb-8 shadow-md"
              role="alert"
            >
              <span className="block sm:inline font-medium">{message}</span>
            </div>
          )}

          {/* Task Form is always available */}
          <div className="mb-10">
            <TaskForm onAddTask={handleAddTask} message={message} />
          </div>

          {/* Page Content */}
          {(() => {
            switch (currentPage) {
              case "tracker":
                return (
                  <TaskTracker
                    allTasks={allTasks}
                    onTaskSelect={handleTaskSelect}
                    selectedTask={selectedTask}
                    onStartStop={handleStartStop}
                    isTracking={isTracking}
                    timeElapsed={timeElapsed}
                    message={message}
                  />
                );
              case "history":
                return <HistoryView history={history} />;
              case "analytics":
                return <AnalyticsView history={history} allTasks={allTasks} />;
              case "settings":
                return (
                  <SettingsView
                    onImportData={handleImportData}
                    onExportData={handleExportData}
                    message={message}
                  />
                );
              default:
                return null;
            }
          })()}
        </main>
      </div>
    </div>
  );
};

export default App;
