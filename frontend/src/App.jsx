import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState('');

  // 1. READ (CRUD) & CRASH PROTECTION FIX
  const fetchTasks = async () => {
    try {
      const url = filterStatus ? `${API_URL}?status=${filterStatus}` : API_URL;
      const res = await axios.get(url);
      
      // Strict array check prevents any white screen crashes
      if (Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
        showNotification('Invalid response from the server database.');
      }
    } catch (err) {
      setTasks([]); // Fallback to safe empty array to keep UI rendering
      showNotification('Backend server is waking up. Please wait 10 seconds.');
    }
  };

  // Automatically fetch tasks whenever the user changes the status filter
  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  // Bonus feature: Custom banner notification triggers
  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // 2. CREATE & UPDATE (CRUD) WITH STATE REFRESH FIX
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        // Update an existing task
        await axios.put(`${API_URL}/${editingTask._id}`, taskData);
        showNotification('Task updated successfully!');
      } else {
        // Create a brand new task
        await axios.post(API_URL, taskData);
        showNotification('Task added successfully!');
      }
      setEditingTask(null);
      fetchTasks(); // The fix: Forces frontend to download fresh synced data immediately
    } catch (err) {
      showNotification('Error processing task. Please check server logs.');
    }
  };

  // 3. DELETE (CRUD) WITH STATE REFRESH FIX
  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to permanently delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showNotification('Task deleted successfully.');
        fetchTasks(); // The fix: Automatically re-syncs the frontend view
      } catch (err) {
        showNotification('Error deleting task.');
      }
    }
  };

  // Dynamic visual enhancement styles for urgency badges
  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High': return { background: '#ffebee', color: '#c62828' };
      case 'Medium': return { background: '#fff3e0', color: '#ef6c00' };
      default: return { background: '#e8f5e9', color: '#2e7d32' };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      
      {/* Dynamic Header & Notification Toast Bar */}
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#333' }}>Task Tracker Dashboard</h1>
        {notification && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '12px', borderRadius: '6px', marginBottom: '15px', border: '1px solid #c3e6cb', fontWeight: 'bold' }}>
            {notification}
          </div>
        )}
      </header>

      {/* Grid container layout handles responsive resizing seamlessly across devices */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        
        {/* Left Side: Modular input Form & Workspace Filter Control */}
        <div>
          <TaskForm onSave={handleSaveTask} currentTask={editingTask} setEditingTask={setEditingTask} />
          
          <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px' }}>Filter by Status: </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>
              <option value="">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        {/* Right Side: Reactive Task Card List Loop Output */}
        <div>
          <h3 style={{ marginTop: 0, color: '#444' }}>Your Tasks ({tasks.length})</h3>
          
          {tasks.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', padding: '30px', textAlign: 'center', background: '#fafafa', borderRadius: '6px', border: '1px dashed #ccc' }}>
              No tasks found in this section. Add a task to populate your workflow board!
            </p>
          ) : (
            tasks.map(task => (
              <div key={task._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', marginBottom: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', background: '#fff' }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0, fontSize: '16px', color: '#222' }}>{task.title}</h4>
                  <div>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', marginRight: '5px', fontWeight: 'bold', ...getPriorityBadgeStyle(task.priority) }}>
                      {task.priority}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', background: '#e2e3e5', color: '#333', fontWeight: 'bold' }}>
                      {task.status}
                    </span>
                  </div>
                </div>

                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 12px 0', lineHeight: '1.4' }}>
                  {task.description || 'No additional details provided.'}
                </p>

                <div style={{ textAlign: 'right', borderTop: '1px solid #f9f9f9', paddingTop: '8px' }}>
                  <button onClick={() => setEditingTask(task)} style={{ marginRight: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
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

export default App;
