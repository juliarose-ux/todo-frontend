import { useEffect, useState } from "react";
import axios from "axios";

//const API_URL = "http://127.0.0.1:8000/api/tasks/"; // ✅ Django backend
const API_URL = "http://35.154.153.163//api/tasks/";
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDate, setNewTaskDate] = useState("");

  // Load tasks on mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await axios.get(API_URL);
      setTasks(res.data);
    } catch (err) {
      console.error("Error fetching tasks:", err);
    }
  };

  const addTask = async (e) => {
  e.preventDefault();
  if (!newTaskTitle || !newTaskDate) {
    return alert("Please enter title and due date");
  }

  try {
    await axios.post(API_URL, {
      title: newTaskTitle,
      status: "Pending",
      due_date: newTaskDate,  // ✅ match Django model field
    });
    setNewTaskTitle("");
    setNewTaskDate("");
    fetchTasks();
  } catch (err) {
    console.error("Error adding task:", err.response?.data || err.message);
    alert("Failed to add task");
  }
};

  // Delete task
const deleteTask = async (id) => {
  try {
    await axios.delete(`${API_URL}${id}/`);
    fetchTasks();
  } catch (err) {
    console.error("Error deleting task:", err.response?.data || err.message);
  }
};
  // Update status
const updateTaskStatus = async (id, status) => {
  try {
    await axios.patch(`${API_URL}${id}/`, { status });
    fetchTasks();
  } catch (err) {
    console.error("Error updating status:", err.response?.data || err.message);
  }
};

  // Apply filters + search
  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "All" || task.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-indigo-100 py-10">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <h1 className="text-4xl font-bold text-center text-indigo-700 mb-10">
          ✨ Todo App
        </h1>

        {/* Search + Filters */}
        <div className="bg-white shadow rounded-xl p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-400"
            />

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {["All", "Pending", "In Progress", "Completed"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                    filterStatus === status
                      ? "bg-indigo-500 text-white shadow"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Add Task */}
        <form
          onSubmit={addTask}
          className="bg-white shadow rounded-xl p-5 mb-8 flex flex-col md:flex-row gap-3"
        >
          <input
            type="text"
            placeholder="Task title"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2"
          />
          <input
            type="date"
            value={newTaskDate}
            onChange={(e) => setNewTaskDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2"
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-2 rounded-lg shadow hover:scale-105 transition"
          >
            Add
          </button>
        </form>

        {/* Task List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <p className="text-center text-gray-500 italic">No tasks found ✨</p>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                className="bg-white shadow rounded-xl p-5 flex justify-between items-center hover:shadow-md transition"
              >
                {/* Task Details */}
                <div>
                  <h2 className="font-semibold text-lg text-gray-800">{task.title}</h2>
                  <p className="text-sm text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                      task.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : task.status === "In Progress"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {task.status}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded-lg shadow hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
