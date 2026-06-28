import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TaskForm from './components/TaskForm';

const API_URL = import.meta.env.VITE_API_URL;

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');
  const [notification, setNotification] = useState('');

  // Fetch tasks with white-screen protection guard
  const fetchTasks = async () => {
    try {
      const url = filterStatus ? `${API_URL}?status=${filterStatus}` : API_URL;
      const res = await axios.get(url);
      
      // CRASH PROTECTION: Ensures state only updates if response data is a valid array
      if (Array.isArray(res.data)) {
        setTasks(res.data);
      } else {
        setTasks([]);
        showNotification('Failed to read tasks list layout structure.');
      }
    } catch (err) {
      setTasks([]); // Fallback keeps UI container frame active instead of going white
      showNotification('Backend server is waking up. Please wait 10 seconds and try again.');
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filterStatus]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  // Create or Update task
  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        const res = await axios.put(`${API_URL}/${editingTask._id}`, taskData);
        setTasks(tasks.map(t => t._id === editingTask._id ? res.data : t));
        setEditingTask(null);
        showNotification('Task updated successfully!');
      } else {
        const res = await axios.post(API_URL, taskData);
        setTasks([res.data, ...tasks]);
        showNotification('Task added successfully!');
      }
    } catch (err) {
      showNotification('Error processing request. Check connection.');
    }
  };

  // Delete task
  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTasks(tasks.filter(t => t._id !== id));
        showNotification('Task deleted successfully.');
      } catch (err) {
        showNotification('Error deleting task.');
      }
    }
  };

  const getPriorityBadgeStyle = (priority) => {
    switch (priority) {
      case 'High': return { background: '#ffebee', color: '#c62828' };
      case 'Medium': return { background: '#fff3e0', color: '#ef6c00' };
      default: return { background: '#e8f5e9', color: '#2e7d32' };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1>Task Tracker Dashboard</h1>
        {notification && (
          <div style={{ background: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
            {notification}
          </div>
        )}
      </header>

      {/* Grid container configuration auto-stacks components cleanly onto mobile screens */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '30px' }}>
        <div>
          <TaskForm onSave={handleSaveTask} currentTask={editingTask} setEditingTask={setEditingTask} />
          
          <div style={{ marginTop: '20px', background: '#f9f9f9', padding: '15px', borderRadius: '6px', border: '1px solid #eee' }}>
            <label style={{ fontWeight: 'bold' }}>Filter by Status: </label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ width: '100%', padding: '8px', marginTop: '5px', borderRadius: '4px' }}>
              <option value="">All Tasks</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <div>
          <h3>Your Tasks ({tasks.length})</h3>
          {tasks.length === 0 ? (
            <p style={{ color: '#888', fontStyle: 'italic', padding: '20px', textAlign: 'center', background: '#fafafa', borderRadius: '4px' }}>
              No tasks found.
            </p>
          ) : (
            tasks.map(task => (
              <div key={task._id} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '6px', marginBottom: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', background: '#fff' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <h4 style={{ margin: 0 }}>{task.title}</h4>
                  <div>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', marginRight: '5px', fontWeight: 'bold', ...getPriorityBadgeStyle(task.priority) }}>
                      {task.priority}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '12px', fontSize: '12px', background: '#e2e3e5', fontWeight: 'bold' }}>
                      {task.status}
                    </span>
                  </div>
                </div>
                <p style={{ color: '#666', fontSize: '14px', margin: '0 0 10px 0' }}>{task.description}</p>
                <div style={{ textAlign: 'right', borderTop: '1px solid #f9f9f9', paddingTop: '8px' }}>
                  <button onClick={() => setEditingTask(task)} style={{ marginRight: '15px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontWeight: 'bold' }}>Edit</button>
                  <button onClick={() => handleDeleteTask(task._id)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontWeight: 'bold' }}>Delete</button>
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
